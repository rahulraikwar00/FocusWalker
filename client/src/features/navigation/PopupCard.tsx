import { CheckPointData } from "@/types/types";
import { useEffect, useState } from "react";
import { GiCampingTent } from "react-icons/gi";
import { CameraCapture } from "../mission/CameraCapture";

import { getMissionId, StorageService } from "@/lib/utils";
import { useGlobal } from "../mission/contexts/GlobalContext";

interface PopUpCardProps {
  index: number;
  tent: any;
  handleMarkerClick: (id: string | null) => void;
  setIsActive: (val: boolean) => void;
  points: any;
  locality: string;
}
export const PopUpcard = ({
  index,
  tent,
  handleMarkerClick,
  setIsActive,
  points,
  locality,
}: PopUpCardProps) => {
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [missionId, setMissionId] = useState("");

  const { triggerToast } = useGlobal();

  useEffect(() => {
    if (points) {
      setMissionId(getMissionId(points));
    }
  }, []);
  const userLocation = tent.coords ?? { lat: 0, lng: 0 };

  const close = () => handleMarkerClick(null);

  const handleSave = async () => {
    if (!missionId) {
      console.warn("Mission ID missing, cannot save", points);
      return;
    }

    setIsSaving(true);

    console.log(`Setting up camp in: ${locality}`);
    const DraftCheckPointData: CheckPointData = {
      id: `${missionId}${tent.id}`, // each checkpoint should have its OWN id
      label: locality,
      note,
      timestamp: Date.now().toString(),
      distanceMark: 12012,
    };

    try {
      await StorageService.saveLog(missionId, DraftCheckPointData);
      close();
    } catch (error) {
      console.log(error);
    }
    triggerToast("succesfully saved ...closing the diary...", "success");
    close();
    setIsActive(true);
    setIsSaving(false);
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
          className="w-full h-20 rounded-xl bg-(--bg-primary)/5 p-3 text-[13px] focus:outline-none resize-none"
        />

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
