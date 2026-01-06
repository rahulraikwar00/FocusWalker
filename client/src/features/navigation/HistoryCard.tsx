import { Calendar, Trash2, History, Target } from "lucide-react";
import { RouteData } from "@/types/types";

interface HistoryCardProps {
  // We extend the omit to ensure we have a count without the heavy array
  data: Omit<RouteData, "logs"> & { logCount?: number };
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const HistoryCard = ({ data, onSelect, onDelete }: HistoryCardProps) => {
  return (
    <div
      onClick={() => onSelect(data.id)}
      className="group relative p-4 bg-hud/20 border border-(--hud-border) rounded-xl hover:bg-(--accent-primary)/5 hover:border-(--accent-primary)/40 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background Decor - Visual depth */}
      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <History size={40} />
      </div>

      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h4 className="text-[13px] font-black uppercase tracking-tight text-(--text-primary) group-hover:text-tactical transition-colors">
            {data.missionName || "Unnamed Mission"}
          </h4>
          <div className="flex items-center gap-2 text-[10px] text-tactical/60 font-mono mt-1">
            <Calendar size={10} className="opacity-70" />
            {new Date(data.timestamp).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            <span className="opacity-30">|</span>
            <span className="uppercase tracking-tighter">
              ID: {data.id.split("_")[1] || "N/A"}
            </span>
          </div>
        </div>

        {/* Status Tag */}
        <div
          className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase border tracking-widest ${
            data.status === "completed"
              ? "border-green-500/30 text-green-500 bg-green-500/10 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
              : "border-orange-500/30 text-orange-500 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.1)]"
          }`}
        >
          {data.status}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 relative z-10">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[7px] uppercase text-tactical/40 font-black tracking-widest">
              Distance
            </span>
            <span className="text-[12px] font-mono font-bold text-(--text-primary)">
              {(data.totalDistance / 1000).toFixed(2)}{" "}
              <span className="text-[9px] opacity-50">KM</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[7px] uppercase text-tactical/40 font-black tracking-widest">
              Intel
            </span>
            <div className="flex items-center gap-1">
              <Target size={10} className="text-tactical/60" />
              <span className="text-[12px] font-mono font-bold text-(--text-primary)">
                {data.logCount || 0}{" "}
                <span className="text-[9px] opacity-50">PTS</span>
              </span>
            </div>
          </div>
        </div>

        {/* Delete Button - Enhanced hover state */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Archive this data permanently?")) {
              onDelete(data.id);
            }
          }}
          className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/20"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Bottom Progress Bar Decor */}
      <div className="absolute bottom-0 left-0 h-[1px] bg-tactical/20 w-full overflow-hidden">
        <div className="h-full bg-tactical w-1/3 group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
      </div>
    </div>
  );
};
