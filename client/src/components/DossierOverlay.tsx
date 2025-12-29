import React, { useState } from "react";
import { User, Shield, Target, Save } from "lucide-react";
import { motion } from "framer-motion";

export const PersonnelDossier = ({ initialData, onSave }: any) => {
  const [profile, setProfile] = useState(
    initialData || {
      callsign: "",
      rank: "Scout",
      bio: "",
    }
  );

  return (
    <div className="space-y-6">
      {/* --- PROFILE AVATAR SECTION --- */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-(--accent-primary)/10 border-2 border-(--accent-primary) flex items-center justify-center shadow-[0_0_20px_var(--accent-glow)]">
            <User size={40} className="text-(--accent-primary)" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-(--bg-page) border border-(--hud-border) p-1.5 rounded-lg">
            <Shield size={12} className="text-(--accent-primary)" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-black italic tracking-tighter text-(--text-primary) uppercase">
            Operative Profile
          </h3>
          <p className="text-[10px] text-(--text-secondary) font-bold tracking-widest uppercase opacity-60">
            ID: FW-8829-ALPHA
          </p>
        </div>
      </div>

      {/* --- INPUT FIELDS --- */}
      <div className="space-y-4">
        {/* Callsign Input */}
        <div className="group">
          <label className="block text-[9px] font-black text-(--accent-primary) tracking-[0.2em] mb-2 ml-1">
            CALLSIGN (NAME)
          </label>
          <input
            type="text"
            value={profile.callsign}
            onChange={(e) =>
              setProfile({ ...profile, callsign: e.target.value })
            }
            placeholder="ENTER IDENTITY..."
            className="w-full bg-(--text-secondary)/5 border border-(--hud-border) rounded-xl px-4 py-3 text-sm font-bold text-(--text-primary) placeholder:text-(--text-secondary)/30 focus:outline-none focus:border-(--accent-primary) focus:ring-1 focus:ring-(--accent-primary) transition-all"
          />
        </div>

        {/* Rank/Role Display */}
        <div className="group">
          <label className="block text-[9px] font-black text-(--accent-primary) tracking-[0.2em] mb-2 ml-1">
            ASSIGNED ROLE
          </label>
          <div className="flex gap-2">
            {["Scout", "Hunter", "Ghost"].map((role) => (
              <button
                key={role}
                onClick={() => setProfile({ ...profile, rank: role })}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase border transition-all ${
                  profile.rank === role
                    ? "bg-(--accent-primary) border-(--accent-primary) text-(--bg-page)"
                    : "bg-transparent border-(--hud-border) text-(--text-secondary)"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Bio / Mission Objectives */}
        <div className="group">
          <label className="block text-[9px] font-black text-(--accent-primary) tracking-[0.2em] mb-2 ml-1">
            MISSION DIRECTIVE (BIO)
          </label>
          <textarea
            rows={3}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="DEFINE YOUR FOCUS OBJECTIVES..."
            className="w-full bg-(--text-secondary)/5 border border-(--hud-border) rounded-xl px-4 py-3 text-sm font-bold text-(--text-primary) placeholder:text-(--text-secondary)/30 focus:outline-none focus:border-(--accent-primary) resize-none transition-all"
          />
        </div>
      </div>

      {/* --- SAVE ACTION --- */}
      <button
        onClick={() => onSave(profile)}
        className="w-full mt-4 flex items-center justify-center gap-3 py-4 bg-(--text-primary) text-(--bg-page) rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-110 active:scale-[0.98] transition-all shadow-xl"
      >
        <Save size={16} />
        Update Dossier
      </button>
    </div>
  );
};
