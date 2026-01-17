import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind,
  User,
  Target,
  ShieldCheck,
  MapPin,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useUserLocation } from "../navigation/useUserLocation";
import { useMissionContext } from "../mission/contexts/MissionContext";
import { DestinationSelector } from "@/components/shared/DestinationSelector";
import { useRouteLogic } from "../mission/useRouteLogic";
import { useGlobal } from "../mission/contexts/GlobalContext";

export const WelcomeOverlay = ({ onComplete }: any) => {
  const [step, setStep] = useState(0);
  const { position, loading, getPosition } = useUserLocation();
  const { setMissionStates } = useMissionContext();
  const { handleDestinationSelect } = useRouteLogic();
  const { updateUser, user } = useGlobal();

  const [profile, setProfile] = useState({
    name: "",
    unit: "Main Stream",
    rank: "Traveler",
    clearance: "Public",
  });

  const handleSetProfile = (currentProfile: any) => {
    if (currentProfile.name.trim().length >= 2) {
      updateUser({
        ...user,
        name: currentProfile.name,
      });
    }
  };

  useEffect(() => {
    if (position) {
      const coords: [number, number] = [position.lat, position.lng];
      setMissionStates((prev: any) => ({
        ...prev,
        position: { ...prev.position, start: coords },
      }));
      updateUser({ location: coords });
    }
  }, [position, setMissionStates, updateUser]);

  const steps = [
    {
      title: "Walk your thoughts",
      desc: "Turn your focus into a physical journey. Every minute of deep work moves you across the world's most beautiful trails.",
      icon: <Wind size={32} strokeWidth={1.5} />,
      label: "The Philosophy",
      type: "info",
    },
    {
      title: "How shall we greet you?",
      desc: "How should the map recognize your presence?",
      icon: <User size={32} strokeWidth={1.5} />,
      label: "Presence",
      type: "input-name",
    },
    {
      title: "Where are you starting?",
      desc: "To synchronize your virtual trek, we’ll find where your feet are touching the ground.",
      icon: <MapPin size={32} strokeWidth={1.5} />,
      label: "Grounding",
      type: "input-location",
    },
    {
      title: "Choose a destination",
      desc: "Where is your focus taking you today?",
      icon: <Target size={32} strokeWidth={1.5} />,
      label: "Destination",
      type: "select-dest",
    },
    {
      title: "The path is clear",
      desc: "Your journey is prepared. Whenever you are ready, we can begin.",
      icon: <ShieldCheck size={32} strokeWidth={1.5} />,
      label: "Ready",
      type: "info",
    },
  ];

  // Logic to disable button if input is missing
  const isNextDisabled = () => {
    const currentType = steps[step].type;
    if (currentType === "input-name") return profile.name.trim().length < 2;
    if (currentType === "input-location") return !position;
    return false;
  };

  const handleNext = () => {
    if (steps[step].type === "input-name") {
      handleSetProfile(profile);
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finalize();
    }
  };

  const finalize = () => {
    handleSetProfile(profile);
    onComplete({
      ...profile,
      name: profile.name || "Traveler",
      id: Math.random().toString(36).substr(2, 9),
      startPos: position || { lat: 0, lng: 0 },
    });
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-9999 bg-[var(--bg-page)] flex flex-col items-center p-6 pb-12 overflow-hidden transition-colors duration-700">
      {/* Tactical Ambience */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] border border-[var(--hud-border)] rounded-full animate-pulse opacity-20" />
      </div>

      {/* Top HUD Label */}
      <div className="relative pt-8 mb-16 flex flex-col items-center gap-1 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
          {steps[step].label}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          className={`flex flex-col items-center relative z-10 w-full ${
            steps[step].type === "select-dest"
              ? "max-w-2xl h-full"
              : "max-w-md text-center"
          }`}
        >
          {steps[step].type !== "select-dest" && (
            <>
              <div className="mb-10 p-8 rounded-full bg-[var(--hud-bg)] border border-[var(--hud-border)] text-[var(--accent-primary)] shadow-lg shadow-[var(--accent-glow)]">
                {steps[step].icon}
              </div>
              <h2 className="text-3xl font-medium tracking-tight text-[var(--text-primary)] mb-6">
                {steps[step].title}
              </h2>
              <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-12 px-4">
                {steps[step].desc}
              </p>
            </>
          )}

          {/* INPUT FIELDS */}
          {steps[step].type === "input-name" && (
            <input
              autoFocus
              type="text"
              placeholder="Operator Name..."
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-transparent border-b border-[var(--hud-border)] p-4 text-center text-[var(--text-primary)] text-2xl font-light focus:border-[var(--accent-primary)] focus:outline-none transition-colors placeholder:opacity-30"
            />
          )}

          {steps[step].type === "input-location" && (
            <button
              onClick={getPosition}
              disabled={!!position}
              className={`flex items-center gap-3 px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                position
                  ? "bg-(--accent-glow) text-(--accent-primary) border border-[var(--accent-primary)]"
                  : "bg-[var(--hud-bg)] border border-(--hud-border) text-(--text-primary) hover:border-[var(--accent-primary)]"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <MapPin size={18} />
              )}
              {position ? "Uplink Established" : "Establish Sync"}
            </button>
          )}

          {steps[step].type === "select-dest" && (
            <div className="w-full h-full flex flex-col relative">
              <DestinationSelector
                userLocation={position}
                onSelectDestination={(dest: any) => {
                  handleDestinationSelect(dest);
                  handleNext();
                }}
              />
              <button
                onClick={handleNext}
                className="absolute -top-12 right-0 text-[10px] font-mono uppercase tracking-[0.2em] text-(--text-secondary) hover:text-(--accent-primary) transition-colors"
              >
                Skip [→]
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* FOOTER CONTROLS */}
      <div className="w-full flex flex-col items-center gap-8 mt-auto relative z-10 max-w-xs">
        <div className="flex gap-3 mb-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === step
                  ? "w-8 bg-(--accent-primary)"
                  : "w-1 bg-(--hud-border)"
              }`}
            />
          ))}
        </div>

        {/* Action Button: Disables based on logic, Hidden for Destination */}
        {steps[step].type !== "select-dest" && (
          <button
            onClick={handleNext}
            disabled={isNextDisabled()}
            className="w-full py-4 px-8 bg-(--accent-primary) text-black rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-tighter shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20 disabled:grayscale disabled:scale-100"
          >
            <span className="text-sm">
              {step === steps.length - 1 ? "Initiate Voyage" : "Proceed"}
            </span>
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
};
