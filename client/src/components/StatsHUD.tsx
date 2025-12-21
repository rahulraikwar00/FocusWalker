import { Card } from "./ui/card";

interface StatsHUDProps {
  metrics: {
    timeLeft: number;
    steps: number;
    distDone: number;
  };
  progress: number;
}

export default function StatsHUD({ metrics, progress }: StatsHUDProps) {
  // Helper to format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-[2.5rem] ring-1 ring-black/5">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-800/40 mb-1">
            Time Remaining
          </p>
          <h2 className="text-5xl font-black tabular-nums text-orange-950 tracking-tighter">
            {formatTime(metrics.timeLeft)}
          </h2>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-yellow-400/20 text-yellow-700 text-[10px] font-black rounded-full border border-yellow-200">
            {(progress * 100).toFixed(0)}% DONE
          </span>
        </div>
      </div>

      {/* Yellow Progress Bar */}
      <div className="h-3 w-full bg-orange-50 rounded-full mb-6 overflow-hidden p-0.5 border border-orange-100/50">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Extra Data Row */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-orange-50">
        <div>
          <p className="text-[9px] font-bold text-orange-800/30 uppercase tracking-widest">
            Steps
          </p>
          <p className="text-lg font-black text-orange-950">
            {metrics.steps.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-orange-800/30 uppercase tracking-widest">
            Distance
          </p>
          <p className="text-lg font-black text-orange-950">
            {(metrics.distDone / 1000).toFixed(2)}km
          </p>
        </div>
      </div>
    </Card>
  );
}
