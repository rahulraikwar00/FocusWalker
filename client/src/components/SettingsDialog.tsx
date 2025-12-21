import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Info, MapPin, Activity, Settings2, Ruler } from "lucide-react";

interface SettingsPanelProps {
  startPos: { lat: number; lng: number } | null;
  endPos: { lat: number; lng: number } | null;
  distanceText: string;
  totalDuration: number;
  steps: number;
  progress: number;
  routeData: any;
  METERS_PER_STEP: number;
  WALKING_SPEED_KMH: number;
}

export default function SettingsPanel({
  startPos,
  endPos,
  distanceText,
  totalDuration,
  steps,
  progress,
  routeData,
  METERS_PER_STEP,
  WALKING_SPEED_KMH,
}: SettingsPanelProps) {
  const formatFullTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) return "0s";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);

    return parts.join(" ");
  };

  return (
    <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh] bg-white border-none rounded-[2rem] shadow-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-2xl font-black text-orange-950">
          <Settings2 className="w-6 h-6 text-yellow-500" />
          Mission Details
        </DialogTitle>
        <DialogDescription className="text-orange-900/60 font-medium">
          Technical breakdown of your active route trajectory.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 pt-4">
        {/* SECTION: Live Stats */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-orange-800/40 uppercase tracking-[0.2em]">
            <Activity className="w-3.5 h-3.5" />
            Live Telemetry
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DataCard label="Steps Taken" value={steps.toLocaleString()} />
            <DataCard
              label="Progress"
              value={`${(progress * 100).toFixed(1)}%`}
              highlight
            />
          </div>
        </section>

        <Separator className="bg-orange-50" />

        {/* SECTION: Route Geometry */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-orange-800/40 uppercase tracking-[0.2em]">
            <MapPin className="w-3.5 h-3.5" />
            Coordinates
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-orange-900/40 uppercase">
                Origin
              </span>
              <span className="font-mono text-xs font-bold text-orange-950">
                {startPos
                  ? `${startPos.lat.toFixed(4)}, ${startPos.lng.toFixed(4)}`
                  : "NOT SET"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-orange-900/40 uppercase">
                Target
              </span>
              <span className="font-mono text-xs font-bold text-orange-950">
                {endPos
                  ? `${endPos.lat.toFixed(4)}, ${endPos.lng.toFixed(4)}`
                  : "NOT SET"}
              </span>
            </div>
          </div>
        </section>

        <Separator className="bg-orange-50" />

        {/* SECTION: Route Summary */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-orange-800/40 uppercase tracking-[0.2em]">
            <Info className="w-3.5 h-3.5" />
            Parameters
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 px-1">
            <DetailItem
              label="Est. Duration"
              value={formatFullTime(totalDuration)}
            />
            <DetailItem label="Total Distance" value={distanceText} />
            <DetailItem label="Stride Length" value={`${METERS_PER_STEP}m`} />
            <DetailItem
              label="Target Speed"
              value={`${WALKING_SPEED_KMH} km/h`}
            />
          </div>
        </section>

        {/* FOOTER: Environmental Config */}
        <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex gap-3 items-start">
          <Ruler className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-yellow-700 font-bold leading-relaxed">
            Physics engine using {METERS_PER_STEP}m step-constant at{" "}
            {WALKING_SPEED_KMH}km/h uniform velocity.
          </p>
        </div>
      </div>
    </DialogContent>
  );
}

function DataCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        highlight
          ? "bg-yellow-400 border-yellow-500 shadow-lg shadow-yellow-100"
          : "bg-white border-orange-100"
      }`}
    >
      <p
        className={`text-[9px] uppercase font-black mb-1 ${
          highlight ? "text-yellow-900/60" : "text-orange-800/40"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-xl font-black tabular-nums ${
          highlight ? "text-orange-950" : "text-orange-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold text-orange-800/40 uppercase">
        {label}
      </p>
      <p className="font-black text-orange-950 tabular-nums">{value}</p>
    </div>
  );
}
