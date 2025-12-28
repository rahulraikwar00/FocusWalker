import * as React from "react";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";

import L from "leaflet";
import {
  Settings,
  RotateCcw,
  Play,
  Pause,
  Search,
  User,
  Flame,
  Gauge,
  X,
  Map as MapIcon,
  Bell,
  Shield,
  Target,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import * as turf from "@turf/turf";
import { set } from "react-hook-form";
import { is } from "drizzle-orm";

const MapView = React.lazy(() =>
  import("@/components/MapContainer").then((module) => ({
    default: module.MapView,
  }))
);

// --- Constants & Defaults ---
const METERS_PER_STEP = 0.75;
const WALKING_SPEED_KMH = 5.0;
const DELHI_DEFAULT = new L.LatLng(28.6139, 77.209);

// --- Fixed Sub-Components ---

/**
 * StatNode: Uses defensive fallback for values
 */
function StatItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-4 border-x border-white/5">
      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-base font-bold tracking-tight text-white">
          {value || "0"}
        </span>
        <span className="text-[10px] font-bold text-[#BFFF04] uppercase opacity-80">
          {unit}
        </span>
      </div>
    </div>
  );
}

/**
 * MapController: Prevents map crashes during flyTo and click events
 */

// --- Main Logic Hook (Anti-Crash Version) ---

export function useRouteLogic(speedKmh: number) {
  const [points, setPoints] = useState<{
    start: L.LatLng | null;
    end: L.LatLng | null;
  }>({ start: null, end: null });
  const [route, setRoute] = useState<any>(null);
  const [currentPos, setCurrentPos] = useState<L.LatLng | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [metrics, setMetrics] = useState({
    steps: 0,
    timeLeft: 0,
    distDone: 0,
  });
  const [isLocked, setIsLocked] = useState(true); // Default to locked

  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef(0);

  // Speed converted to meters per second
  const speedMs = (speedKmh * 1000) / 3600;

  const fetchRoute = useCallback(
    async (start: L.LatLng, end: L.LatLng) => {
      if (!start || !end) return;
      setIsLoadingRoute(true);
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
        );
        const data = await res.json();

        if (data.code === "Ok" && data.routes?.length > 0) {
          const r = data.routes[0];
          setRoute({
            path: r.geometry.coordinates.map((c: any) => [c[1], c[0]]),
            line: turf.lineString(r.geometry.coordinates),
            distance: r.distance,
            duration: r.distance / speedMs,
          });
          setMetrics({
            steps: 0,
            timeLeft: Math.ceil(r.distance / speedMs),
            distDone: 0,
          });
        }
      } catch (err) {
        console.error("OSRM Route Error:", err);
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [speedMs]
  );

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (isActive) return;
    if (!points.start) {
      setPoints((p) => ({ ...p, start: e.latlng }));
      setCurrentPos(e.latlng);
    } else if (!points.end) {
      setPoints((p) => ({ ...p, end: e.latlng }));
      fetchRoute(points.start, e.latlng);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query || isActive) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      if (data?.length > 0) {
        const newLoc = new L.LatLng(
          parseFloat(data[0].lat),
          parseFloat(data[0].lon)
        );
        if (!points.start) {
          setPoints((p) => ({ ...p, start: newLoc }));
          setCurrentPos(newLoc);
        } else {
          setPoints((p) => ({ ...p, end: newLoc }));
          fetchRoute(points.start, newLoc);
        }
        return newLoc;
      }
    } catch (e) {
      console.error("Search Error:", e);
    }
  };

  // Safe Animation Loop
  useEffect(() => {
    if (!isActive || !route || !route.line) return;

    const frame = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Ensure we don't divide by zero
      const routeDist = route.distance || 1;
      progressRef.current = Math.min(
        progressRef.current + (delta * speedMs) / routeDist,
        1
      );

      const dDone = progressRef.current * routeDist;

      try {
        const pt = turf.along(route.line, dDone / 1000, {
          units: "kilometers",
        });
        const [lng, lat] = pt.geometry.coordinates;

        setCurrentPos(new L.LatLng(lat, lng));
        setProgress(progressRef.current);
        setMetrics({
          steps: Math.floor(dDone / METERS_PER_STEP),
          timeLeft: Math.ceil(
            (route.duration || 0) * (1 - progressRef.current)
          ),
          distDone: dDone,
        });
      } catch (e) {
        console.error("Animation Point Error:", e);
      }

      if (progressRef.current < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setIsActive(false);
        confetti();
      }
    };

    animRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animRef.current);
      lastTimeRef.current = 0;
    };
  }, [isActive, route, speedMs]);

  const reset = () => {
    setPoints({ start: null, end: null });
    setRoute(null);
    setCurrentPos(null);
    setIsActive(false);
    setProgress(0);
    progressRef.current = 0;
    lastTimeRef.current = 0;
    setMetrics({ steps: 0, timeLeft: 0, distDone: 0 });
  };

  return {
    points,
    route,
    currentPos,
    isActive,
    setIsActive,
    progress,
    metrics,
    handleMapClick,
    searchLocation,
    reset,
    isLoadingRoute,
    setIsLocked,
    isLocked,
  };
}

