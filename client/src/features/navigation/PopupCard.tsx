import { CheckPointData } from "@/types/types";
import { useEffect, useState } from "react";
import { GiCampingTent } from "react-icons/gi";
import { CameraCapture } from "../mission/CameraCapture";

import { getMissionId, StorageService } from "@/lib/utils";
import { useGlobal } from "../mission/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMissionContext } from "../mission/contexts/MissionContext";

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
  const [visitCount, setVisitCount] = useState(0);
  const [cameraCaptureData, setcameraCaptureData] = useState<string>();
  const { missionStates, setMissionStates } = useMissionContext();

  const { triggerToast } = useGlobal();

  const userLocation = tent.coords ?? { lat: 0, lng: 0 };
  const close = () => handleMarkerClick(null);

  const handleCameraAction = (photoBase64: string) => {
    setcameraCaptureData(photoBase64);
    console.log("Photo received in PopUpcard");
  };

  const handleSave = async () => {
    if (!missionStates.currentMissionId) {
      console.warn("Mission ID missing, cannot save");
      return;
    }

    setIsSaving(true);

    const DraftCheckPointData: CheckPointData = {
      id: `${missionStates.currentMissionId}${tent.id}`,
      label: locality,
      note,
      timestamp: Date.now().toString(),
      distanceMark: 12012,
      // FIX: Ensure picture is actually included in the save object
      picture: cameraCaptureData,
    };

    try {
      await StorageService.saveLog(
        missionStates.currentMissionId,
        DraftCheckPointData
      );
      triggerToast("Successfully saved diary...", "success");
      close();
      setMissionStates({
        ...missionStates,
        missionStatus: "active",
      });
    } catch (error) {
      console.log(error);
      triggerToast("Error saving progress", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // This stops the click from reaching the map
  };
  return (
    <div
      onClick={handleContentClick}
      onMouseDown={handleContentClick}
      className="glass-card flex flex-col w-60 overflow-hidden shadow-2xl border border-(--hud-border) bg-(--hud-bg) backdrop-blur-xl"
    >
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
        <Textarea
          placeholder="What did you notice here?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isSaving}
          className="w-full h-20 rounded-xl bg-(--bg-primary)/5 p-3 text-[13px] focus:outline-none resize-none"
        />

        {/* FIX 1: Pass the function directly so it receives the base64 argument */}
        {!cameraCaptureData ? (
          <CameraCapture onCapture={handleCameraAction} />
        ) : (
          <div className="relative animate-in fade-in zoom-in duration-300">
            <img
              src={cameraCaptureData}
              alt="Preview"
              className="w-full h-24 object-cover rounded-lg border border-white/10"
            />
            <button
              onClick={() => setcameraCaptureData(undefined)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary w-full py-3 text-[11px] uppercase tracking-widest"
        >
          {isSaving ? "Recording…" : "Log Progress"}
        </Button>
      </div>
    </div>
  );
};
