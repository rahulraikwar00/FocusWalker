import { motion } from "framer-motion";
import { User, Settings } from "lucide-react";
import { Button } from "./ui/button";

interface HUDtopProps {
  userData: {
    callsign: string;
    rank: string;
  };
  setIsDossierOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

export const HUDtop = ({
  setIsSettingsOpen,
  userData,
  setIsDossierOpen,
}: HUDtopProps) => {
  return (
    <div className="absolute top-0 left-0 w-full z-3000 px-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pointer-events-none flex justify-between items-start">
      {/* --- OPERATOR PROFILE (Merged & Clickable) --- */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => setIsDossierOpen(true)}
        className="group flex items-center gap-3 bg-hud backdrop-blur-xl border-l-2 border-(--accent-primary) p-1.5 pr-5 rounded-r-xl pointer-events-auto shadow-2xl transition-all active:scale-95"
      >
        <div className="relative">
          <div className="w-11 h-11 bg-(--accent-primary) rounded-lg flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)] transition-all group-hover:brightness-110">
            <User className="text-(--bg-page) w-5 h-5" />
          </div>
          {/* Heartbeat / Online Status Dot */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-(--accent-primary) border-2 border-(--bg-page) rounded-full animate-pulse" />
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-(--accent-primary) tracking-widest uppercase">
              {userData.rank || "RECRUIT"}
            </span>
            <div className="h-px w-3 bg-(--accent-primary) opacity-30" />
            <span className="text-(--text-secondary) opacity-60 text-[8px] font-black tracking-tighter">
              LVL 01
            </span>
          </div>
          <h1 className="text-sm font-black text-(--text-primary) leading-none uppercase tracking-wider italic group-hover:text-(--accent-primary) transition-colors">
            {userData.callsign || "IDENTIFY"}
          </h1>
        </div>
      </motion.button>

      {/* --- SYSTEM STATS & SETTINGS --- */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Subtle Connection Status Indicators */}
        <div className="hidden xs:flex flex-col items-end gap-1 mr-2 opacity-40">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-(--accent-primary) rounded-full animate-[bounce_2s_infinite_0ms]" />
            <div className="w-1 h-3 bg-(--accent-primary) rounded-full animate-[bounce_2s_infinite_200ms]" />
            <div className="w-1 h-3 bg-(--text-secondary) opacity-20 rounded-full" />
          </div>
          <span className="text-[8px] font-black text-(--text-primary) uppercase tracking-tighter">
            Link Stable
          </span>
        </div>

        {/* Settings Button */}
        <Button
          onClick={() => setIsSettingsOpen(true)}
          variant="outline"
          className="group w-12 h-12 rounded-xl bg-hud border-hud p-0 hover:border-(--accent-primary) transition-all shadow-xl"
        >
          <Settings
            size={18}
            className="text-(--text-secondary) transition-transform duration-700 group-hover:rotate-180 group-hover:text-(--accent-primary)"
          />
        </Button>
      </div>
    </div>
  );
};
