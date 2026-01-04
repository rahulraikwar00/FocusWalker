import { useEffect, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { GiCampingTent } from "react-icons/gi";

export const PopUpcard = ({
  index,
  handleMarkerClick,
  tent,
  setIsActive,
}: any) => {
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [visitCount, setVisitCount] = useState(0);

  // Load history for this specific tent
  useEffect(() => {
    const stationKey = `trek_log_${tent.id}`;
    const localData = localStorage.getItem(stationKey);

    if (localData) {
      const notes = JSON.parse(localData);
      setVisitCount(notes.length);
      // Optional: don't auto-fill 'note' if you want a fresh one every time
      // setNote(notes[0].message);
    }
  }, [tent.id]);

  const handleSecure = () => {
    const trimmedNote = note.trim();
    if (!trimmedNote) return;

    if ("vibrate" in navigator) navigator.vibrate(20);
    setIsSaving(true);

    const timestamp = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newRecord = {
      tentId: tent.id,
      message: trimmedNote,
      emoji: "⛺",
      timestamp: timestamp,
    };

    try {
      // 1. Update Global Feed
      const globalKey = "treklog";
      const globalLogs = JSON.parse(localStorage.getItem(globalKey) || "[]");
      localStorage.setItem(
        globalKey,
        JSON.stringify([newRecord, ...globalLogs])
      );

      // 2. Update Station-Specific Array
      const stationKey = `trek_log_${tent.id}`;
      const stationLogs = JSON.parse(localStorage.getItem(stationKey) || "[]");

      // PREVENT DUPLICATES: Only save if the message is different from the last one
      if (stationLogs.length === 0 || stationLogs[0].message !== trimmedNote) {
        localStorage.setItem(
          stationKey,
          JSON.stringify([newRecord, ...stationLogs])
        );
      }
    } catch (error) {
      console.error("Local Storage is full or disabled:", error);
    }

    setIsActive(true);

    setTimeout(() => {
      handleMarkerClick();
      setNote("");
      setIsSaving(false);
    }, 400);
    const handlePhotoCapture = (file: File) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;

        // Now you can add this to your CheckPointData
        const newCheckpoint: any = {
          id: crypto.randomUUID(),
          note: "Tactical photo captured",
          timestamp: new Date().toLocaleTimeString(),
          photo: base64String, // This is your string!
        };

        // Save to your route...
      };

      reader.readAsDataURL(file);
    };
  };

  return (
    <div className="glass-card flex flex-col w-60 overflow-hidden shadow-2xl transition-all duration-500 border border-[var(--hud-border)] bg-[var(--hud-bg)] backdrop-blur-xl">
      {/* Header Area */}
      <div className="relative h-24 flex items-center justify-center bg-[var(--accent-glow)]">
        <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-tactical/40" />
        <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-tactical/40" />

        <div className="relative flex flex-col items-center">
          <GiCampingTent
            size={42}
            className="text-tactical filter drop-shadow-[0_0_10px_var(--accent-glow)] mb-1"
          />
          <span className="text-[7px] font-black tracking-[0.2em] text-tactical/60 uppercase">
            {isSaving
              ? "Syncing Data..."
              : `Visit #${visitCount + 1} Authorized`}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col gap-4">
        <div className="space-y-1">
          <span className="block text-[9px] font-black tracking-[0.2em] text-tactical uppercase">
            Discovery Logged
          </span>
          <h3 className="text-[14px] font-black italic tracking-tight text-(--text-primary) uppercase">
            Station {index}
          </h3>
        </div>

        {/* Input Area */}
        <div className="relative rounded-xl border border-(--hud-border) bg-(--text-primary)/5 focus-within:bg-(--text-primary)/10 transition-all">
          <textarea
            placeholder="What did you find here?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSaving}
            className="w-full bg-transparent text-[13px] p-3 text-(--text-primary) font-medium focus:outline-none placeholder:italic placeholder:opacity-30 resize-none h-24 font-sans"
          />
        </div>

        {/* Action Button */}
        <button
          className={`btn-primary w-full text-[11px] uppercase tracking-widest transition-all py-3 flex flex-col items-center ${
            isSaving ? "opacity-50 grayscale" : ""
          }`}
          onClick={handleSecure}
          disabled={isSaving}
        >
          <span className="font-black">
            {isSaving ? "Stored" : "Secure Log"}
          </span>
          <span className="text-[7px] opacity-70 font-medium normal-case">
            Proceed with your journey
          </span>
        </button>
      </div>
    </div>
  );
};
