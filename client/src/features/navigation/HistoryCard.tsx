import { Calendar, Trash2 } from "lucide-react";

export const HistoryCard = ({ data }: { data: any }) => {
  return (
    <div className="group relative p-4 bg-hud/30 border border-(--hud-border) rounded-2xl hover:border-(--accent-primary)/40 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-(--accent-primary)" />
          <span className="text-[10px] font-bold text-(--text-secondary) uppercase">
            {data.date || "Tactical Session"}
          </span>
        </div>
        <span className="text-[10px] font-black text-(--accent-primary) bg-(--accent-primary)/10 px-2 py-0.5 rounded-full">
          {data.distance}m
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
          <p className="text-xs text-(--text-primary) truncate font-medium">
            {data.startName || "Origin Point"}
          </p>
        </div>
        <div className="w-px h-3 bg-(--hud-border) ml-[2.5px]" />
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <p className="text-xs text-(--text-primary) truncate font-medium">
            {data.endName || "Destination Target"}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-(--hud-border)/50 flex justify-between items-center">
        <div className="text-[9px] text-(--text-secondary) uppercase font-bold">
          Duration:{" "}
          <span className="text-(--text-primary)">{data.duration} min</span>
        </div>
        <button className="text-(--text-secondary) hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
