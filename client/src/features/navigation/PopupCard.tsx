import { useState } from "react";
import { GiCampingTent } from "react-icons/gi";

// Corrected component definition with destructuring
export const PopUpcard = ({
  index,
  onSecure,
  tent,
}: {
  index: number;
  onSecure: any;
  tent: any;
}) => {
  const [note, setNote] = useState("");

  const handleSecure = () => {
    if (note.trim()) {
      localStorage.setItem(`trek_log_${tent.id}`, note);
    }
    onSecure(tent.id, note);
  };

  const distance = 25 * (index + 1);

  return (
    <div className="glass-card flex flex-col rounded-3xl overflow-hidden w-40 border border-(--hud-border)">
      {/* Visual Header: Simple and soft */}
      <div className="flex flex-col items-center justify-center pt-5 pb-3 bg-(--accent-glow)">
        <div className="relative">
          <GiCampingTent
            size={42}
            className="text-(--accent-primary) drop-shadow-[0_0_10px_var(--accent-glow)]"
          />
          {/* Subtle floor glow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-(--accent-primary) blur-md opacity-50" />
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col gap-1 text-center bg-(--hud-bg)">
        <span className="text-[10px] font-bold tracking-[0.2em] text-(--text-secondary) uppercase">
          MILESTONE {index + 1}
        </span>

        <h3 className="text-sm font-black italic tracking-tight text-(--text-primary) uppercase">
          Field Station
        </h3>

        <p className="text-[11px] leading-tight text-(--text-secondary) mb-3 font-medium">
          {25 * (index + 1)}m voyage complete. <br /> Intel ready for log.
        </p>

        {/* <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add log entry..."
          className="w-full placeholder-gray-500 focus:outline-none resize-none"
          rows={3}
        /> */}
        {/* Action Button */}
        <button
          className="btn-primary w-full text-[10px] py-2 px-0 uppercase tracking-widest cursor-pointer"
          onClick={() => handleSecure()}
        >
          Secure Camp
        </button>
      </div>
    </div>
  );
};
