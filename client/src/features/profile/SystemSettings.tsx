import { Monitor, Zap, Map, Timer, Save } from "lucide-react";
import { useState } from "react";
import { toggleStayAwake, triggerTactilePulse } from "@/lib/utils";
import { useGlobal } from "@/contexts/GlobalContext";

export const SystemSettings = () => {
  const { settings, setUI, triggerToast } = useGlobal();

  const [draft, setDraft] = useState({
    ...settings,
    showGrid: true,
    autoRotate: false,
    restInterval: 45,
    sessionLimit: 120,
    unitSystem: "metric",
  });

  const handleApply = () => {
    setUI({ settings: { ...settings, ...draft }, isSettingsOpen: false });
    toggleStayAwake(draft.isWakeLockEnabled);
    if (draft.isHapticsEnabled) triggerTactilePulse("double");
    triggerToast("System Reconfigured");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex justify-between items-end pb-4 border-b border-(--hud-border)">
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-(--accent-primary)">
            Control Center
          </h2>
          <p className="text-[9px] text-(--text-secondary) opacity-50 uppercase tracking-tighter">
            System Protocol // Alpha-01
          </p>
        </div>
        <button
          onClick={handleApply}
          className="flex items-center gap-2 px-4 py-2 bg-(--accent-primary) text-(--bg-page) text-[10px] font-black uppercase tracking-widest rounded-md hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-(--accent-primary)/20"
        >
          <Save size={12} /> Commit
        </button>
      </div>

      <div className="space-y-5">
        {/* SECTION: POWER & FEEDBACK (Side-by-Side Toggles) */}
        <div className="space-y-2">
          <Label text="Neural & Feedback" icon={<Zap size={10} />} />
          <div className="grid grid-cols-2 gap-2">
            <FlatToggle
              active={draft.isWakeLockEnabled}
              label="Awake"
              onClick={() =>
                setDraft({
                  ...draft,
                  isWakeLockEnabled: !draft.isWakeLockEnabled,
                })
              }
            />
            <FlatToggle
              active={draft.isHapticsEnabled}
              label="Haptic"
              onClick={() =>
                setDraft({
                  ...draft,
                  isHapticsEnabled: !draft.isHapticsEnabled,
                })
              }
            />
          </div>
        </div>

        {/* SECTION: DISPLAY LAYER (Side-by-Side Toggles) */}
        <div className="space-y-2">
          <Label text="Display Layer" icon={<Map size={10} />} />
          <div className="grid grid-cols-2 gap-2">
            <FlatToggle
              active={draft.showGrid}
              label="Grid"
              onClick={() => setDraft({ ...draft, showGrid: !draft.showGrid })}
            />
            <FlatToggle
              active={draft.autoRotate}
              label="Rotate"
              onClick={() =>
                setDraft({ ...draft, autoRotate: !draft.autoRotate })
              }
            />
          </div>
        </div>

        {/* SECTION: VELOCITY (Full Width Slider) */}
        <div className="p-3 rounded-xl bg-hud/10 border border-(--hud-border)/40 space-y-3">
          <Label text="Tactical Velocity" icon={<Monitor size={10} />} />
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-bold opacity-70 italic uppercase">
                Speed Limit
              </span>
              <span className="text-sm font-black tabular-nums text-(--accent-primary)">
                {draft.speedKmh} <small className="text-[8px]">KM/H</small>
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={draft.speedKmh}
              onChange={(e) =>
                setDraft({ ...draft, speedKmh: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-(--text-secondary)/10 accent-(--accent-primary) appearance-none rounded-full cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION: INTERVAL LOGIC (Full Width Sliders) */}
        <div className="p-3 rounded-xl bg-hud/10 border border-(--hud-border)/40 space-y-4">
          <Label text="Interval Logic" icon={<Timer size={10} />} />

          <div className="space-y-3">
            {/* Slider 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] uppercase font-bold px-1">
                <span className="opacity-60">Rest Interval</span>
                <span className="text-(--accent-primary)">
                  {draft.restInterval}M
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                value={draft.restInterval}
                onChange={(e) =>
                  setDraft({ ...draft, restInterval: Number(e.target.value) })
                }
                className="w-full h-1 bg-(--text-secondary)/20 accent-(--accent-primary) appearance-none rounded-full"
              />
            </div>

            {/* Slider 2 */}
            <div className="space-y-1 border-t border-(--hud-border)/20 pt-3">
              <div className="flex justify-between text-[9px] uppercase font-bold px-1">
                <span className="opacity-60">Session Max</span>
                <span className="text-(--accent-primary)">
                  {draft.sessionLimit}M
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="240"
                value={draft.sessionLimit}
                onChange={(e) =>
                  setDraft({ ...draft, sessionLimit: Number(e.target.value) })
                }
                className="w-full h-1 bg-(--text-secondary)/20 accent-(--accent-primary) appearance-none rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const Label = ({ text, icon }: { text: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-2 opacity-40 px-1">
    {icon}
    <span className="text-[9px] font-black uppercase tracking-[0.15em]">
      {text}
    </span>
  </div>
);

const FlatToggle = ({ active, label, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between px-3 py-3 rounded-lg border transition-all text-[10px] font-black uppercase tracking-widest ${
      active
        ? "bg-(--accent-primary)/10 border-(--accent-primary)/40 text-(--accent-primary)"
        : "bg-hud/5 border-(--hud-border) text-(--text-secondary)/40"
    }`}
  >
    <span>{label}</span>
    <div
      className={`w-1.5 h-1.5 rounded-full ${
        active
          ? "bg-(--accent-primary) shadow-[0_0_8px_var(--accent-glow)]"
          : "bg-current opacity-20"
      }`}
    />
  </button>
);
