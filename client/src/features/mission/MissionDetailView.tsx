import React, { useEffect, useState, useRef, useMemo } from "react";
import HTMLFlipBook from "react-pageflip";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  ChevronRight,
  Trash2,
  ShieldAlert,
  Image as ImageIcon,
  Navigation,
} from "lucide-react";
import { StorageService } from "@/lib/utils";
import { RouteData, CheckPointData } from "@/types/types";
import { useDrawer } from "./contexts/DrawerContext";

// ==================== MAIN COMPONENT ====================
export const MissionDetailView = () => {
  const [missions, setMissions] = useState<RouteData[]>([]);
  const [purgeTarget, setPurgeTarget] = useState<string | null>(null);
  const [activeDiary, setActiveDiary] = useState<{
    mission: RouteData;
    logs: CheckPointData[];
  } | null>(null);
  const { isOpen } = useDrawer();

  const loadMissions = async () => {
    const details = await StorageService.getAllSummaries();

    console.log(details);

    setMissions(
      details.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    );
  };

  useEffect(() => {
    if (isOpen) loadMissions();
  }, [isOpen]);

  const openBook = async (mission: RouteData) => {
    const fullData = await StorageService.getFullRoute(mission.id);
    console.log("fullData", fullData);
    setActiveDiary({ mission, logs: fullData?.logs || [] });
  };

  const deleteMission = async (id: string) => {
    try {
      // Await the storage removal first
      await StorageService.removeRouteSummary(id);

      // Update UI state
      setMissions((currentMissions) => {
        return currentMissions.filter((m) => m.id !== id);
      });

      console.log(`Mission ${id} successfully purged.`);
    } catch (err) {
      console.error("Critical: Failed to purge mission", err);
      loadMissions(); // Fallback: reload from storage if state update gets messy
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent relative">
      <div className="flex-1 overflow-y-auto px-6 space-y-4 no-scrollbar pb-32 z-10">
        {missions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-20 text-(--text-primary)">
            <ShieldAlert size={32} strokeWidth={1} className="mb-4" />
            <p className="text-[10px] uppercase tracking-widest">
              No Archives Found
            </p>
          </div>
        ) : (
          missions.map((route) => (
            <motion.div
              key={route.id}
              whileHover={{ x: 5, backgroundColor: "var(--accent-glow)" }}
              // 4. MOVE CLICK HANDLER TO THE SPECIFIC CONTAINER
              onClick={() => openBook(route)}
              className="group relative p-6 rounded-xl bg-(--hud-bg) border border-(--hud-border) cursor-pointer transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
                <StatusChip status={route.status || "completed"} />

                {/* 5. THE BUTTON FIXES */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setPurgeTarget(route.id);
                  }}
                  className="relative z-50 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-1 relative z-10 pointer-events-none">
                <span className="text-[9px] font-mono text-(--text-secondary) tracking-widest uppercase opacity-60">
                  {new Date(route.timestamp).toLocaleDateString()}
                </span>

                <h3 className="text-lg font-light text-(--text-primary) group-hover:text-(--accent-primary) transition-colors leading-tight max-w-[70%]">
                  {route.missionName || "A Quiet Journey"}
                </h3>

                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-(--hud-border)">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase text-(--text-secondary) tracking-widest">
                      Path
                    </span>
                    <span className="text-xs font-mono text-(--text-primary)">
                      {((route.totalDistance || 0) / 1000).toFixed(2)}km
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase text-(--text-secondary) tracking-widest">
                      Time
                    </span>
                    <span className="text-xs font-mono text-(--text-primary)">
                      {((route.totalDuration || 0) / 3600).toFixed(1)}h
                    </span>
                  </div>

                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-(--accent-primary)">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {activeDiary && (
          <TacticalDiary
            mission={activeDiary.mission}
            logs={activeDiary.logs}
            onClose={() => setActiveDiary(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {purgeTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1a1b14] border border-red-900/50 p-8 rounded-2xl max-w-xs w-full shadow-[0_0_50px_rgba(220,38,38,0.2)]"
            >
              <ShieldAlert className="text-red-500 mb-4 mx-auto" size={40} />
              <h2 className="text-white text-center font-black uppercase tracking-tighter text-lg">
                System Purge
              </h2>
              <p className="text-white/60 text-[11px] text-center mt-2 leading-relaxed">
                You are about to permanently erase this mission telemetry. This
                action cannot be reversed.
              </p>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setPurgeTarget(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Abort
                </button>
                <button
                  onClick={async () => {
                    // Direct call to delete logic without passing events
                    if (purgeTarget) {
                      await deleteMission(purgeTarget);
                      setPurgeTarget(null);
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
/* --- HELPER COMPONENT: STATUS CHIP --- */

const StatusChip = ({ status }: { status: string }) => {
  const configs: Record<
    string,
    { label: string; icon: any; color: string; bg: string }
  > = {
    active: {
      label: "In Transit", // Currently walking/focusing
      icon: Navigation,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    completed: {
      label: "Settled", // Mission finished, reached the final destination
      icon: MapPin,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    draft: {
      label: "Off-Path", // Abandoned or paused journey
      icon: ShieldAlert,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
  };

  // Default to 'Settled' if status is unknown
  const config = configs[status.toLowerCase()] || configs.completed;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm border ${config.bg} backdrop-blur-md transition-all duration-300`}
    >
      <div className="relative flex items-center justify-center">
        <Icon
          size={10}
          className={`${config.color} ${
            status === "active" ? "animate-pulse" : ""
          }`}
        />
        {/* Adds a small "radar" ping for active sessions */}
        {status === "active" && (
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
        )}
      </div>

      <span
        className={`text-[9px] font-mono font-bold uppercase tracking-widest ${config.color}`}
      >
        {config.label}
      </span>
    </div>
  );
};
// --- Pagination Utility ---
const paginateContent = (text: string, charLimit: number = 800) => {
  const regex = new RegExp(`(.{1,${charLimit}})(\\s|$)`, "g");
  return text.match(regex) || [text];
};

export const TacticalDiary = ({ mission, logs, onClose }: any) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Smooth resize handling
  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = dimensions.width < 768;

  // Optimized content pagination
  const pages = useMemo(() => {
    const allPages: any[] = [];

    logs.forEach((log: any, index: number) => {
      // 1. Paginate the text
      const textChunks = paginateContent(
        log.note || "Field report: No significant changes.",
        isMobile ? 320 : 700
      );

      // 2. Add text pages
      textChunks.forEach((chunk, chunkIdx) => {
        allPages.push({
          title: log.label,
          content: chunk,
          picture: null, // Don't put the picture inside the text block
          isContinuation: chunkIdx > 0,
          index: index + 1,
          type: "text",
        });
      });

      // 3. IF there is a picture, add it as its own dedicated page!
      if (log.picture) {
        allPages.push({
          title: log.label,
          content: null,
          picture: log.picture,
          isContinuation: true,
          index: index + 1,
          type: "photo",
        });
      }
    });
    return allPages;
  }, [logs, isMobile]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-99999 bg-[#0c0d09]/95 backdrop-blur-md w-screen h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Texture & Lighting Overlays */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      {/* Floating Header info */}
      <div className="absolute top-8 left-10 hidden md:block">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[#bc6c25] tracking-[0.4em] uppercase font-bold">
            Focus Expedition
          </span>
          <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
            {new Date(mission.timestamp).toLocaleDateString()} // REF_
            {mission.id}
          </span>
        </div>
      </div>

      {/* Close Action */}
      <div className="absolute top-8 right-10 z-[120]">
        <button
          onClick={onClose}
          className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 p-2 pr-6 rounded-full border border-white/10 text-white/50 hover:text-white transition-all duration-500"
        >
          <div className="bg-white/10 p-2 rounded-full group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors">
            <X size={18} />
          </div>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em]">
            Close Report
          </span>
        </button>
      </div>

      {/* Book Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* PHYSICAL BINDING SHADOW (The Spine) */}
        <div className="absolute left-1/2 -translate-x-1/2 w-4 h-[85%] bg-black/40 blur-md z-50 pointer-events-none hidden md:block" />

        {/* @ts-ignore */}
        <HTMLFlipBook
          width={isMobile ? dimensions.width - 20 : 550}
          height={isMobile ? dimensions.height * 0.8 : 750}
          size="stretch"
          minWidth={300}
          maxWidth={1200}
          minHeight={400}
          maxHeight={1500}
          showCover={true}
          usePortrait={isMobile}
          flippingTime={800}
          useMouseEvents={true}
          className="explorer-diary shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]"
          style={{ background: "transparent" }}
        >
          {/* COVER PAGE */}
          <div className="bg-[#241f1c] p-12 flex flex-col justify-between h-full border-r border-black/40 relative">
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
            <div className="relative z-10">
              <div className="w-16 h-1 bg-[#bc6c25] mb-8" />
              <h1 className="text-4xl md:text-6xl font-serif italic text-[#f4f1ea] font-black leading-none tracking-tighter mb-4">
                {mission.missionName || "Field Logs"}
              </h1>
              <p className="text-[#bc6c25] font-mono text-[10px] tracking-[0.4em] uppercase font-bold">
                Documented Progress
              </p>
            </div>
            <div className="relative z-10 flex gap-6 opacity-30">
              <div className="flex flex-col">
                <span className="text-[8px] text-white uppercase font-bold tracking-tighter">
                  Distance
                </span>
                <span className="text-white font-mono text-sm">
                  {((mission.totalDistance || 0) / 1000).toFixed(1)}km
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-white uppercase font-bold tracking-tighter">
                  Time
                </span>
                <span className="text-white font-mono text-sm">
                  {((mission.totalDuration || 0) / 3600).toFixed(1)}h
                </span>
              </div>
            </div>
          </div>

          {/* LOG PAGES */}
          {pages.map((page, i) => (
            <div
              key={i}
              className="bg-[#fdfbf7] p-8 md:p-14 flex flex-col relative h-full"
            >
              {/* Soft Spine Gradient */}
              <div
                className={`absolute inset-y-0 w-20 pointer-events-none z-20 ${
                  i % 2 === 0
                    ? "right-0 bg-gradient-to-l from-black/[0.04] to-transparent"
                    : "left-0 bg-gradient-to-r from-black/[0.04] to-transparent"
                }`}
              />

              <div className="relative z-10 flex-1 border-l border-red-800/5 pl-8 w-full max-w-full overflow-hidden">
                <header className="flex justify-between items-center mb-6 opacity-40">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-stone-500">
                    {page.type === "photo"
                      ? "Visual Intel"
                      : `Log Entry ${page.index}`}
                  </span>
                </header>

                {/* RENDER TEXT PAGE */}
                {page.type === "text" && (
                  <>
                    {!page.isContinuation && (
                      <h3 className="text-3xl font-serif font-black text-stone-900 mb-6 italic leading-tight">
                        {page.title}
                      </h3>
                    )}
                    <p className="text-lg md:text-xl text-stone-800 font-serif italic opacity-90 paper-ruled block w-full">
                      {page.content}
                    </p>
                  </>
                )}

                {/* RENDER PHOTO PAGE */}
                {page.type === "photo" && (
                  <div className="h-full flex flex-col justify-center items-center">
                    <div className="relative group w-full max-w-md">
                      {/* Tape Effect */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-stone-500/10 backdrop-blur-md -rotate-2 z-20 border-x border-black/5" />

                      <div className="p-3 bg-white shadow-2xl rotate-1">
                        <img
                          src={page.picture}
                          className="w-full h-auto grayscale-[0.2] contrast-110"
                          alt="field recon"
                        />
                        <p className="mt-4 text-center font-serif italic text-stone-400 text-sm">
                          Recon Capture: {page.title}
                        </p>
                      </div>

                      {/* Bottom Tape */}
                      <div className="absolute -bottom-2 right-4 w-16 h-8 bg-stone-500/5 backdrop-blur-sm rotate-12 z-20 border-x border-black/5" />
                    </div>
                  </div>
                )}
              </div>

              <footer className="mt-auto pt-6 text-center opacity-30 text-[9px] font-mono uppercase tracking-widest">
                Page {i + 1} // Walker Archive
              </footer>
            </div>
          ))}

          {/* END COVER */}
          <div className="bg-[#241f1c] p-12 flex items-center justify-center h-full relative border-l border-black/40">
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
            <div className="text-center opacity-20">
              <MapPin size={40} className="text-white mx-auto mb-4" />
              <p className="text-white font-mono text-[8px] tracking-[0.5em] uppercase">
                End of Record
              </p>
            </div>
          </div>
        </HTMLFlipBook>
      </div>
    </motion.div>
  );
};
