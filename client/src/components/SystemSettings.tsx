import { motion } from "framer-motion";
import { Monitor, Zap, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { ThemeToggleButton } from "./ui/themeSwitchButton";

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
    <div className="space-y-10 py-2">
      {/* 1. Header: Minimalist */}
      <header className="text-center">
        <h2 className="text-xl font-bold text-(--text-primary)">Settings</h2>
        <p className="text-xs text-(--text-secondary) mt-1">
          Configure your mission workspace
        </p>
      </header>

      <div className="space-y-8">
        {/* 2. Theme Toggle: Large & Intuitive */}
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium">Appearance</span>
          <ThemeToggleButton isDark={isDark} toggleTheme={toggleTheme} />
        </div>

        {/* 3. Speed Slider: Clean & Direct */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-sm font-medium">Walking Speed</span>
            <span className="text-lg font-bold text-(--accent-primary)">
              {draftSpeed} <small className="text-xs font-normal">km/h</small>
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={draftSpeed}
            onChange={(e) => {
              setDraftSpeed(Number(e.target.value));
            }}
            className="w-full h-2 bg-(--text-secondary)/20 rounded-full appearance-none accent-(--accent-primary) cursor-pointer"
          />
        </div>

        {/* 4. Toggles: Clean List Style */}
        <div className="space-y-1">
          <ToggleButton
            active={draftWake}
            icon={<Monitor size={20} />}
            label="Keep Screen On"
            onClick={() => setDraftWake(!draftWake)}
          />
          <ToggleButton
            active={draftHaptics}
            icon={<Zap size={20} />}
            label="Vibration Feedback"
            onClick={() => setDraftHaptics(!draftHaptics)}
          />
        </div>

        {/* 5. Primary Action */}
        <button
          onClick={handleApply}
          className="w-full py-4 bg-(--accent-primary) text-(--bg-page)  font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          Save Changes
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
