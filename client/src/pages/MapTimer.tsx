import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"; // Re-uses
import "leaflet-defaulticon-compatibility";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  useMap,
  useMapEvents,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import {
  Settings,
  RotateCcw,
  Play,
  Pause,
  MapPin,
  Search,
  X,
  Navigation2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import confetti from "canvas-confetti";
import * as turf from "@turf/turf";

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 1. Create a list of quotes
const MOTIVATION = [
  "Keep going!",
  "Almost there!",
  "Looking strong!",
  "Great pace!",
  "You got this!",
  "Level Up!",
  "Don't stop!",
];

const METERS_PER_STEP = 0.75;
const WALKING_SPEED_KMH = 5.0;

// #####################################################
// # 1. CUSTOM HOOK: useRouteLogic
// #####################################################

function useRouteLogic(speedKmh: number) {
  const [points, setPoints] = useState<{
    start: L.LatLng | null;
    end: L.LatLng | null;
  }>({
    start: null,
    end: null,
  });
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

  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef(0);
  const speedMs = useMemo(() => (speedKmh * 1000) / 3600, [speedKmh]);

  useEffect(() => {
    if (route && !isActive) {
      const duration = route.distance / speedMs;
      setMetrics((prev) => ({
        ...prev,
        timeLeft: Math.ceil(duration * (1 - progressRef.current)),
      }));
    }
  }, [speedKmh, route, isActive, speedMs]);

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (isActive) return;
    if (!points.start) {
      setPoints({ ...points, start: e.latlng });
      setCurrentPos(e.latlng);
    } else if (!points.end) {
      setPoints({ ...points, end: e.latlng });
      fetchRoute(points.start, e.latlng);
    }
  };

  const fetchRoute = async (start: L.LatLng, end: L.LatLng) => {
    setIsLoadingRoute(true);
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.code !== "Ok") throw new Error("Route not found");
      const r = data.routes[0];

      const newRoute = {
        path: r.geometry.coordinates.map((c: any) => ({
          lat: c[1],
          lng: c[0],
        })),
        line: turf.lineString(r.geometry.coordinates),
        distance: r.distance,
        duration: r.distance / speedMs,
      };

      setRoute(newRoute);
      setMetrics({
        steps: Math.floor(r.distance / METERS_PER_STEP),
        timeLeft: Math.ceil(r.distance / speedMs),
        distDone: 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  useEffect(() => {
    if (!isActive || !route) return;
    const frame = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      const move = delta * speedMs;
      progressRef.current = Math.min(
        progressRef.current + move / route.distance,
        1
      );

      const p = progressRef.current;
      const dDone = p * route.distance;
      const pt = turf.along(route.line, dDone / 1000, { units: "kilometers" });
      const [lng, lat] = pt.geometry.coordinates;

      setCurrentPos(new L.LatLng(lat, lng));
      setProgress(p);
      setMetrics({
        steps: Math.floor(dDone / METERS_PER_STEP),
        timeLeft: Math.ceil(route.duration * (1 - p)),
        distDone: dDone,
      });

      if (p < 1) animRef.current = requestAnimationFrame(frame);
      else {
        setIsActive(false);
        confetti();
      }
    };
    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current!);
  }, [isActive, route, speedMs]);

  const reset = () => {
    setIsActive(false);
    setPoints({ start: null, end: null });
    setRoute(null);
    setCurrentPos(null);
    progressRef.current = 0;
    setProgress(0);
    setMetrics({ steps: 0, timeLeft: 0, distDone: 0 });
    lastTimeRef.current = 0;
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
    reset,
    isLoadingRoute,
    setPoints,
    fetchRoute,
  };
}

// #####################################################
// # 2. HELPER COMPONENTS
// #####################################################

