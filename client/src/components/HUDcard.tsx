import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Navigation2,
  RotateCcw,
  Timer,
} from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

interface StatItemProps {
  label: string;
  value: string;
  unit: string;
}

interface HudCardProps {
  isActive: boolean;
  progress: number;
  metrics: {
    timeLeft: number;
    distDone: number;
    steps: number;
  };
  handleStopMission: () => void;
  handleStartMission: () => void;
  reset: () => void;
  setIsActive: (active: boolean) => void;
  route: { path: L.LatLngExpression[] } | null;
  isLocked: boolean;
  setIsLocked: (active: boolean) => void;
}

export const HUDCard = ({
  isActive,
  progress,
  metrics,
  handleStopMission,
  handleStartMission,
  reset,
  setIsActive,
  route,
  isLocked,
  setIsLocked,
}: HudCardProps) => {
  const [isResetConfirming, setIsResetConfirming] = useState(false);

  // 2. Add an effect to auto-cancel the reset if they don't confirm
  useEffect(() => {
    if (isResetConfirming) {
      const timer = setTimeout(() => setIsResetConfirming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isResetConfirming]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-2000 pointer-events-none w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
      <motion.div
        layout
        className="bg-hud backdrop-blur-2xl border border-hud rounded-[2.5rem] pointer-events-auto overflow-hidden shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] transition-colors duration-500"
      >
        {/* --- TACTICAL HANDLE --- */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex justify-center p-3 group"
        >
          <div className="w-12 h-1 bg-(--text-secondary) opacity-20 rounded-full group-hover:bg-(--accent-primary) group-hover:opacity-40 transition-all" />
        </button>

        {/* --- MAIN FOCUS SECTION: THE CLOCK --- */}
        <div className="px-8 pb-6 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black tracking-[0.3em] text-(--accent-primary) uppercase mb-1 flex items-center gap-2">
              <Timer size={10} className={isActive ? "animate-pulse" : ""} />
              {isActive ? "T-MINUS TO EXTRACTION" : "SYSTEM STANDBY"}
            </span>

            <div
              className={`relative z-10 font-black tracking-tighter tabular-nums transition-all duration-500 text-(--text-primary) flex items-center justify-center ${
                isCollapsed ? "text-5xl" : "text-5xl"
              }`}
            >
              {/* Subtle Glow Ring behind the text */}
              <div className="absolute -inset-4 bg-(--accent-primary)/5 blur-3xl rounded-full opacity-50" />

              <TimeFormat seconds={metrics.timeLeft} />
            </div>

            {/* Dynamic Progress Indicator */}
            {/* 3. TELEMETRY GAUGE */}
            <div className="w-full mt-3 px-2">
              <div className="flex justify-between items-end mb-1.5 opacity-60">
                <span className="text-[8px] font-bold text-(--text-primary) uppercase tracking-widest">
                  Progress
                </span>
                <span className="text-[10px] font-black text-(--accent-primary) tabular-nums">
                  {(progress * 100).toFixed(0)}%
                </span>
              </div>
              <div className="relative flex gap-0.5 h-1.5 w-full">
                {[...Array(20)].map((_, i) => {
                  const stepThreshold = i / 20;
                  const isFilled = progress > stepThreshold;
                  const isCurrent =
                    progress >= stepThreshold && progress < (i + 1) / 20;
                  return (
                    <div
                      key={i}
                      className="relative flex-1 h-full bg-(--text-secondary)/10 rounded-[1px]"
                    >
                      {isFilled && (
                        <motion.div
                          layoutId={`seg-${i}`}
                          className="absolute inset-0 bg-(--accent-primary) rounded-[1px]"
                          style={{
                            boxShadow: isCurrent
                              ? "0 0 8px var(--accent-glow)"
                              : "none",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* --- COLLAPSIBLE DATA SUITE --- */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-(--hud-border)"
            >
              {/* Data Grid */}
              <div className="grid grid-cols-3 bg-(--text-secondary)/5 border-y border-(--hud-border)">
                <StatItem
                  label="Distance"
                  value={(metrics.distDone / 1000).toFixed(2)}
                  unit="KM"
                />
                <StatItem
                  label="Kinetic"
                  value={(metrics.steps || 0).toLocaleString()}
                  unit="PTS"
                />
                <StatItem
                  label="Potential"
                  value={`+${Math.floor(progress * 500)}`}
                  unit="XP"
                  isPrimary={isActive && progress > 0}
                />
              </div>

              {/* Tactical Actions */}
              {/* --- TACTICAL ACTIONS --- */}
              <div className="p-4 flex gap-2 h-20">
                {/* EXECUTE / ABORT - Primary Action */}
                <Button
                  onClick={() =>
                    isActive ? handleStopMission() : handleStartMission()
                  }
                  disabled={!route}
                  className={`flex-3 h-full rounded-3xl font-black text-xs tracking-[0.2em] transition-all border-2 ${
                    isActive
                      ? "bg-transparent border-(--text-primary) text-(--text-primary)"
                      : "bg-(--accent-primary) border-(--accent-primary) text-(--bg-page) shadow-[0_0_20px_var(--accent-glow)]"
                  }`}
                >
                  {isActive ? "ABORT MISSION" : "EXECUTE FOCUS"}
                </Button>

                {/* RE-CENTER / LOCK - High Frequency (Safe) */}
                <Button
                  onClick={() => setIsLocked(!isLocked)}
                  className={`flex-1 h-full rounded-3xl border transition-all ${
                    isLocked
                      ? "bg-(--accent-primary)/10 border-(--accent-primary) text-(--accent-primary)"
                      : "bg-(--text-secondary)/10 border-(--hud-border) text-(--text-secondary)"
                  }`}
                >
                  <Navigation2
                    size={20}
                    className={isLocked ? "animate-pulse" : ""}
                  />
                </Button>

                {/* RESET - High Stakes (Safety Locked) */}
                <Button
                  onClick={() => {
                    if (!isResetConfirming) {
                      setIsResetConfirming(true);
                      // Trigger a tiny haptic nudge if available
                      if (typeof navigator !== "undefined" && navigator.vibrate)
                        navigator.vibrate(10);
                    } else {
                      reset();
                      setIsResetConfirming(false);
                    }
                  }}
                  className={`flex-1 h-full rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                    isResetConfirming
                      ? "bg-red-500/20 border-red-500 text-red-500"
                      : "bg-(--text-secondary)/10 border-(--hud-border) text-(--text-secondary)"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isResetConfirming ? (
                      <motion.span
                        key="confirm"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        exit={{ y: -20 }}
                        className="text-[8px] font-black leading-none"
                      >
                        SURE?
                      </motion.span>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                      >
                        <RotateCcw size={20} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Visual Countdown Progress (Optional) */}
                  {isResetConfirming && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-red-500/50"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// 1. Individual Item Interface
interface StatItemProps {
  label: string;
  value: string;
  unit: string;
  isPrimary?: boolean;
}

// 2. The StatItem Component
const StatItem = ({ label, value, unit, isPrimary = false }: StatItemProps) => {
  return (
    <div className="flex flex-col items-center py-4 border-r border-(--hud-border) last:border-none group transition-colors">
      {/* Label: Uses secondary text with a subtle hover effect */}
      <span className="text-[9px] font-black text-(--text-secondary) opacity-60 uppercase tracking-[0.2em] mb-1 group-hover:opacity-100 transition-opacity">
        {label}
      </span>

      <div className="flex items-baseline gap-1">
        {/* Value: Swaps between Volt Green and Primary Text */}
        <span
          className={`text-xl font-black tabular-nums transition-all duration-300 ${
            isPrimary
              ? "text-(--accent-primary) [text-shadow:0_0_12px_var(--accent-glow)]"
              : "text-(--text-primary)"
          }`}
        >
          {value}
        </span>

        {/* Unit: Dimmed text to keep the focus on the number */}
        <span className="text-[8px] font-bold text-(--text-secondary) opacity-40 tracking-widest uppercase">
          {unit}
        </span>
      </div>
    </div>
  );
};

const TimeFormat = ({ seconds }: { seconds: number }) => {
  // 1. Logic for extracting time units including Days
  const days = Math.floor(seconds / 86400);
  const hrs = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  // 2. Padding logic
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <span className="tabular-nums tracking-tighter font-black flex items-baseline">
      {/* Days Segment - Tactical Highlight */}
      {days > 0 && (
        <>
          <span className="text-(--accent-primary) opacity-90">
            {pad(days)}
          </span>

          <span className="text-(--text-secondary) opacity-30 mx-1">:</span>
        </>
      )}

      {/* Hours */}
      {(hrs > 0 || days > 0) && (
        <>
          <span className="text-(--text-primary)">{pad(hrs)}</span>
          <span className="text-(--text-secondary) opacity-30 mx-0.5">:</span>
        </>
      )}

      {/* Minutes */}
      <span className="text-(--text-primary)">{pad(mins)}</span>

      {/* Tactical Separator */}
      <span className="text-(--text-secondary) opacity-30 mx-0.5">:</span>

      {/* Seconds - Active Glow */}
      <span className="text-(--accent-primary) drop-shadow-[0_0_8px_var(--accent-glow)]">
        {pad(secs)}
      </span>
    </span>
  );
};
