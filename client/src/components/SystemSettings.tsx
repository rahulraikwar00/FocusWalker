import { motion } from "framer-motion";
import { Monitor, Zap, Sun, Moon } from "lucide-react";
import { useState } from "react";

interface SystemSettingsProps {
  speedKmh: number;
  isWakeLockEnabled: boolean;
  isHapticsEnabled: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  onApply: (settings: {
    speed: number;
    wakeLock: boolean;
    haptics: boolean;
  }) => void;
}

export const SystemSettings = ({
  speedKmh,
  isWakeLockEnabled,
  isHapticsEnabled,
  onApply,
  isDark,
  toggleTheme,
}: SystemSettingsProps) => {
  // Local "Draft" states so changes only apply when hitting the button
  const [draftSpeed, setDraftSpeed] = useState(speedKmh);
  const [draftWake, setDraftWake] = useState(isWakeLockEnabled);
  const [draftHaptics, setDraftHaptics] = useState(isHapticsEnabled);

  const handleApply = () => {
    onApply({
      speed: draftSpeed,
      wakeLock: draftWake,
      haptics: draftHaptics,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="mb-2">
        <h2 className="text-2xl font-black italic tracking-tighter text-(--text-primary) uppercase">
          System Config
        </h2>
        <div className="h-1 w-12 bg-(--accent-primary) mt-1 shadow-[0_0_10px_var(--accent-glow)]" />
      </div>

      <div className="space-y-6">
        {/* --- THEME TOGGLE --- */}
        <div className="flex items-center justify-between p-5 bg-(--text-secondary)/5 rounded-3xl border border-(--hud-border)">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black text-(--accent-primary) uppercase tracking-widest">
              Interface Mode
            </span>
            <span className="text-xs text-(--text-secondary) font-bold">
              {isDark ? "NIGHT OPS" : "DAY MISSION"}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="relative w-14 h-8 bg-(--bg-page) border border-(--hud-border) rounded-full p-1 transition-colors"
          >
            <motion.div
              animate={{ x: isDark ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-6 h-6 bg-(--accent-primary) rounded-full flex items-center justify-center shadow-[0_0_10px_var(--accent-glow)]"
            >
              {isDark ? (
                <Moon size={12} className="text-(--bg-page)" />
              ) : (
                <Sun size={12} className="text-(--bg-page)" />
              )}
            </motion.div>
          </button>
        </div>

        {/* --- VELOCITY CONTROL --- */}
        <div className="space-y-4 px-2">
          <div className="flex justify-between font-black text-[10px] tracking-[0.2em] text-(--text-secondary)">
            <span>WALKING VELOCITY</span>
            <span className="text-(--accent-primary) text-sm tabular-nums">
              {draftSpeed} KM/H
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={draftSpeed}
            onChange={(e) => setDraftSpeed(Number(e.target.value))}
            className="w-full h-1.5 bg-(--text-secondary)/20 rounded-lg appearance-none cursor-pointer accent-(--accent-primary)"
          />
        </div>

        {/* --- HARDWARE TOGGLES --- */}
        <div className="grid gap-3">
          <ToggleButton
            active={draftWake}
            onClick={() => setDraftWake(!draftWake)}
            icon={<Monitor size={18} />}
            label="STAY AWAKE"
            sub="Prevent screen timeout"
          />
          <ToggleButton
            active={draftHaptics}
            onClick={() => setDraftHaptics(!draftHaptics)}
            icon={<Zap size={18} />}
            label="TACTILE FEEDBACK"
            sub="Vibrate on milestones"
          />
        </div>

        {/* --- COMMIT ACTION --- */}
        <button
          onClick={handleApply}
          className="w-full py-5 bg-(--accent-primary) text-(--bg-page) font-black rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_10px_30px_var(--accent-glow)] mt-4 uppercase tracking-[0.2em] text-xs"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};

/* --- SHARED TOGGLE COMPONENT --- */
const ToggleButton = ({ active, onClick, icon, label, sub }: any) => (
  <button
    onClick={onClick}
    role="switch"
    aria-checked={active}
    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${
      active
        ? "border-(--accent-primary)/50 bg-(--accent-primary)/5 shadow-[0_0_15px_rgba(var(--accent-glow-rgb),0.1)]"
        : "border-(--hud-border) bg-(--text-secondary)/5"
    }`}
  >
    <div className="flex items-center gap-4 text-left">
      <div
        className={`transition-colors duration-500 ${
          active
            ? "text-(--accent-primary) drop-shadow-[0_0_8px_var(--accent-glow)]"
            : "text-(--text-secondary)/40"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-black text-(--text-primary) leading-none tracking-tight">
          {label}
        </p>
        <p className="text-[9px] text-(--text-secondary)/50 uppercase mt-1.5 font-bold tracking-[0.15em]">
          {sub}
        </p>
      </div>
    </div>
    <div
      className={`w-12 h-6 rounded-full relative transition-colors duration-500 flex items-center px-1 ${
        active ? "bg-(--accent-primary)" : "bg-(--text-secondary)/10"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-4 h-4 rounded-full bg-(--bg-page) shadow-sm"
        style={{ marginLeft: active ? "auto" : "0" }}
      />
    </div>
  </button>
);
