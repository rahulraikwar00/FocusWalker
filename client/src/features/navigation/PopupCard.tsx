import { useMission } from "@/components/shared/useMissionStore";
import { CheckPointData } from "@/types/types";
import { useEffect, useState } from "react";
import { GiCampingTent } from "react-icons/gi";
import { CameraCapture } from "../mission/CameraCapture";

interface PopUpCardProps {
  index: number;
  tent: any;
  handleMarkerClick: (id: string | null) => void;
  setIsActive: (val: boolean) => void;
}

export const PopUpcard = ({
  index,
  tent,
  handleMarkerClick,
  setIsActive,
}: PopUpCardProps) => {
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const { getLogsByStation, addCheckpoint } = useMission();

  const userLocation = tent.coords ?? { lat: 0, lng: 0 };

  useEffect(() => {
    const fetchVisitCount = async () => {
      const logs = await getLogsByStation(tent.id);
      setVisitCount(logs?.length ?? 0);
    };
    fetchVisitCount();
  }, [tent.id, getLogsByStation]);

  const close = () => handleMarkerClick(null);

  const handleSave = async () => {
    setIsSaving(true);

    const newLog: CheckPointData = {
      id: `log_${Date.now()}`,
      label: tent.label || "Waypoint",
      note,
      timestamp: new Date().toISOString(),
      distanceMark: tent.distanceMark,
      photo: capturedPhoto || undefined,
      coords: userLocation,
    };

    try {
      await addCheckpoint(newLog);
      setCapturedPhoto(null);
      setIsActive(true);
      close();
    } catch (err) {
      console.error("Failed to save checkpoint", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card flex flex-col w-60 overflow-hidden shadow-2xl border border-(--hud-border) bg-(--hud-bg) backdrop-blur-xl">
      {/* Header */}
      <div className="relative h-24 flex items-center justify-center bg-(--accent-glow)">
        <GiCampingTent
          size={40}
          className={`mb-1 transition-all ${
            isSaving ? "animate-pulse text-white" : "text-tactical"
          }`}
        />
        <span className="absolute bottom-3 text-[8px] tracking-widest uppercase text-tactical/60">
          {isSaving ? "Saving progress…" : `Visit ${visitCount + 1}`}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[9px] tracking-widest uppercase text-tactical/60">
              Journey Update
            </span>
            <h3 className="text-[14px] font-black uppercase">
              Waypoint {index}
            </h3>
          </div>

          <span className="text-[8px] font-mono text-tactical/40">
            {userLocation.lat.toFixed(4)} / {userLocation.lng.toFixed(4)}
          </span>
        </div>

        {/* Notes */}
        <textarea
          placeholder="What did you notice here?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isSaving}
          className="w-full h-20 rounded-xl bg-(--text-primary)/5 p-3 text-[13px] focus:outline-none resize-none"
        />

        {/* Photo */}
        {!capturedPhoto ? (
          <CameraCapture onPhotoTaken={setCapturedPhoto} />
        ) : (
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={capturedPhoto}
              className="h-24 w-full object-cover"
              alt="Checkpoint"
            />
            <button
              onClick={() => setCapturedPhoto(null)}
              className="absolute top-2 right-2 text-[9px] px-2 py-1 bg-black/70 text-white rounded"
            >
              Remove
            </button>
          </div>
        )}

        {/* Action */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary w-full py-3 text-[11px] uppercase tracking-widest"
        >
          {isSaving ? "Recording…" : "Log Progress"}
        </button>
      </div>
    </div>
  );
};