// --- Main Component ---

export default function FocusTacticalMap() {
  const [speedKmh, setSpeedKmh] = useState(WALKING_SPEED_KMH);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    points,
    route,
    currentPos,
    isActive,
    setIsActive,
    progress,
    metrics,
    handleMapClick,
    searchLocation,
    isLoadingRoute,
    reset,
    setIsLocked,
    isLocked,
  } = useRouteLogic(speedKmh);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0A0A0A] font-sans text-white">
      {/* 1. TOP HUD */}
      <div className="absolute top-[env(safe-area-inset-top,1.5rem)] left-0 w-full z-1000 px-6 flex justify-between pointer-events-none">
        <motion.div className="flex items-center gap-4 bg-[#141414]/90 backdrop-blur-md border border-white/10 p-2 pr-6 rounded-2xl pointer-events-auto">
          <div className="w-12 h-12 bg-[#BFFF04] rounded-xl flex items-center justify-center">
            <User className="text-black w-6 h-6" />
          </div>
          <div>
            <div className="flex gap-2">
              <span className="text-[10px] font-black opacity-50">
                OPERATOR
              </span>
              <span className="text-[#BFFF04] text-[10px] font-black">
                LVL 05
              </span>
            </div>
            <div className="text-lg font-black leading-none uppercase italic">
              Ghost_Walker
            </div>
          </div>
        </motion.div>
        <div className="flex flex-col gap-2 pointer-events-auto">
          <Button
            onClick={() => setIsSettingsOpen(true)}
            className="group w-12 h-12 rounded-xl bg-[#141414] border border-white/10 p-0 transition-all duration-300 hover:border-[#BFFF04]/50 hover:bg-[#1a1a1a] hover:shadow-[0_0_15px_rgba(191,255,4,0.2)]"
          >
            <Settings
              size={20}
              className="text-white/70 transition-colors duration-300 group-hover:text-[#BFFF04]"
            />
          </Button>
        </div>
      </div>
      {/* RECENTER / LOCK TOGGLE */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-4">
        <Button
          onClick={() => setIsLocked(!isLocked)}
          className={`w-14 h-14 rounded-2xl border transition-all shadow-xl ${
            isLocked
              ? "bg-[#BFFF04] border-[#BFFF04] text-black"
              : "bg-[#141414] border-white/10 text-white/40"
          }`}
        >
          <ZoomIn size={24} className={isLocked ? "animate-pulse" : ""} />
        </Button>
      </div>

      {/* 2. SEARCH */}
      {!isActive && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-1000 w-[calc(100%-2.5rem)] max-w-md">
          <div className="bg-[#141414]/95 backdrop-blur-md border border-white/10 rounded-2xl p-1 flex items-center gap-2">
            <Search size={18} className="ml-4 opacity-30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                searchQuery.trim() &&
                (searchLocation(searchQuery), setSearchQuery(""))
              }
              placeholder={
                !points.start ? "Search start..." : "Search destination..."
              }
              className="bg-transparent border-none outline-none text-sm w-full py-3"
            />
          </div>
        </div>
      )}

      {/* 3. MAP */}
      <Suspense fallback={<div className="bg-black h-full w-full" />}>
        <MapView
          DELHI_DEFAULT={DELHI_DEFAULT}
          handleMapClick={handleMapClick}
          currentPos={currentPos}
          isActive={isActive}
          points={points}
          route={route}
          isLocked={isLocked}
        />
      </Suspense>

      {/* 4. HUD CARD - MOBILE SAFE */}
      <div
        className="
  /* 1. Positioning */
  absolute 
  bottom-0 
  left-1/2 
  -translate-x-1/2 
  
  /* 2. Layering & Interaction */
  z-2000 
  pointer-events-none 
  
  /* 3. Width: Full on mobile (with padding), constrained on desktop */
  w-full 
  max-w-md 
  px-4 

  /* 4. Bottom Spacing: 
     - Mobile: Respects the 'home bar' (safe area) + extra padding
     - Web/Desktop: Fallback to 1.5rem (24px) when env() is 0
  */
  pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]
  
  /* 5. Desktop-specific adjustment: 
     On larger screens, we lift it slightly higher for better aesthetics 
  */
  sm:pb-10
