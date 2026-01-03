import React, { useState } from "react";
import { Avatar } from "../../components/shared/Avatar";
import { useGlobal, UserData } from "@/features/mission/contexts/GlobalContext";

export const PersonnelDossier = () => {
  // 1. Hook into Global Context
  const { user, setUI, triggerToast } = useGlobal();

  const [profile, setProfile] = useState<UserData>({
    id: user?.id || `UX-${Math.floor(Math.random() * 9000) + 1000}`,
    name: user?.name || "FOCUS WALKER",
    rank: user?.rank || "Scout",
    unit: user?.unit || "ALPHA-6",
    clearance: user?.clearance || "LEVEL 1",
    avatar: user?.avatar || "",
    bio: user?.bio || "",
  });
  const handleApply = () => {
    // 2. Prepare the payload (ensure all UserData fields are present)
    const updatedUser: UserData = {
      ...profile,
      // We can auto-update clearance or unit based on rank if needed
      clearance: profile.rank === "Ghost" ? "LEVEL 4" : "LEVEL 1",
    };

    // 3. Sync to Global Context
    setUI({ user: updatedUser });

    // 4. Persistence
    localStorage.setItem("user_dossier", JSON.stringify(updatedUser));

    // 5. Tactical Feedback
    triggerToast("Personnel Record Synced", "success");
  };

  return (
    <div className="max-w-md mx-auto space-y-8 p-2">
      {/* --- 1. USER IDENTITY --- */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-(--accent-primary)/10 rounded-2xl flex items-center justify-center border border-(--accent-primary)/20 overflow-hidden">
          <Avatar seed={profile.name || "Ghost"} size={64} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-(--text-primary)">
            Personnel Dossier
          </h3>
          <p className="text-xs text-(--text-secondary)">
            ID: {profile.rank.toUpperCase()}-{Math.floor(Math.random() * 1000)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* --- 2. NAME INPUT --- */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-(--text-secondary) px-1">
            Tactical Callsign
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Enter callsign..."
            className="w-full bg-(--text-secondary)/5 border border-(--hud-border) rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/30 transition-all text-(--text-primary)"
          />
        </div>

        {/* --- 3. ROLE SELECTION --- */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-(--text-secondary) px-1">
            Assigned Role
          </label>
          <div className="flex gap-2 p-1 bg-(--text-secondary)/5 rounded-xl border border-(--hud-border)">
            {["Scout", "Hunter", "Ghost"].map((role) => (
              <button
                key={role}
                onClick={() => setProfile({ ...profile, rank: role })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
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

        {/* --- 4. BIO/STATUS --- */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-(--text-secondary) px-1">
            Mission Objective
          </label>
          <textarea
            rows={2}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Current status or mission..."
            className="w-full bg-(--text-secondary)/5 border border-(--hud-border) rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/30 transition-all text-(--text-primary)"
          />
        </div>
      </div>

      {/* --- 5. ACTION --- */}
      <button
        onClick={handleApply}
        className="w-full py-4 bg-(--accent-primary) text-(--bg-page) rounded-2xl font-black uppercase tracking-widest shadow-[0_0_20px_var(--accent-glow)] hover:brightness-110 active:scale-[0.98] transition-all"
      >
        Commit Changes
      </button>
    </div>
  );
};
