import { useMission } from "@/components/shared/useMissionStore";
import { CheckPointData } from "@/types/types";
import { useEffect, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { GiCampingTent } from "react-icons/gi";
import { CameraCapture } from "../mission/CameraCapture";

export const PopUpcard = ({
  index,
  handleMarkerClick,
  tent,
  setIsActive,
}: any) => {
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const { getLogsByStation } = useMission();

  const userLocation = tent.coords || { lat: 0, lng: 0 };

  const close = () => {
    handleMarkerClick(null);
  };

  useEffect(() => {
    const fetchVisitCount = async () => {
      // Instead of localStorage, we check our detail bucket
      const logs = await getLogsByStation(tent.id);
      if (logs) {
        setVisitCount(logs.length);
      }
    };

    fetchVisitCount();
  }, [tent.id]);

  const { addCheckpoint } = useMission();

  const handleSecure = async () => {
    // 1. Start loading state
    setIsSaving(true);

    // 2. Build the log object based on current component state
    const newLog: CheckPointData = {
      id: `log_${Date.now()}`,
      label: tent.label || "Checkpoint",
      note: note, // from your textarea state
      timestamp: new Date().toISOString(),
      distanceMark: tent.distanceMark, // from your route state
      photo: capturedPhoto || undefined,
      coords: {
        lat: userLocation.lat,
        lng: userLocation.lng,
      },
    };

    try {
      await addCheckpoint(newLog);
      setCapturedPhoto(null); // Clear for next use
      setIsActive(true);
      close();
    } catch (error) {
      console.error("Failed to secure log:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card flex flex-col w-60 overflow-hidden shadow-2xl transition-all duration-500 border border-(--hud-border) bg-(--hud-bg) backdrop-blur-xl">
      {/* Header Area: Added scanline effect and better glow */}
      <div className="relative h-24 flex items-center justify-center bg-(--accent-glow) overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-size-[100%_2px,3px_100%] pointer-events-none" />

        <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-tactical/40" />
        <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-tactical/40" />

        <div className="relative flex flex-col items-center z-20">
          <GiCampingTent
            size={42}
            className={`filter drop-shadow-[0_0_10px_var(--accent-glow)] mb-1 transition-all duration-700 ${
              isSaving ? "animate-pulse text-white" : "text-tactical"
            }`}
          />
          <span className="text-[7px] font-black tracking-[0.2em] text-tactical/60 uppercase">
            {isSaving
              ? "Uplinking Intel..."
              : `Visit #${visitCount + 1} Authorized`}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="block text-[9px] font-black tracking-[0.2em] text-tactical uppercase">
              Discovery Logged
            </span>
            <h3 className="text-[14px] font-black italic tracking-tight text-(--text-primary) uppercase">
              Station {index}
            </h3>
          </div>
          {/* Small coordinate readout for flavor */}
          <span className="text-[8px] font-mono text-tactical/40 mb-1">
            {userLocation.lat.toFixed(4)} / {userLocation.lng.toFixed(4)}
          </span>
        </div>

        {/* Input Area */}
        <div className="relative rounded-xl border border-(--hud-border) bg-(--text-primary)/5 focus-within:bg-(--text-primary)/10 transition-all">
          <textarea
            placeholder="Enter field notes..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSaving}
            className="w-full bg-transparent text-[13px] p-3 text-(--text-primary) font-medium focus:outline-none placeholder:italic placeholder:opacity-30 resize-none h-20 font-sans"
          />
        </div>

        {/* Photo Evidence Slot */}
        {!capturedPhoto ? (
          <CameraCapture
            onPhotoTaken={(base64: string) => setCapturedPhoto(base64)}
          />
        ) : (
          <div className="relative group rounded-lg border-2 border-dashed border-tactical/30 bg-black/40 p-1">
            <div className="relative h-24 w-full rounded-md overflow-hidden">
              <img
                src={capturedPhoto}
                className="w-full h-full object-cover grayscale-[0.5] contrast-125"
                alt="Captured"
              />
              <div className="absolute inset-0 bg-tactical/10 pointer-events-none" />

              <button
                onClick={() => setCapturedPhoto(null)}
                className="absolute top-2 right-2 bg-red-900/80 hover:bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded backdrop-blur-md border border-white/20 transition-colors"
              >
                PURGE
              </button>
            </div>
            <div className="absolute -bottom-2 left-2 px-2 bg-(--hud-bg) text-[8px] font-black text-tactical uppercase border border-(--hud-border)">
              Evidence_01.jpg
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          className={`relative group overflow-hidden btn-primary w-full text-[11px] uppercase tracking-widest transition-all py-3 flex flex-col items-center border border-tactical/50 ${
            isSaving ? "cursor-wait" : "active:scale-95"
          }`}
          onClick={handleSecure}
          disabled={isSaving}
        >
          {/* Button background loading bar effect */}
          {isSaving && (
            <div className="absolute inset-0 bg-tactical/20 animate-[loading_2s_ease-in-out_infinite]" />
          )}

          <span className="font-black z-10">
            {isSaving ? "Encrypting..." : "Secure Log"}
          </span>
          <span className="text-[7px] opacity-70 font-medium normal-case z-10">
            {isSaving ? "Finalizing transmission" : "Proceed with your journey"}
          </span>
        </button>
      </div>
    </div>
  );
};