"
      >
        <motion.div
          layout
          className="bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-t-4xl rounded-b-3xl pointer-events-auto overflow-hidden"
        >
          <div className="px-6 pt-5 pb-2">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-[10px] font-black text-[#BFFF04] uppercase opacity-70 italic">
                  {isActive ? "Live Mission" : "Standby"}
                </p>
                <h2 className="text-4xl font-black tracking-tighter tabular-nums">
                  {Math.floor((metrics.timeLeft || 0) / 60)}:
                  {(metrics.timeLeft % 60).toString().padStart(2, "0")}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                  Progress
                </p>
                <p className="text-sm font-black text-[#BFFF04]">
                  {(progress * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-[#BFFF04]"
                animate={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 border-y border-white/5 bg-white/2">
            <StatItem
              label="Dist"
              value={(metrics.distDone / 1000).toFixed(2)}
              unit="km"
            />
            <StatItem
              label="Steps"
              value={(metrics.steps || 0).toLocaleString()}
              unit="pts"
            />
            <StatItem
              label="Reward"
              value={`+${Math.floor(progress * 500)}`}
              unit="xp"
            />
          </div>

          <div className="p-4 flex gap-3">
            <Button
              onClick={() => setIsActive(!isActive)}
              disabled={!route}
              className={`flex-4 h-14 rounded-2xl font-black text-xs tracking-widest ${
                isActive ? "bg-white text-black" : "bg-[#BFFF04] text-black"
              }`}
            >
              {isActive ? "PAUSE MISSION" : "START QUEST"}
            </Button>
            <Button
              onClick={reset}
              className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 transition-colors"
            >
              <RotateCcw size={20} className="text-white/40" />
            </Button>
          </div>
        </motion.div>
      </div>

      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        speedKmh={speedKmh}
        setSpeedKmh={setSpeedKmh}
      />
    </div>
  );
}

// Settings Overlay (Simplified to prevent React tree errors)
const SettingsOverlay = ({ isOpen, onClose, speedKmh, setSpeedKmh }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-5000 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-[#141414] w-full max-w-lg rounded-t-4xl sm:rounded-4xl p-6 border-t border-white/10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black italic">SYSTEM CONFIG</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between font-bold text-sm">
            <span>VELOCITY</span>
            <span className="text-[#BFFF04]">{speedKmh} KM/H</span>
          </div>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={speedKmh}
            onChange={(e) => setSpeedKmh(Number(e.target.value))}
            className="w-full accent-[#BFFF04]"
          />
          <Button
            onClick={onClose}
            className="w-full h-14 bg-[#BFFF04] text-black font-black rounded-2xl"
          >
            SAVE
          </Button>
        </div>
      </div>
    </div>
  );
};
