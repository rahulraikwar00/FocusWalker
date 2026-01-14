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
  const { position, error, loading, getPosition } = useUserLocation();
  const { setMissionStates } = useMissionContext();
  const { handleDestinationSelect } = useRouteLogic();
  const { updateUser, user } = useGlobal();

  const [profile, setProfile] = useState({
    name: "",
    unit: "Main Stream",
    rank: "Traveler",
    clearance: "Public",
  });

  useEffect(() => {
    if (position) {
      const coords: [number, number] = [position.lat, position.lng];

      // 1. Update Mission Context
      setMissionStates((prev: any) => ({
        ...prev,
        position: {
          ...prev.position,
          start: coords,
        },
      }));
      updateUser({
        location: coords,
      });
      // Optional: A quiet log for debugging, more descriptive than "HUD"
      console.log("Location synchronized.");
    }
  }, [position, setMissionStates, updateUser]);

  const steps = [
    {
      title: "Walk your thoughts",
      desc: "Turn your focus into a physical journey. Every minute of deep work moves you across the world's most beautiful trails.",
      icon: (
        <Wind
          className="text-zinc-600 dark:text-zinc-400"
          size={32}
          strokeWidth={1.5}
        />
      ),
      label: "The Philosophy",
      type: "info",
    },
    {
      title: "How shall we greet you?",
      desc: "Your name will be kept in your private journal as you explore. How should the map recognize your presence?",
      icon: (
        <User
          className="text-zinc-600 dark:text-zinc-400"
          size={32}
          strokeWidth={1.5}
        />
      ),
      label: "Presence",
      type: "input-name",
    },
    {
      title: "Where are you starting?",
      desc: "To synchronize your virtual trek with reality, we’ll gently find where your feet are touching the ground.",
      icon: (
        <MapPin
          className="text-zinc-600 dark:text-zinc-400"
          size={32}
          strokeWidth={1.5}
        />
      ),
      label: "Grounding",
      type: "input-location",
    },
    {
      title: "Choose a destination",
      desc: "Where is your focus taking you today? Select a path that inspires your best work.",
      icon: (
        <Target
          className="text-zinc-600 dark:text-zinc-400"
          size={32}
          strokeWidth={1.5}
        />
      ),
      label: "Destination",
      type: "select-dest",
    },
    {
      title: "The path is clear",
      desc: "Your journey is prepared and the air is still. Whenever you are ready, we can begin the first mile.",
      icon: (
        <ShieldCheck
          className="text-zinc-600 dark:text-zinc-400"
          size={32}
          strokeWidth={1.5}
        />
      ),
      label: "Ready",
      type: "info",
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finalize();
    }
  };

  const finalize = () => {
    const finalProfile = {
      ...profile,
      name: profile.name || "Traveler",
      id: Math.random().toString(36).substr(2, 9),
      startPos: position || { lat: 0, lng: 0 },
    };
    onComplete(finalProfile);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center p-6 pb-12 overflow-hidden transition-colors duration-700">
      {/* 1. Soft Background Ambience */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] border border-zinc-200 dark:border-zinc-800 rounded-full animate-pulse opacity-40" />
      </div>

      {/* 2. Top Label */}
      <div className="relative pt-8 mb-16 flex flex-col items-center gap-1 shrink-0">
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {steps[step].label}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`flex flex-col items-center relative z-10 w-full ${
            steps[step].type === "select-dest"
              ? "max-w-2xl h-full"
              : "max-w-md text-center"
          }`}
        >
          {steps[step].type !== "select-dest" && (
            <>
              <div className="mb-10 p-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                {steps[step].icon}
              </div>

              <h2 className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
                {steps[step].title}
              </h2>

              <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed mb-12 px-4">
                {steps[step].desc}
              </p>
            </>
          )}

          {/* --- STEP CONTENT VIEWS --- */}

          {steps[step].type === "input-location" && (
            <div className="w-full flex flex-col items-center gap-4">
              {position ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 w-full">
                  <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                    Location synced: {position.lat.toFixed(3)},{" "}
                    {position.lng.toFixed(3)}
                  </p>
                </div>
              ) : (
                <button
                  onClick={getPosition}
                  className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-10 py-4 rounded-full text-zinc-900 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="animate-spin text-zinc-400" size={18} />
                  ) : (
                    <MapPin size={18} className="text-zinc-400" />
                  )}
                  {loading ? "Syncing..." : "Share Location"}
                </button>
              )}
            </div>
          )}

          {steps[step].type === "input-name" && (
            <input
              autoFocus
              type="text"
              placeholder="Your name..."
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 p-4 text-center text-zinc-900 dark:text-zinc-100 text-2xl font-light focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
            />
          )}

          {steps[step].type === "select-dest" && (
            <div className="w-full h-full flex flex-col">
              <DestinationSelector
                userLocation={position}
                onSelectDestination={(dest: any) => {
                  handleDestinationSelect(dest);
                  handleNext();
                }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 3. Bottom Controls */}
      <div className="w-full flex flex-col items-center gap-8 mt-auto relative z-10 max-w-xs">
        {/* Progress Dots */}
        <div className="flex gap-3 mb-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === step
                  ? "w-6 bg-zinc-800 dark:bg-zinc-200"
                  : "w-1 bg-zinc-200 dark:bg-zinc-800"
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        {steps[step].type !== "select-dest" && (
          <button
            onClick={handleNext}
            className="w-full py-4 px-8 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
          >
            <span className="font-medium text-sm">
              {step === steps.length - 1 ? "Begin Journey" : "Continue"}
            </span>
            <ChevronRight size={16} />
          </button>
        )}

        {/* Global Skip Button */}
        <button
          onClick={finalize}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Skip to map
        </button>
      </div>
    </div>
  );
};