function MapController({ pos, isActive, onMapClick, isLocked }: any) {
  const map = useMap();
  useEffect(() => {
    const handleFlyTo = (e: any) =>
      map.flyTo(e.detail, 14, { animate: true, duration: 1.5 });
    window.addEventListener("map-fly-to", handleFlyTo);
    return () => window.removeEventListener("map-fly-to", handleFlyTo);
  }, [map]);

  useEffect(() => {
    if (pos && isActive) map.panTo(pos, { animate: true, duration: 0.5 });
  }, [pos, isActive, map]);

  useMapEvents({ click: (e) => !isLocked && onMapClick(e) });
  return null;
}
function SettingsDropdown({ isOpen, speed, setSpeed, route, metrics }: any) {
  if (!isOpen) return null;
  return (
    /* Key Changes: 
       - Changed 'top-[calc(100%+12px)]' to 'bottom-[calc(100%+12px)]'
       - Changed 'slide-in-from-top-4' to 'slide-in-from-bottom-4'
       - Changed 'origin-top' to 'origin-bottom'
    */
    <div className="absolute bottom-[calc(100%+12px)] left-0 w-full bg-white/80 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/40 p-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 origin-bottom z-3000 ring-1 ring-black/[0.05]">
      <div className="space-y-4">
        {/* Compact Horizontal Stats */}
        <div className="flex gap-2">
          <div className="flex-1 bg-black/[0.03] px-3 py-2.5 rounded-2xl border border-black/[0.01]">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight mb-0.5">
              Distance
            </p>
            <p className="text-sm font-bold text-slate-900">
              {route ? (route.distance / 1000).toFixed(2) : "0.00"}
              <span className="text-[10px] text-slate-400 ml-0.5">km</span>
            </p>
          </div>

          <div className="flex-1 bg-black/[0.03] px-3 py-2.5 rounded-2xl border border-black/[0.01]">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight mb-0.5">
              Est. Steps
            </p>
            <p className="text-sm font-bold text-slate-900">
              {metrics.steps.toLocaleString()}
              <span className="text-[10px] text-slate-400 ml-0.5">st</span>
            </p>
          </div>
        </div>

        {/* Integrated Control Row */}
        <div
          className="bg-black/[0.03] p-3 rounded-2xl space-y-2"
          onPointerDownCapture={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center px-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Pace
            </label>
            <div className="flex items-center gap-1 bg-blue-600 px-2 py-0.5 rounded-lg">
              <span className="text-xs font-black text-white">{speed}</span>
              <span className="text-[8px] font-bold text-white/80 uppercase">
                km/h
              </span>
            </div>
          </div>

          <input
            type="range"
            min="1"
            max="20"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-[9px] font-bold text-slate-400 px-1 uppercase tracking-tighter">
            <span>Slow</span>
            <span>Average</span>
            <span>Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// #####################################################
// # 3. MAIN COMPONENT
// #####################################################

export default function MapTimer() {
  const [speedKmh, setSpeedKmh] = useState(WALKING_SPEED_KMH);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [quote, setQuote] = useState(MOTIVATION[0]);

  const {
    points,
    route,
    currentPos,
    isActive,
    setIsActive,
    progress,
    metrics,
    handleMapClick,
    reset,
    isLoadingRoute,
    fetchRoute,
    setPoints,
  } = useRouteLogic(speedKmh);

  const formatPreciseTime = (totalSeconds: number) => {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h}h ${m}m ${s}s`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      // Start the cycle
      interval = setInterval(() => {
        setQuote((prevQuote: string) => {
          // Pick a new quote that isn't the same as the current one
          const others = MOTIVATION.filter((q) => q !== prevQuote);
          return others[Math.floor(Math.random() * others.length)];
        });
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]); // Only restart when play/pause changes

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const coords = new L.LatLng(
          parseFloat(data[0].lat),
          parseFloat(data[0].lon)
        );
        window.dispatchEvent(new CustomEvent("map-fly-to", { detail: coords }));
        if (!points.start) setPoints({ ...points, start: coords });
        else if (!points.end) {
          setPoints({ ...points, end: coords });
          fetchRoute(points.start, coords);
        }
        setSearchQuery("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-100 flex flex-col">
      <div className="relative w-full h-screen bg-slate-100 overflow-hidden">
        {/* Search Bar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[2000] w-[92%] max-w-sm">
          <form onSubmit={handleSearch} className="relative group">
            {/* Search/Loading Icon */}
            <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-transform duration-300 group-focus-within:scale-110">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              )}
            </div>

            {/* Input Field */}
            <input
              type="text"
              placeholder={!points.start ? "Where from?" : "Where to?"}
              className="w-full h-14 pl-14 pr-12 bg-white/60 backdrop-blur-2xl 
                 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] 
                 ring-1 ring-black/5 rounded-[1.5rem] 
                 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80
                 text-slate-800 font-semibold placeholder:text-slate-400 
                 transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center 
                   bg-slate-100/50 hover:bg-slate-200/50 text-slate-500 rounded-full 
                   transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
        {/* Map Layer */}
        <MapContainer
          center={[20, 78]}
          zoom={6}
          className="w-full h-full z-0"
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <MapController
            onMapClick={handleMapClick}
            pos={currentPos}
            isActive={isActive}
            isLocked={isActive || isLoadingRoute}
          />

          {/* {route && (
            <Polyline
              positions={route.path}
              color="#3B82F6" // Your blue color
              weight={8} // Thick enough to see the "steps"
              opacity={0.8}
              lineCap="round" // Makes each dash look like a footprint
              dashArray="1, 15" // The "Magic": 1px dash followed by 15px gap
              dashOffset="0"
            />
          )} */}
          {route && (
            <>
              {/* The Outer Glow (Soft & Wide) */}
              <Polyline
                positions={route.path}
                color="#3B82F6"
                weight={12}
                opacity={0.15}
                lineCap="round"
              />
              {/* The Secondary Glow (Medium) */}
              <Polyline
                positions={route.path}
                color="#3B82F6"
                weight={8}
                opacity={0.3}
                lineCap="round"
              />
              {/* The Core Line (Sharp & Vibrant) */}
              <Polyline
                positions={route.path}
                color="#2563EB" // A slightly deeper blue for the center
                weight={3}
                opacity={1}
                lineCap="round"
              />
            </>
          )}
          {currentPos && (
            <CircleMarker
              center={currentPos}
              radius={7}
              pathOptions={{
                fillColor: "#3B82F6",
                color: "#fff",
                fillOpacity: 1,
                weight: 3,
              }}
            />
          )}
          {points.start && <Marker position={points.start} />}
          {points.end && <Marker position={points.end} />}
        </MapContainer>
        {/* HUD UI */}
        return (
        <motion.div
          drag
          dragMomentum={false}
          dragConstraints={{ left: -20, right: 20, top: -400, bottom: 20 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-[340px] flex flex-col gap-2 touch-none"
        >
          <Card
            className={`bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl transition-all duration-300 ease-in-out
      ${isCollapsed ? "rounded-full p-2 pl-5" : "rounded-[2rem] p-4"}`}
          >
            {/* Header / Primary Info */}
            <div
              className="flex justify-between items-center cursor-pointer select-none"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1">
                  Time Remaining
                </p>
                <div className="flex items-baseline gap-1">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
                    {formatPreciseTime(metrics.timeLeft)}
                  </h2>
                  {isCollapsed && (
                    <span className="text-[10px] font-bold text-blue-600 ml-2">
                      • {(metrics.distDone / 1000).toFixed(1)}km
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`flex items-center gap-2 ${
                  isCollapsed ? "ml-4" : ""
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-blue-600 shadow-lg shadow-blue-200 flex items-center justify-center">
                  <Navigation2 className="w-4 h-4 text-white fill-current" />
                </div>
              </div>
            </div>

            {/* Collapsible Section */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {/* Progress Bar - Tighter p-0 */}
                  <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden mt-4 mb-3">
                    <div
                      className="h-full bg-blue-600 rounded-full" // Removed transition-all duration-700
                      style={{
                        width: `${progress * 100}%`,
                        transition: "none", // Explicitly disable CSS transitions for this element
                      }}
                    />
                  </div>

                  {/* Stats Grid - Optimized for space */}
                  <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Distance
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {(metrics.distDone / 1000).toFixed(2)} km
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Activity
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {metrics.steps.toLocaleString()} Steps
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Action Buttons - Scaled down slightly */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2 bg-white/40 backdrop-blur-2xl p-2 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/60"
              >
                {/* Primary Action Button - More Vibrant */}
                <Button
                  aria-label={isActive ? "Pause walk" : "Start walk"}
                  className={`flex-1 h-12 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-[0.97] shadow-sm ${
                    isActive
                      ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                  }`}
                  onClick={() => setIsActive(!isActive)}
                  disabled={!route || isLoadingRoute}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isActive ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                    <span className="uppercase tracking-wide">
                      {isActive ? "Pause" : "Start"}
                    </span>
                  </div>
                </Button>

                {/* Control Group - Subtle Glass Style */}
                <div className="flex gap-1.5 px-1 border-l border-slate-200/30">
                  <Button
                    variant="ghost"
                    className={`h-11 w-11 rounded-xl transition-all duration-500 ${
                      isSettingsOpen
                        ? "bg-slate-900 text-white"
                        : "bg-white/40 text-slate-600 hover:bg-white/80"
                    }`}
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  >
                    <Settings
                      className={`w-5 h-5 transition-transform duration-500 ${
                        isSettingsOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    aria-label="Reset route and progress"
                    className="h-11 w-11 rounded-xl bg-white/40 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors active:rotate-[-45deg]"
                    onClick={reset}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <SettingsDropdown
            isOpen={isSettingsOpen}
            speed={speedKmh}
            setSpeed={setSpeedKmh}
            metrics={metrics}
          />
        </motion.div>
        );
      </div>
    </div>
  );
}
