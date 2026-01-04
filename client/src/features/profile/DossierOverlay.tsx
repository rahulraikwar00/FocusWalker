import React, { useState } from "react";
import { Avatar } from "../../components/shared/Avatar";
import { useGlobal, UserData } from "@/features/mission/contexts/GlobalContext";
import { User, Shield, Target, ChevronRight } from "lucide-react";

export const PersonnelDossier = () => {
  const { user, setUI, triggerToast } = useGlobal();
  const randomId = user?.id || `${Math.floor(Math.random() * 9000) + 1000}`;

  const [profile, setProfile] = useState<UserData>(() => ({
    id: randomId,
    name: user?.name || "Focus Walker",
    rank: user?.rank || "Scout",
    unit: user?.unit || "Alpha-6",
    clearance: user?.clearance || "Level 1",
    avatar: user?.avatar || "",
    bio: user?.bio || "",
  }));

  const handleApply = () => {
    const updatedUser: UserData = {
      ...profile,
      clearance: profile.rank === "Ghost" ? "LEVEL 4" : "LEVEL 1",
    };
    setUI({ user: updatedUser, isDossierOpen: false });
    localStorage.setItem("user_dossier", JSON.stringify(updatedUser));
    triggerToast("Profile Updated");
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-sm bg-(--bg-page) text-(--text-primary) font-sans pb-10">
      {/* 1. HEADER */}
      <div className="flex justify-between items-center px-6 pt-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Personnel</h1>
        <button
          onClick={handleApply}
          className="text-(--accent-primary) font-semibold text-lg active:opacity-50 transition-opacity"
        >
          Done
        </button>
      </div>

      {/* 2. PROFILE HERO */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-(--text-secondary)/10 rounded-full flex items-center justify-center overflow-hidden mb-3 shadow-sm border-2 border-(--hud-border)">
          <Avatar seed={profile.name || "Ghost"} size={96} />
        </div>
        <h2 className="text-2xl font-semibold">{profile.name}</h2>
        <p className="text-(--text-secondary) text-sm font-medium uppercase tracking-wider">
          {profile.rank} • {profile.clearance}
        </p>
      </div>

      <div className="px-4 space-y-8">
        {/* SECTION: IDENTITY */}
        <SettingsGroup label="Identity">
          <SettingsInputRow
            label="Name"
            value={profile.name}
            onChange={(val: any) => setProfile({ ...profile, name: val })}
            icon={<User className="w-4 h-4 text-(--bg-page)" />}
            iconBg="bg-(--accent-primary)"
          />

          {/* ASSIGNED ROLE (ROBUST IOS PICKER STYLE) */}
          <div className="px-4 py-3 border-b border-(--hud-border)/50 flex items-center justify-between min-h-13">
            <div className="flex items-center gap-3">
              <div className="bg-(--text-secondary)/20 p-1.5 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-(--text-primary)" />
              </div>
              <span className="text-[17px] font-medium">Assigned Role</span>
            </div>

            <div className="relative flex items-center gap-1">
              <select
                value={profile.rank}
                onChange={(e) =>
                  setProfile({ ...profile, rank: e.target.value })
                }
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              >
                <option value="Scout">Scout</option>
                <option value="Hunter">Hunter</option>
                <option value="Ghost">Ghost</option>
              </select>
              <span className="text-[17px] text-(--accent-primary)">
                {profile.rank}
              </span>
              <ChevronRight size={16} className="text-(--text-secondary)/40" />
            </div>
          </div>
        </SettingsGroup>

        {/* SECTION: MISSION BRIEFING */}
        <SettingsGroup label="Mission Briefing">
          <div className="p-4">
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Enter mission objectives..."
              className="w-full bg-transparent text-[17px] text-(--text-primary) outline-none resize-none placeholder:text-(--text-secondary)/30"
            />
          </div>
        </SettingsGroup>

        <div className="text-center">
          <p className="text-[11px] text-(--text-secondary)/50 font-mono tracking-widest uppercase">
            Protocol ID: {profile.rank}-{randomId}
          </p>
        </div>
      </div>
    </div>
  );
};

/* --- IPHONE STYLE HELPERS --- */
/* --- THEMED IPHONE HELPERS --- */

const SettingsGroup = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <h2 className="px-4 text-[13px] uppercase text-(--text-secondary) font-bold tracking-widest opacity-70">
      {label}
    </h2>
    <div className="bg-(--text-secondary)/5 rounded-2xl overflow-hidden border border-(--hud-border) shadow-sm">
      {children}
    </div>
  </div>
);

const SettingsInputRow = ({ label, value, onChange, icon, iconBg }: any) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-(--hud-border)/50 last:border-0 min-h-13">
    <div className="flex items-center gap-3">
      <div
        className={`${iconBg} p-1.5 rounded-lg flex items-center justify-center shadow-sm`}
      >
        {icon}
      </div>
      <span className="text-[17px] font-medium">{label}</span>
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent text-(--accent-primary) text-[17px] text-right outline-none w-32 focus:brightness-125 transition-all"
    />
  </div>
);
