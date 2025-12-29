import * as React from "react";
import { useState, Suspense, useEffect } from "react";
import "leaflet/dist/leaflet.css";

import L from "leaflet";

import { HUDCard } from "@/components/HUDcard";
import { useRouteLogic } from "@/hooks/useRouteLogic";
import { HUDtop } from "@/components/HUDtop";
import { LocationSearch } from "@/components/LocationSearch";
import { SettingsOverlay } from "@/components/SettingOverlay";
import { toggleStayAwake, triggerTactilePulse } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { PersonnelDossier } from "@/components/DossierOverlay";
import { SystemSettings } from "@/components/SystemSettings";

const MapView = React.lazy(() =>
  import("@/components/MapContainer").then((module) => ({
    default: module.MapView,
  }))
);

// --- Constants & Defaults ---

const WALKING_SPEED_KMH = 5.0;
const DELHI_DEFAULT = new L.LatLng(28.6139, 77.209);

export default function FocusTacticalMap() {
  const [speedKmh, setSpeedKmh] = useState(WALKING_SPEED_KMH);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(true); // Default to on
  const [isWakeLockEnabled, setIsWakeLockEnabled] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  // State for the Dossier Data
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("user_dossier");
    return saved
      ? JSON.parse(saved)
      : {
          callsign: "RECRUIT",
          rank: "Scout",
          bio: "Focusing on the path ahead.",
        };
  });

  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or system preference on initial load
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  const {
    points,
    route,
    currentPos,
    isActive,
    setIsActive,
    progress,
    metrics,
    handleMapClick,
    searchLocation,
    isLoadingRoute,
    reset,
    setIsLocked,
    isLocked,
    handleLocationSelect,
  } = useRouteLogic(speedKmh, isWakeLockEnabled);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem("has_onboarded");
    if (!hasOnboarded) {
      setShowWelcome(true);
    }
  }, []);

  const handleUpdateUser = (newData: any) => {
    setUserData(newData);
    localStorage.setItem("user_dossier", JSON.stringify(newData));
    if (isHapticsEnabled) triggerTactilePulse("short");
  };

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Tactical haptic feedback if enabled
    if (isHapticsEnabled) triggerTactilePulse("short");
  };

  const handleStartMission = async () => {
    if (isHapticsEnabled) triggerTactilePulse("double");
    try {
      if (isWakeLockEnabled) {
        await toggleStayAwake(true);
      }
      setIsActive(true);
    } catch (err) {
      console.error("Tactical Map: Failed to engage WakeLock", err);
      setIsActive(true);
    }
  };

  const handleStopMission = async () => {
    try {
      await toggleStayAwake(false);
      if (isHapticsEnabled) triggerTactilePulse("short");
    } finally {
      setIsActive(false);
    }
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-page-bg font-sans text-(--text-primary) transition-colors duration-500">
      {/* LAYER 0: THE MAP (Base Layer) */}
      <Suspense
        fallback={
          <div className="bg-(--bg-page) h-full w-full animate-pulse" />
        }
      >
        <MapView
          DELHI_DEFAULT={DELHI_DEFAULT}
          handleMapClick={handleMapClick}
          currentPos={currentPos}
          isActive={isActive}
          points={points}
          route={route}
          isLocked={isLocked}
          /* FIX: Pass the actual state variable, not a hardcoded true */
          isDark={isDark}
        />
      </Suspense>

      {/* LAYER 1: VIGNETTE & SCANLINES */}
      {/* Changed rgba(0,0,0,0.4) to a dynamic variable or lower opacity for dark mode */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ${
          isDark
            ? "bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)] opacity-80"
            : "bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.1)_100%)] opacity-30"
        }`}
      />

      {/* LAYER 2: HUD ELEMENTS */}
      <HUDtop
        userData={userData}
        setIsSettingsOpen={setIsSettingsOpen}
        setIsDossierOpen={setIsDossierOpen}
      />

      {!isActive && (
        <LocationSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          points={points}
          searchLocation={searchLocation}
          onLocationSelect={handleLocationSelect}
        />
      )}

      <HUDCard
        isActive={isActive}
        progress={progress}
        metrics={metrics}
        handleStopMission={handleStopMission}
        handleStartMission={handleStartMission}
        reset={reset}
        route={route}
        setIsActive={setIsActive}
        isLocked={isLocked}
        setIsLocked={setIsLocked}
      />

      <AnimatePresence>
        {(isDossierOpen || isSettingsOpen) && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            {/* 1. The Tactical Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDossierOpen(false);
                setIsSettingsOpen(false);
              }}
              className="absolute inset-0 bg-(--bg-page)/40 backdrop-blur-xl"
            />

            {/* 2. The Content Card */}
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-hud/80 border border-hud rounded-[2.5rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden"
            >
              {/* Decorative Corner Brackets for that HUD feel */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-(--accent-primary) opacity-40" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-(--accent-primary) opacity-40" />

              {isDossierOpen ? (
                <PersonnelDossier
                  userData={userData}
                  onSave={(data: any) => {
                    handleUpdateUser(data);
                    setIsDossierOpen(false);
                  }}
                />
              ) : (
                <SystemSettings
                  speedKmh={speedKmh}
                  isWakeLockEnabled={isWakeLockEnabled}
                  isHapticsEnabled={isHapticsEnabled}
                  isDark={isDark}
                  toggleTheme={toggleTheme}
                  onApply={(newSettings) => {
                    // handle the update logic here
                    setIsSettingsOpen(false);
                  }}
                />
              )}

              <button
                onClick={() => {
                  setIsDossierOpen(false);
                  setIsSettingsOpen(false);
                }}
                className="w-full mt-8 py-2 text-[9px] font-black text-(--text-secondary) uppercase tracking-[0.4em] hover:text-(--accent-primary) transition-colors"
              >
                [ Return to Mission ]
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showWelcome && (
          <WelcomeOverlay onComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
