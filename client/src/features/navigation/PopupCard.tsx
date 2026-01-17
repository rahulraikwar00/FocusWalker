import { CheckPointData } from "@/types/types";
import { useState } from "react";
import { GiCampingTent, GiCheckMark } from "react-icons/gi";
import { CameraCapture } from "../mission/CameraCapture";
import { useGlobal } from "../mission/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMissionContext } from "../mission/contexts/MissionContext";
import { StorageService } from "@/lib/storageService";

interface PopUpCardProps {
  index: number;
  tent: any;
  handleMarkerClick: (id: string | null) => void;
  locality: string;
}

export const PopUpcard = ({
  index,
  tent,
  handleMarkerClick,
  locality,
}: PopUpCardProps) => {
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [cameraCaptureData, setcameraCaptureData] = useState<string>();

  const { missionStates, setMissionStates } = useMissionContext();
  const { triggerToast } = useGlobal();

  const userLocation = tent.coords ?? { lat: 0, lng: 0 };
  const close = () => handleMarkerClick(null);

  const handleSave = async () => {
    if (!missionStates.currentMissionId) return;
    setIsSaving(true);

    const DraftCheckPointData: CheckPointData = {
      checkPointId: `${missionStates.currentMissionId}_WP${index}`,
      missionId: missionStates.currentMissionId,
      label: locality || "Point of Interest",
      note: note.trim(),
      timestamp: new Date().toISOString(),
      distanceMark: tent.distanceMark || 0,
      picture: cameraCaptureData,
    };

    try {
      await StorageService.addSingleCheckpoint(
        missionStates.currentMissionId,
        DraftCheckPointData
      );
      setIsDone(true);
      triggerToast("Intel Logged", "success");

      setTimeout(() => {
        close();
        setMissionStates((prev) => ({ ...prev, missionStatus: "active" }));
      }, 1000);
    } catch (error) {
      triggerToast("Log Failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="glass-card flex flex-col w-64 overflow-hidden border-hud-border shadow-2xl animate-in fade-in zoom-in duration-300"
    >
      {/* Dynamic Header */}
      <div className="relative h-24 flex flex-col items-center justify-center bg-(--accent-glow) overflow-hidden">
        {/* Subtle grid overlay for tactical feel */}
        <div className="absolute inset-0 opacity-10 paper-ruled pointer-events-none" />

        {isDone ? (
          <GiCheckMark size={32} className="text-tactical animate-bounce" />
        ) : (
          <GiCampingTent
            size={38}
            className={`transition-all duration-500 ${
              isSaving ? "animate-pulse opacity-50" : "text-tactical"
            }`}
          />
        )}
        <span className="mt-2 text-[9px] font-black uppercase tracking-[0.3em] text-tactical">
          {isSaving
            ? "Syncing..."
            : isDone
            ? "Waypoint Secured"
            : `Waypoint ${index}`}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="max-w-[60%]">
            <h4 className="text-[10px] uppercase font-bold text-(--text-secondary) tracking-widest leading-none mb-1">
              Locality
            </h4>
            <p className="text-[12px] font-black uppercase truncate text-(--text-primary)">
              {locality.split(",")[0]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-mono text-(--text-secondary)">
              {userLocation.lat.toFixed(4)}° N
            </p>
            <p className="text-[8px] font-mono text-(--text-secondary)">
              {userLocation.lng.toFixed(4)}° E
            </p>
          </div>
        </div>

        {/* Observation Log */}
        <div className="relative">
          <Textarea
            placeholder="Log your observations..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSaving || isDone}
            className="w-full h-20 rounded-xl bg-(--text-primary)/5 border-none p-3 text-[12px] text-(--text-primary) placeholder:opacity-30 focus:ring-1 focus:ring-tactical transition-all resize-none shadow-inner"
          />
        </div>

        {/* Intel Capture (Camera) */}
        <div className="w-full">
          {!cameraCaptureData ? (
            <div className="rounded-xl border border-dashed border-hud-border hover:bg-(--accent-glow) transition-colors">
              <CameraCapture onCapture={setcameraCaptureData} />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-hud-border group">
              <img
                src={cameraCaptureData}
                alt="Intel"
                className="w-full h-24 object-cover grayscale-[30%] group-hover:grayscale-0 transition-all"
              />
              <button
                onClick={() => setcameraCaptureData(undefined)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center shadow-lg"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <Button
          onClick={handleSave}
          disabled={isSaving || isDone}
          className="btn-primary w-full py-4 text-[10px] uppercase tracking-[0.2em] h-auto flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : isDone ? (
            "Verified"
          ) : (
            "Log Waypoint"
          )}
        </Button>
      </div>
    </div>
  );
};
