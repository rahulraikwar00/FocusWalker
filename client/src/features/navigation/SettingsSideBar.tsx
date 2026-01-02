import { PositionLock } from "./PositionLock";
import { SettingsButton } from "./SettingsButton";
import { ThemeToggle } from "./ThemeToggleButton";

export const SettingsSideBar = () => {
  return (
    <div className="absolute right-4 top-1/3 -translate-y-1/2 flex flex-col items-center gap-3 pointer-events-auto z-3000">
      {/* Visual Rail */}
      <div className="absolute inset-y-0 w-px bg-linear-to-b from-transparent via-(--accent-primary)/20 to-transparent -z-10" />

      <div className="flex flex-col p-1.5 bg-hud/90 backdrop-blur-xl border border-(--hud-border) rounded-2xl shadow-2xl gap-2">
        <SettingsButton />
        <ThemeToggle />
        <PositionLock />
      </div>

      <div className="opacity-30 select-none">
        <span className="text-[8px] font-black text-(--text-primary) tracking-widest [writing-mode:vertical-lr] uppercase">
          Tactical Grid
        </span>
      </div>
    </div>
  );
};
