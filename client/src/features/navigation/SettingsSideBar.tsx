import { OpenSheetButton } from "@/components/shared/GlobalSideSheet";
import { PositionLock } from "./PositionLock";
import { SettingsButton } from "./SettingsButton";
import { ThemeToggle } from "./ThemeToggleButton";

export const SettingsSideBar = (drawerRef: any) => {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-auto z-3000">
      {/* 2. Visual Rail: Added a glowing pulse effect to the line */}
      <div className="absolute inset-y-0 w-px bg-linear-to-b from-transparent via-(--accent-primary)/40 to-transparent -z-10 shadow-[0_0_8px_rgba(var(--accent-primary),0.3)]" />

      {/* 3. Main Container: Added 'group' for internal hover effects and better padding */}
      <div className="flex flex-col p-2 bg-hud/80 backdrop-blur-2xl border border-(--hud-border) rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] gap-3 transition-all duration-500 hover:border-(--accent-primary)/30">
        {/* Buttons now have a consistent hover container flow */}
        <SettingsButton />
        <ThemeToggle />
        <PositionLock />
        <OpenSheetButton />
      </div>

      {/* 4. Vertical Label: Cleaned up spacing and added a subtle glow */}
      <div className="mt-2 opacity-40 select-none group-hover:opacity-100 transition-opacity duration-700">
        <span className="text-[9px] font-bold text-(--text-primary) tracking-[0.3em] [writing-mode:vertical-lr] uppercase drop-shadow-sm">
          Tactical Grid v1.0
        </span>
      </div>
    </div>
  );
};
