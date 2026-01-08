import { useDrawer } from "@/features/mission/contexts/DrawerContext";
import { MapPin, X, History, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { MissionDetailView } from "@/features/mission/MissionDetailView";
import { Button } from "@/components/ui/button";

export const GlobalSideSheet = () => {
  const { isOpen, toggle } = useDrawer();

  return (
    <>
      {/* Overlay: Deep Dark Vignette for concentration */}
      <div
        onClick={toggle}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-700 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Side Sheet: The "Logbook" Container */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-[400px] bg-[#f4f1ea] border-r border-stone-300 shadow-2xl z-[9999] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Physical Detail: Rugged Paper Edge/Binding */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-stone-800/10 z-20" />

          {/* HEADER: Handwritten Explorer Style */}
          <div className="pt-16 px-10 pb-6 border-b border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-serif font-bold italic text-stone-800 tracking-tighter">
                Traveler's Logs
              </h2>
              <button
                onClick={toggle}
                className="p-2 text-stone-400 hover:text-stone-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-stone-400">
              Archives // {new Date().getFullYear()}
            </p>
          </div>

          {/* CONTENT: The History Cards */}
          <div className="flex-1 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
            <MissionDetailView />
          </div>
        </div>
      </div>
    </>
  );
};

const EmptyState = () => (
  <div className="h-40 flex flex-col items-center justify-center text-(--text-secondary) opacity-40">
    <MapPin size={32} className="mb-2" />
    <p className="text-[10px] uppercase font-bold tracking-[0.2em]">
      No Records Found
    </p>
  </div>
);

export const ToggleButton = () => {
  const { toggle } = useDrawer();

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      // Fixed: bg-hud/50 might not work if it's a raw RGBA variable,
      // used style for better variable injection or Tailwind variable syntax
      className="w-11 h-11 rounded-xl bg-(--hud-bg) border border-(--hud-border) hover:bg-(--accent-glow) group transition-all"
    >
      <MapPin
        size={20}
        className="text-(--accent-primary) group-hover:scale-110 transition-transform"
      />
    </Button>
  );
};
