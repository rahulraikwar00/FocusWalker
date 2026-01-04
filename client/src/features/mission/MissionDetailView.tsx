import React from "react";
import { MessageSquare, ShieldCheck, Activity } from "lucide-react";

interface MissionDetailProps {
  mission: {
    id: string;
    startName?: string;
    endName?: string;
    distance: number;
    duration: number;
    timestamp: string;
    tents?: Array<{
      id: string;
      note: string;
      timestamp: string;
      distanceMark?: number;
    }>;
  };
}

export const MissionDetailView = ({ mission }: MissionDetailProps) => {
  if (!mission) return null;

  return <div>mission deails</div>;
};

/* Internal Stat Block Sub-component */
const StatBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-black text-(--text-secondary) uppercase tracking-widest opacity-40 mb-1">
      {label}
    </span>
    <span className="text-[17px] font-bold tracking-tighter text-(--text-primary)">
      {value}
    </span>
  </div>
);
