import React, { useState } from "react";
import { Avatar } from "./Avatar";

const DEMO_USER_DATA = {
  callsign: "FOCUS WALKER",
  rank: "Scout",
  bio: "",
};

export const PersonnelDossier = ({ initialData, onSave }: any) => {
  const savedUserData = localStorage.getItem("user_dossier");
  const parsedUserData = savedUserData ? JSON.parse(savedUserData) : null;

  const [profile, setProfile] = useState(
    initialData || {
      callsign: parsedUserData?.callsign || DEMO_USER_DATA.callsign,
      rank: parsedUserData?.rank || DEMO_USER_DATA.rank,
      bio: parsedUserData?.bio || DEMO_USER_DATA.bio,
    }
  );

  const handleApply = () => {
    onSave(profile);
  };

  return (
    <div className="max-w-md mx-auto space-y-8 p-2">
      {/* --- 1. USER IDENTITY --- */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-(--accent-primary)/10 rounded-2xl flex items-center justify-center border border-(--accent-primary)/20">
          <Avatar seed={profile.callsign || "Ghost"} size={64} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-(--text-primary)">
            Your Profile
          </h3>
          <p className="text-xs text-(--text-secondary)">
            How you appear on the map
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* --- 2. NAME INPUT --- */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--text-primary) px-1">
            Display Name
          </label>
          <input
            type="text"
            value={profile.callsign}
            onChange={(e) =>
              setProfile({ ...profile, callsign: e.target.value })
            }
            placeholder="Enter your name"
            className="w-full bg-gray-50 dark:bg-white/5 border border-(--hud-border) rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/30 transition-all"
          />
        </div>

        {/* --- 3. ROLE SELECTION --- */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--text-primary) px-1">
            Your Role
          </label>
          <div className="flex gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-xl border border-(--hud-border)">
            {["Scout", "Hunter", "Ghost"].map((role) => (
              <button
                key={role}
                onClick={() => setProfile({ ...profile, rank: role })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  profile.rank === role
                    ? "bg-(--accent-primary) text-(--bg-page) shadow-md"
                    : "text-(--text-secondary) hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* --- 4. BIO/STATUS --- */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--text-primary) px-1">
            Status Message
          </label>
          <textarea
            rows={2}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="What are you working on?"
            className="w-full bg-gray-50 dark:bg-white/5 border border-(--hud-border) rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/30 transition-all"
          />
        </div>
      </div>

      {/* --- 5. ACTION --- */}
      <button
        onClick={() => {
          handleApply();
        }}
        className="w-full py-4 bg-(--accent-primary) text-(--bg-page) rounded-2xl font-bold shadow-lg hover:brightness-105 active:scale-95 transition-all"
      >
        Save Profile
      </button>
    </div>
  );
};
