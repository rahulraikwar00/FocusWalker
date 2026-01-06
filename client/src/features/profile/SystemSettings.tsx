import { Monitor, Zap, Timer, Bell } from "lucide-react";
import { useState } from "react";
import { toggleStayAwake, triggerTactilePulse } from "@/lib/utils";
import { useGlobal } from "@/features/mission/contexts/GlobalContext";

export const SystemSettings = () => {
  const { settings, setUI, triggerToast } = useGlobal();

  const [draft, setDraft] = useState({
    ...settings,
    isDark: settings.isDark ?? true,
    speedKmh: settings.speedKmh ?? 5,
    isWakeLockEnabled: settings.isWakeLockEnabled ?? true,
    isHapticsEnabled: settings.isHapticsEnabled ?? true,
    breakDuration: settings.breakDuration ?? 25, // Change B to b
  });

  const commitChanges = () => {
    setUI({ settings: { ...settings, ...draft }, isSettingsOpen: false });
    toggleStayAwake(draft.isWakeLockEnabled);
    if (draft.isHapticsEnabled) triggerTactilePulse("double");
    triggerToast("Protocol Updated");
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-sm bg-(--bg-page) text-(--text-primary) font-sans pb-10">
      {/* 1. HEADER */}
      <div className="flex justify-between items-center px-6 pt-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <button
          onClick={commitChanges}
          className="text-(--accent-primary) font-semibold text-lg active:opacity-50 transition-opacity"
        >
          Done
        </button>
      </div>

      <div className="px-4 space-y-8">
        {/* SECTION: SYSTEM PROTOCOLS */}
        <SettingsGroup label="System Protocols">
          <SettingsRow
            label="Stay Awake"
            icon={<Zap className="w-4 h-4 text-(--bg-page)" />}
            iconBg="bg-(--accent-primary)"
            right={
              <ToggleSwitch
                active={draft.isWakeLockEnabled}
                onClick={() =>
                  setDraft({
                    ...draft,
                    isWakeLockEnabled: !draft.isWakeLockEnabled,
                  })
                }
              />
            }
          />
          <SettingsRow
            label="Haptic Feedback"
            icon={<Bell className="w-4 h-4 text-(--text-primary)" />}
            iconBg="bg-(--text-secondary)/20"
            right={
              <ToggleSwitch
                active={draft.isHapticsEnabled}
                onClick={() =>
                  setDraft({
                    ...draft,
                    isHapticsEnabled: !draft.isHapticsEnabled,
                  })
                }
              />
            }
          />
        </SettingsGroup>

        {/* SECTION: MISSION PARAMETERS */}
        <SettingsGroup label="Mission Parameters">
          <SettingsRow
            label="Target Speed"
            icon={<Monitor className="w-4 h-4 text-(--text-primary)" />}
            iconBg="bg-(--text-secondary)/10"
            subLabel={`${draft.speedKmh} km/h`}
          />
          <div className="px-4 pb-5">
            <input
              type="range"
              min="2"
              max="20"
              step="0.5"
              value={draft.speedKmh}
              onChange={(e) =>
                setDraft({ ...draft, speedKmh: Number(e.target.value) })
              }
              className="w-full h-1 bg-(--hud-border) rounded-full appearance-none accent-(--accent-primary) cursor-pointer"
            />
          </div>

          <SettingsRow
            label="Break Interval"
            icon={<Timer className="w-4 h-4 text-(--text-primary)" />}
            iconBg="bg-(--text-secondary)/10"
            subLabel={`${draft.breakDuration}m`}
          />
          <div className="px-4 pb-5">
            <input
              type="range"
              min="5"
              max="90"
              step={5}
              value={draft.breakDuration}
              onChange={(e) =>
                setDraft({ ...draft, breakDuration: Number(e.target.value) })
              }
              className="w-full h-1 bg-(--hud-border) rounded-full appearance-none accent-(--accent-primary) cursor-pointer"
            />
          </div>
        </SettingsGroup>

        <div className="text-center opacity-40">
          <p className="text-[11px] font-mono uppercase tracking-widest text-(--text-secondary)">
            Focus Walker v2.0.4 • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

/* --- THEMED IPHONE SUB-COMPONENTS --- */

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

const SettingsRow = ({ label, subLabel, icon, iconBg, right }: any) => (
  <div className="flex items-center justify-between px-4 py-3 min-h-[52px] border-b border-(--hud-border)/50 last:border-0">
    <div className="flex items-center gap-3">
      <div
        className={`${iconBg} p-1.5 rounded-lg flex items-center justify-center shadow-sm transition-colors`}
      >
        {icon}
      </div>
      <span className="text-[17px] font-medium tracking-tight text-(--text-primary)">
        {label}
      </span>
    </div>
    <div className="flex items-center gap-2">
      {subLabel && (
        <span className="text-[17px] text-(--text-secondary) font-medium italic">
          {subLabel}
        </span>
      )}
      {right}
    </div>
  </div>
);

const ToggleSwitch = ({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-[51px] h-[31px] rounded-full p-0.5 transition-all duration-300 flex items-center ${
      active ? "bg-(--accent-primary)" : "bg-(--text-secondary)/20"
    }`}
  >
    <div
      className={`w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
        active ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);
