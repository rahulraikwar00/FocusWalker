import React, { useEffect, useState, useRef, useMemo } from "react";
import HTMLFlipBook from "react-pageflip";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  MapPin,
  ChevronRight,
  Trash2,
  BookOpen,
  ShieldAlert,
  Image as ImageIcon,
  ChevronLeft,
  History,
} from "lucide-react";
import { StorageService } from "@/lib/utils";
import { RouteData, CheckPointData } from "@/types/types";
import { useDrawer } from "./contexts/DrawerContext";

// ==================== MAIN COMPONENT ====================

export const MissionDetailView = () => {
  const [missions, setMissions] = useState<RouteData[]>([]);
  const [activeDiary, setActiveDiary] = useState<{
    mission: RouteData;
    logs: CheckPointData[];
  } | null>(null);
  const { isOpen } = useDrawer();

  const loadMissions = async () => {
    const details = await StorageService.getAllSummaries();
    // Sort newest first
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
    setActiveDiary({ mission, logs: fullData?.logs || [] });
  };

  const deleteMission = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("PURGE ARCHIVE: Are you sure?")) {
      await StorageService.removeRouteSummary(id);
      loadMissions();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-(--bg-page) relative">
      {/* Sidebar Binding Aesthetic */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/[0.05] to-transparent z-0" />

      {/* Header */}
      <div className="px-10 pt-16 pb-10 z-10">
        <h2 className="text-3xl font-black text-(--text-primary) tracking-tighter italic font-serif">
          Field Archives
        </h2>
        <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-[0.3em] opacity-50 mt-1">
          Tactical Telemetry & Visual Logs
        </p>
      </div>

      {/* Mission List */}
      <div className="flex-1 overflow-y-auto px-8 space-y-4 no-scrollbar pb-32 z-10">
        {missions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-20">
            <ShieldAlert size={40} strokeWidth={1} className="mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">
              No Records Found
            </p>
          </div>
        ) : (
          missions.map((route) => (
            <motion.div
              key={route.id}
              whileHover={{ x: 8 }}
              onClick={() => openBook(route)}
              className="group relative mx-6 mb-4 p-5 rounded-sm bg-[#fdfdfb] border border-stone-300 cursor-pointer shadow-[2px_2px_0px_rgba(44,36,30,0.1)] hover:shadow-[5px_5px_15px_rgba(44,36,30,0.1)] transition-all"
            >
              {/* Decorative Stamp/Marker */}
              <div className="absolute top-4 right-4 opacity-10">
                <History size={40} strokeWidth={1} />
              </div>

              <div className="flex flex-col gap-1 relative z-10">
                <span className="text-[10px] font-serif italic text-stone-400">
                  {new Date(route.timestamp).toLocaleDateString()}
                </span>

                <h3 className="text-xl font-bold text-stone-800 font-serif italic group-hover:text-stone-900 leading-tight">
                  {route.missionName || "A Quiet Journey"}
                </h3>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-stone-400 font-bold tracking-tighter">
                      Path
                    </span>
                    <span className="text-xs font-serif font-bold text-stone-600">
                      {((route.totalDistance || 0) / 1000).toFixed(2)}km
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-stone-400 font-bold tracking-tighter">
                      Rest
                    </span>
                    <span className="text-xs font-serif font-bold text-stone-600">
                      {((route.totalDuration || 0) / 3600).toFixed(1)}h
                    </span>
                  </div>

                  <div className="ml-auto flex items-center gap-1 text-stone-300 group-hover:text-stone-800 transition-colors">
                    <span className="text-[9px] uppercase font-bold">Open</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="flex flex-col h-full overflow-hidden bg-(--bg-page) relative">
        {/* FULLSCREEN DIARY PORTAL */}
        <AnimatePresence>
          {activeDiary && (
            <TacticalDiary
              mission={activeDiary.mission}
              logs={activeDiary.logs}
              onClose={() => setActiveDiary(null)}
            />
          )}
        </AnimatePresence>
      </div>
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

  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = dimensions.width < 768;

  const pages = useMemo(() => {
    const allPages: any[] = [];
    logs.forEach((log: any, index: number) => {
      const textChunks = paginateContent(
        log.note || "Setting up camp for the night...",
        isMobile ? 350 : 750
      );
      textChunks.forEach((chunk, chunkIdx) => {
        allPages.push({
          title: log.label,
          content: chunk,
          distance: log.distanceMark,
          picture: chunkIdx === 0 ? log.picture : null,
          isContinuation: chunkIdx > 0,
          index: index + 1,
        });
      });
    });
    return allPages;
  }, [logs, isMobile]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Use h-screen and w-screen to force absolute coverage
      className="fixed inset-0 z-99999 bg-[#1a1b14] w-screen h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Ambience: Subtle canvas texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/canvas-fabric.png')]" />

      {/* Floating Exit Button (Compass Style) */}
      <div className="absolute top-6 right-8 z-120">
        <button
          onClick={onClose}
          className="group flex items-center gap-2 bg-stone-900/50 hover:bg-stone-800 p-2 pr-4 rounded-full border border-white/10 text-stone-400 transition-all"
        >
          <div className="bg-stone-800 group-hover:bg-red-900/50 p-1 rounded-full transition-colors">
            <X size={20} />
          </div>
          <span className="text-[10px] font-serif italic tracking-widest uppercase">
            Close Journal
          </span>
        </button>
      </div>

      <div className="w-full h-full flex items-center justify-center p-2 sm:p-6 md:p-10">
        {/* @ts-ignore */}
        <HTMLFlipBook
          width={isMobile ? dimensions.width : 550}
          height={isMobile ? dimensions.height * 0.85 : 780}
          size="stretch"
          minWidth={300}
          maxWidth={2000}
          minHeight={400}
          maxHeight={2000}
          showCover={true}
          usePortrait={isMobile}
          flippingTime={1000}
          className="explorer-diary shadow-[0_60px_120px_rgba(0,0,0,0.7)]"
        >
          {/* LEATHER COVER */}
          <div className="bg-[#2c241e] p-12 flex flex-col justify-between h-full border-r border-black/20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-1 bg-[#d4a373] opacity-50" />
              <h1 className="text-5xl font-serif italic text-[#f4f1ea] font-bold leading-tight tracking-tighter">
                {mission.missionName || "A Long Walk"}
              </h1>
              <p className="font-serif italic text-[#d4a373] text-sm tracking-widest uppercase opacity-60">
                Field Notes & Wanderings
              </p>
            </div>
            <div className="relative z-10 border-t border-white/5 pt-6 text-[#f4f1ea]/30 font-serif italic text-xs">
              Recorded near {new Date(mission.timestamp).toLocaleDateString()}
            </div>
          </div>

          {/* JOURNAL PAGES */}
          {pages.map((page, i) => (
            <div
              key={i}
              className="bg-[#f4f1ea] p-10 md:p-16 flex flex-col relative h-full overflow-hidden"
            >
              {/* Center Spine Shadow */}
              <div
                className={`absolute inset-y-0 w-16 pointer-events-none z-20 ${
                  i % 2 === 0
                    ? "right-0 bg-linear-to-l from-black/6 to-transparent"
                    : "left-0 bg-linear-to-r from-black/[0.06] to-transparent"
                }`}
              />

              {/* Red Margin Line */}
              <div className="absolute left-12 top-0 bottom-0 w-[1px] bg-red-800/10" />

              <div className="relative z-10 flex-1 pl-6">
                <header className="flex justify-between items-center mb-10 text-stone-400 font-serif italic text-[11px]">
                  <span>
                    {page.isContinuation
                      ? "...continued"
                      : `Entry 0${page.index}`}
                  </span>
                  <span>
                    {new Date(mission.timestamp).toLocaleDateString()}
                  </span>
                </header>

                {!page.isContinuation && (
                  <h3 className="text-4xl font-serif font-bold text-stone-900 mb-6 italic">
                    {page.title}
                  </h3>
                )}

                <p className="text-xl leading-[1.8] text-stone-800 font-serif italic opacity-90 mb-8 paper-ruled">
                  {page.content}
                </p>

                {page.picture && (
                  <div className="mt-8 relative group max-w-sm mx-auto">
                    {/* Tape Effect */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-stone-400/20 backdrop-blur-sm rotate-[-2deg] z-20 border-x border-black/5" />

                    <div className="p-3 bg-white shadow-xl border border-stone-200 rotate-1 transform transition-transform group-hover:rotate-0">
                      <img
                        src={page.picture}
                        className="w-full h-auto grayscale-[0.2] sepia-[0.1]"
                        alt="Scrapbook Leaf"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-8 flex justify-center opacity-40 text-[11px] font-serif italic text-stone-500">
                — page {i + 1} —
              </div>
            </div>
          ))}

          {/* BACK COVER */}
          <div className="bg-[#2c241e] p-12 flex items-center justify-center h-full relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
            <div className="relative z-10 text-center space-y-4">
              <div className="w-10 h-[1px] bg-[#d4a373] mx-auto opacity-30" />
              <p className="text-[#f4f1ea]/40 font-serif italic text-sm">
                Safe travels, explorer.
              </p>
            </div>
          </div>
        </HTMLFlipBook>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </motion.div>
  );
};
// ==================== SUB-COMPONENTS ====================

const PageContainer = React.forwardRef(
  ({ children, className }: any, ref: any) => (
    <div className={`page ${className}`} ref={ref}>
      <div className="page-content h-full w-full overflow-hidden shadow-inner">
        {children}
      </div>
    </div>
  )
);

const DiaryStat = ({ label, value, color }: any) => (
  <div className="flex flex-col">
    <span className="text-[8px] font-bold text-(--text-secondary) uppercase tracking-widest opacity-40 mb-1">
      {label}
    </span>
    <span
      className="text-2xl font-black text-(--text-primary)"
      style={{ color: color }}
    >
      {value}
    </span>
  </div>
);
