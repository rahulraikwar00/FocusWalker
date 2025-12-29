import React, { useState } from "react";
import { User, Shield, Target, Save } from "lucide-react";

export const PersonnelDossier = ({ initialData, onSave }: any) => {
  const [profile, setProfile] = useState(
    initialData || {
      callsign: "",
      rank: "Scout",
      bio: "",
    }
  );

  return (
    <div className="max-w-md mx-auto space-y-5 p-1">
      {/* --- COMPACT HEADER SECTION --- */}
      <div className="flex items-center gap-5 pb-4 border-b border-(--hud-border)/30">
        <div className="relative group">
          {/* Hexagonal/Clipped shape for the avatar container */}
          <div className="w-16 h-16 bg-(--accent-primary)/10 border border-(--accent-primary)/40 rounded-tr-2xl rounded-bl-2xl flex items-center justify-center shadow-[inset_0_0_12px_rgba(var(--accent-primary-rgb),0.2)]">
            <User size={32} className="text-(--accent-primary) opacity-80" />
          </div>
          <div className="absolute -top-1 -left-1">
            <Shield
              size={14}
              className="text-(--accent-primary) fill-(--bg-page)"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className="text-lg font-black italic tracking-tight text-(--text-primary) leading-none uppercase">
            Operative Dossier
          </h3>
          <span className="mt-1 text-[9px] font-mono text-(--accent-primary) opacity-70 tracking-tighter">
            REF: // ALPHA-8829-FW
          </span>
        </div>
      </div>

      {/* --- FORM BODY --- */}
      <div className="space-y-5">
        {/* Callsign: Slimmer profile */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end px-1">
            <label className="text-[10px] font-black text-(--text-secondary) tracking-widest uppercase">
              Callsign
            </label>
            <span className="text-[8px] text-(--accent-primary) font-mono opacity-50">
              REQUIRED
            </span>
          </div>
          <input
            type="text"
            value={profile.callsign}
            onChange={(e) =>
              setProfile({ ...profile, callsign: e.target.value })
            }
            placeholder="DESIGNATION..."
            className="w-full bg-(--text-secondary)/5 border border-(--hud-border) rounded-lg px-3 py-2.5 text-sm font-bold text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-(--accent-primary)/50 transition-all"
          />
        </div>

        {/* Roles: Segmented Pill Shape */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-(--text-secondary) tracking-widest uppercase px-1">
            Specialization
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-(--text-secondary)/5 rounded-xl border border-(--hud-border)/50">
            {["Scout", "Hunter", "Ghost"].map((role) => (
              <button
                key={role}
                onClick={() => setProfile({ ...profile, rank: role })}
                className={`py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${
                  profile.rank === role
                    ? "bg-(--accent-primary) text-(--bg-page) shadow-lg"
                    : "text-(--text-secondary) hover:bg-(--text-secondary)/10"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Bio: Optimized for shape */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-(--text-secondary) tracking-widest uppercase px-1">
            Directive
          </label>
          <textarea
            rows={2}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="OBJECTIVES..."
            className="w-full bg-(--text-secondary)/5 border border-(--hud-border) rounded-lg px-3 py-2 text-xs font-medium text-(--text-primary) focus:outline-none focus:border-(--accent-primary)/50 resize-none transition-all leading-relaxed"
          />
        </div>
      </div>

      {/* --- ACTION: Low Profile Button --- */}
      <button
        onClick={() => onSave(profile)}
        className="w-full group relative flex items-center justify-center gap-2 py-3.5 bg-(--text-primary) text-(--bg-page) rounded-lg font-black text-[10px] tracking-[0.25em] uppercase overflow-hidden hover:brightness-90 transition-all"
      >
        <Save size={14} />
        <span>Update Registry</span>
        {/* Subtle decorative edge */}
        <div className="absolute right-0 top-0 h-full w-1 bg-(--accent-primary) opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
};
