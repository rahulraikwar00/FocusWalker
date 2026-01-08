import { useDrawer } from "@/features/mission/contexts/DrawerContext";
import { MapPin, X } from "lucide-react";
import { MissionDetailView } from "@/features/mission/MissionDetailView";
import { Button } from "@/components/ui/button";

export const GlobalSideSheet = () => {
  const { isOpen, toggle } = useDrawer();

  return (
    <>
      {/* Overlay: Deep Dark Vignette */}
      <div
        onClick={toggle}
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[9998] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Side Sheet: The HUD Container */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-100 
          bg-(--hud-bg) border-r border-(--hud-border) 
          shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-9999 
          transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full relative">
          {/* Accent Glow Strip (Top) */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-(--accent-primary) shadow-[0_0_15px_var(--accent-primary)] opacity-50" />

          {/* HEADER: Digital HUD Style */}
          <div className="pt-8 px-8 pb-6 mb-3 border-b border-(--hud-border)">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-mono font-bold uppercase tracking-tighter text-(--accent-primary)">
                Traveler's Logs
              </h2>
              <button
                onClick={toggle}
                className="p-2 text-(--text-secondary) hover:text-(--accent-primary) transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-(--accent-primary) animate-pulse" />
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-(--text-secondary)">
                System // Archives // {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* CONTENT: Integrated with HUD theme */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <MissionDetailView />
          </div>
        </div>
      </div>
    </>
  );
};

export const ToggleButton = () => {
  const { toggle } = useDrawer();

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      className="w-11 h-11 rounded-xl bg-(--hud-bg) border border-(--hud-border) hover:bg-(--accent-glow) group transition-all shadow-lg"
    >
      <MapPin
        size={20}
        className="text-(--accent-primary) group-hover:scale-110 transition-transform"
      />
    </Button>
  );
};
