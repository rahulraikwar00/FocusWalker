import { motion } from "framer-motion";
import { Monitor, X, Zap, Sun, Moon } from "lucide-react";
import { useState } from "react";

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  speedKmh: number;
  isWakeLockEnabled: boolean;
  isHapticsEnabled: boolean;
  onApply: (settings: {
    speed: number;
    wakeLock: boolean;
    haptics: boolean;
  }) => void;
  isDark: boolean;
  toggleTheme: () => void;
}
export const SettingsOverlay = ({
  isOpen,
  onClose,
  speedKmh,
  isWakeLockEnabled,
  isHapticsEnabled,
  onApply,
  isDark,
  toggleTheme,
}: SettingsOverlayProps) => {
  if (!isOpen) return null;

  const [draftSpeed, setDraftSpeed] = useState(speedKmh);
  const [draftWake, setDraftWake] = useState(isWakeLockEnabled);
  const [draftHaptics, setDraftHaptics] = useState(isHapticsEnabled);

  const handleApply = () => {
    onApply({
      speed: draftSpeed,
      wakeLock: draftWake,
      haptics: draftHaptics,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-5000 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
      <div className="bg-hud w-full max-w-lg rounded-[2.5rem] p-8 border border-(--hud-border) shadow-2xl transition-colors duration-500">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter text-(--text-primary)">
              SYSTEM CONFIG
            </h2>
            <div className="h-1 w-12 bg-(--accent-primary) mt-1 shadow-[0_0_10px_var(--accent-glow)]" />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-(--text-primary)/5 rounded-full transition-colors"
          >
            <X className="text-(--text-secondary)" />
          </button>
        </div>

        <div className="space-y-8">
          {/* --- THEME TOGGLE (Quick Flip) --- */}
          <div className="flex items-center justify-between p-5 bg-(--text-secondary)/5 rounded-3xl border border-(--hud-border)">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-(--accent-primary) uppercase tracking-widest">
                Interface Mode
              </span>
              <span className="text-xs text-(--text-secondary)">
                {isDark ? "Night Ops" : "Day Mission"}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="relative w-14 h-8 bg-(--bg-page) border border-(--hud-border) rounded-full p-1 transition-colors"
            >
              <motion.div
                animate={{ x: isDark ? 24 : 0 }}
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

          {/* Velocity Control */}
          <div className="space-y-4">
            <div className="flex justify-between font-black text-[10px] tracking-[0.2em] text-(--text-secondary)">
              <span>WALKING VELOCITY</span>
              <span className="text-(--accent-primary) text-sm">
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

          {/* Toggles Group */}
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

          {/* Apply Button */}
          <button
            onClick={handleApply}
            className="w-full py-5 bg-(--accent-primary) text-(--bg-page) font-black rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_10px_30px_var(--accent-glow)]"
          >
            APPLY CHANGES
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleButton = ({ active, onClick, icon, label, sub }: any) => (
  <button
    onClick={onClick}
    role="switch"
    aria-checked={active}
    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${
      active
        ? "border-(--accent-primary)/50 bg-(--accent-primary)/5 shadow-[0_0_15px_rgba(191,255,4,0.05)]"
        : "border-(--hud-border) bg-(--text-secondary)/5"
    }`}
  >
    <div className="flex items-center gap-4 text-left">
      {/* Icon with Dynamic Glow */}
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

    {/* Custom Toggle Track */}
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
