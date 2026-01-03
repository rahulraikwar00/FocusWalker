import { useState } from "react";
import { GiCampingTent } from "react-icons/gi";

interface PopUpcardProps {
  index: number;
  handleMarkerClick: () => void; // This is ClosePopup from the parent
  tent: any;
  setIsActive: (val: boolean) => void; // Added to resume movement
}

export const PopUpcard = ({
  index,
  handleMarkerClick,
  tent,
  setIsActive,
}: PopUpcardProps) => {
  const [note, setNote] = useState("");

  const handleSecure = () => {
    // 1. Save data (Intel)
    if (note.trim()) {
      localStorage.setItem(`trek_log_${tent.id}`, note);
    }
    setIsActive(true);
    handleMarkerClick();
    console.log(`Station ${tent.id} Secured. Journey Resumed.`);
  };

  return (
    <div className="glass-card flex flex-col rounded-3xl overflow-hidden w-44 border border-(--hud-border) shadow-2xl">
      {/* Visual Header: Tactical Glow */}
      <div className="flex flex-col items-center justify-center pt-5 pb-3 bg-(--accent-glow)/20">
        <div className="relative">
          <GiCampingTent
            size={42}
            className="text-(--accent-primary) drop-shadow-[0_0_10px_var(--accent-glow)]"
          />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-(--accent-primary) blur-md opacity-50" />
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col gap-1 text-center bg-(--hud-bg)">
        <span className="text-[9px] font-bold tracking-[0.2em] text-(--text-secondary) uppercase opacity-60">
          Sector {index + 1} Reached
        </span>

        <h3 className="text-xs font-black italic tracking-tight text-(--text-primary) uppercase mb-1">
          Field Station Alpha
        </h3>

        {/* Tactical Log Input */}
        <textarea
          placeholder="Enter intel..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="bg-black/40 border border-(--hud-border) text-[10px] p-2 mb-3 text-white rounded-lg focus:outline-none focus:border-(--accent-primary) placeholder:opacity-30 resize-none h-12"
        />

        <button
          className="btn-primary w-full text-[10px] py-2.5 px-0 uppercase tracking-[0.15em] font-bold cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.2)]"
          onClick={handleSecure}
        >
          Secure & Resume
        </button>
      </div>
    </div>
  );
};
