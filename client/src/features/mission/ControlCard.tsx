import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Timer } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useGlobal } from "./contexts/GlobalContext";

import { TacticalResetButton } from "./TacticalResetButton";

// --- SUB-COMPONENTS ---

const StatItem = ({ label, value, unit, isPrimary = false }: any) => (
  <div className="flex flex-col items-center py-4 border-r border-(--hud-border) last:border-none group">
    <span className="text-[9px] font-black text-(--text-secondary) opacity-60 uppercase tracking-[0.2em] mb-1">
      {label}
    </span>
    <div className="flex items-baseline gap-1">
      <span
        className={`text-xl font-black tabular-nums transition-all ${
          isPrimary
            ? "text-(--accent-primary) [text-shadow:0_0_12px_var(--accent-glow)]"
            : "text-(--text-primary)"
        }`}
      >
        {value}
      </span>
      <span className="text-[8px] font-bold text-(--text-secondary) opacity-40 uppercase">
        {unit}
      </span>
    </div>
  </div>
);

const TimeFormat = ({ seconds }: { seconds: number }) => {
  const days = Math.floor(seconds / 86400);
  const hrs = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <span className="tabular-nums tracking-tighter font-black flex items-baseline">
      {days > 0 && (
        <>
          <span className="text-(--accent-primary)">{pad(days)}</span>
          <span className="opacity-30 mx-1">:</span>
        </>
      )}
      {(hrs > 0 || days > 0) && (
        <>
          <span className="text-(--text-primary)">{pad(hrs)}</span>
          <span className="opacity-30 mx-0.5">:</span>
        </>
      )}
      <span className="text-(--text-primary)">{pad(mins)}</span>
      <span className="opacity-30 mx-0.5">:</span>
      <span className="text-(--accent-primary) drop-shadow-[0_0_8px_var(--accent-glow)]">
        {pad(secs)}
      </span>
    </span>
  );
};

// --- MAIN COMPONENT ---

export const ControlCard = ({
  mapState,
  mapActions,
}: {
  mapState: any;
  mapActions: any;
}) => {
  const { triggerToast } = useGlobal();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { isActive, progress, metrics, route } = mapState;
  const { handleStopMission, handleStartMission, reset } = mapActions;

  useEffect(() => {
    setIsCollapsed(route ? false : true);
  }, [route]);

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-2000 pointer-events-none w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
      <motion.div
        layout
        className="bg-hud backdrop-blur-2xl border border-hud rounded-[2.5rem] pointer-events-auto overflow-hidden shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)]"
      >
        {/* HANDLE */}
        {/* <div className="w-full h-5 flex items-center justify-center  group">
          <div className="w-12 h-1 bg-(--text-secondary) opacity-20 rounded-full group-hover:bg-(--accent-primary) transition-all" />
        </div> */}

        {/* CLOCK SECTION */}
        <div
          className="px-8 pb-3 text-center mt-3"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black tracking-[0.3em] text-(--accent-primary) uppercase mb-1 flex items-center gap-2">
              <Timer size={10} className={isActive ? "animate-pulse" : ""} />
              {isActive ? "T-MINUS TO EXTRACTION" : "SYSTEM STANDBY"}
            </span>

            <div
              className={`relative z-10 ${getFontSize(
                metrics.timeLeft
              )} transition-all duration-300 flex items-center justify-center`}
            >
              <TimeFormat seconds={metrics.timeLeft} />
            </div>
            {/* PROGRESS GAUGE */}
            <div className="w-full mt-3 px-2">
              <div className="flex justify-between items-end mb-1.5 opacity-60">
                <span className="text-[8px] font-bold text-(--text-primary) uppercase">
                  Progress
                </span>
                <span className="text-[10px] font-black text-(--accent-primary)">
                  {(progress * 100).toFixed(0)}%
                </span>
              </div>
              <div className="relative flex gap-0.5 h-1.5 w-full">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="relative flex-1 h-full bg-(--text-secondary)/10 rounded-[1px]"
                  >
                    {progress > i / 20 && (
                      <motion.div
                        layoutId={`seg-${i}`}
                        className="absolute inset-0 bg-(--accent-primary) rounded-[1px]"
                        style={{
                          boxShadow:
                            progress < (i + 1) / 20
                              ? "0 0 8px var(--accent-glow)"
                              : "none",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE STATS & ACTIONS */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-(--hud-border)"
            >
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
                  isPrimary={isActive}
                />
              </div>

              <div className="p-4 flex gap-2 h-20">
                {/* START / STOP */}
                <Button
                  onClick={() => {
                    isActive ? handleStopMission() : handleStartMission();
                    triggerToast(
                      isActive ? "Tactical: Aborted" : "Tactical: Initiated",
                      isActive ? "error" : "success"
                    );
                  }}
                  disabled={!route}
                  className={`flex-3 h-full rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all duration-300 border-2 ${
                    isActive
                      ? "bg-transparent border-red-500/50 text-red-500"
                      : "bg-(--accent-primary) border-(--accent-primary) text-(--bg-page) shadow-[0_0_25px_var(--accent-glow)]"
                  }`}
                >
                  {isActive ? "GIVE UP" : "START FOCUS"}
                </Button>

                {/* RESET BUTTON (Smart Component) */}
                <TacticalResetButton onReset={reset} isActive={isActive} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const getFontSize = (seconds: number) => {
  if (seconds >= 86400) return "text-6xl"; // Days + Hrs + Mins + Secs
  if (seconds >= 3600) return "text-7xl"; // Hrs + Mins + Secs
  return "text-8xl"; // Mins + Secs
};
