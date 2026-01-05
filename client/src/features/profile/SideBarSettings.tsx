import { Global } from "recharts";
import { PositionLock } from "../navigation/PositionLock";
import { SettingsButton } from "../navigation/SettingsButton";
import { ThemeToggle } from "../navigation/ThemeToggleButton";
import { ToggleButton } from "@/components/shared/GlobalSideSheet";

export const SettingsSideBar = () => {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-auto z-3000 group">
      {/* 1. Visual Rail: Uses your --accent-primary for the glow line */}
      <div className="absolute inset-y-0 w-px bg-linear-to-b from-transparent via-tactical/40 to-transparent -z-10 shadow-[0_0_12px_var(--accent-glow)]" />

      {/* 2. Main Container: Uses your 'glass-card' utility */}
      <div className="glass-card flex flex-col p-2 gap-3 rounded-full! py-4 hover:border-tactical/50 shadow-2xl transition-all duration-500">
        {/* These components should now inherit the theme colors */}
        <SettingsButton />
        <ThemeToggle />
        <PositionLock />
        <ToggleButton />
      </div>

      {/* 3. Vertical Label: Uses your --text-primary and tracking */}
      <div className="mt-2 opacity-30 select-none group-hover:opacity-100 transition-all duration-700 delay-100">
        <span className="text-[8px] font-black text-primary tracking-[0.4em] [writing-mode:vertical-lr] uppercase italic">
          Tactical Grid v1.0
        </span>
      </div>
    </div>
  );
};
