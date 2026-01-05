import React from "react";
import { ShieldCheck, Activity, Clock } from "lucide-react";
import { RouteData } from "@/types/types";
export const MissionDetailView = ({ mission }: { mission: RouteData }) => {
  if (!mission) return null;

  return (
    <div className="flex flex-col h-full bg-(--hud-bg) text-(--text-primary) overflow-hidden font-sans">
      {/* Header Info: Added a subtle gradient background */}
      <div className="p-6 border-b border-(--hud-border) bg-gradient-to-b from-hud/20 to-transparent">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-tactical animate-pulse" />
              <span className="text-tactical text-[9px] font-black tracking-[0.3em] uppercase opacity-70">
                Mission Intelligence Report
              </span>
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
              {mission.missionName}
            </h2>
            <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">
              OP_REF: {mission.id.split("_")[1]}
            </p>
          </div>
          <div className="bg-tactical/5 border border-tactical/20 px-3 py-1.5 rounded-sm text-tactical text-[9px] font-black uppercase tracking-tighter flex items-center gap-2">
            <ShieldCheck size={12} />
            {mission.status}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatBlock
            label="Dist"
            value={`${(mission.totalDistance / 1000).toFixed(2)}km`}
          />
          <StatBlock
            label="Time"
            value={`${Math.round(mission.totalDuration / 60)}m`}
          />
          <StatBlock label="Logs" value={mission.logs.length.toString()} />
        </div>
      </div>

      {/* Timeline of Logs: Added custom scrollbar for tactical feel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar pb-20">
        {mission.logs.map((log, idx) => (
          <div
            key={log.id}
            className="relative pl-8 border-l border-white/10 group"
          >
            {/* Timeline Dot with outer ring */}
            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-tactical ring-4 ring-tactical/10" />

            <div className="flex flex-col gap-3 group-hover:translate-x-1 transition-transform duration-300">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-wider text-tactical flex items-center gap-2">
                    <span className="opacity-30">[{idx + 1}]</span> {log.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono opacity-40">
                  <Clock size={10} />
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {log.note && (
                <div className="relative">
                  <div className="absolute left-0 top-0 w-1 h-full bg-tactical/20" />
                  <p className="text-[13px] text-(--text-secondary)/90 leading-relaxed pl-4 italic">
                    {log.note}
                  </p>
                </div>
              )}

              {log.photo && (
                <div className="relative mt-2 rounded-lg overflow-hidden border border-(--hud-border) bg-black/40 group/photo">
                  {/* Evidence Scan Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-tactical/5 to-transparent h-1/2 w-full animate-scan opacity-0 group-hover/photo:opacity-100 pointer-events-none" />

                  <img
                    src={log.photo}
                    alt="Intelligence"
                    className="w-full object-cover max-h-64 grayscale-[0.4] group-hover/photo:grayscale-0 contrast-125 transition-all duration-700"
                  />

                  <div className="absolute top-2 right-2 flex gap-1">
                    <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[7px] font-mono text-tactical border border-tactical/30">
                      SECURED_DATA
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Internal Stat Block Sub-component - Updated for better alignment */
const StatBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-[8px] font-black text-tactical uppercase tracking-[0.2em] opacity-50 mb-1">
      {label}
    </span>
    <span className="text-[16px] font-bold tracking-tight text-(--text-primary) font-mono border-l-2 border-tactical/30 pl-2">
      {value}
    </span>
  </div>
);
