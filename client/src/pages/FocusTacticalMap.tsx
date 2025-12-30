import * as React from "react";
import { useState, Suspense, useEffect } from "react";
import "leaflet/dist/leaflet.css";

import L from "leaflet";

import { HUDCard } from "@/components/HUDcard";
import { useRouteLogic } from "@/hooks/useRouteLogic";
import { HUDtop } from "@/components/HUDtop";
import { LocationSearch } from "@/components/LocationSearch";
import { toggleStayAwake, triggerTactilePulse } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { PersonnelDossier } from "@/components/DossierOverlay";
import { SystemSettings } from "@/components/SystemSettings";
import InstallButton from "@/components/PWAInstallButton";
import ModalContainer from "@/components/ModalContainer";
import { TacticalToast } from "@/components/ToastComponent";

const MapView = React.lazy(() =>
  import("@/components/MapContainer").then((module) => ({
    default: module.MapView,
  }))
);

// --- Constants & Defaults ---

const WALKING_SPEED_KMH = 5.0;
const DEFAULT_LOCATION = new L.LatLng(20.5937, 78.9629);

export default function FocusTacticalMap() {
  const [speedKmh, setSpeedKmh] = useState(WALKING_SPEED_KMH);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(true); // Default to on
  const [isWakeLockEnabled, setIsWakeLockEnabled] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
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

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };
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
      <TacticalToast
        message={toast.msg}
        isVisible={toast.show}
        type={toast.type as any}
      />
      {/* LAYER 0: MAP (Keep at z-0) */}
      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="bg-(--bg-page) h-full w-full animate-pulse" />
          }
        >
          <MapView
            DEFAULT_LOCATION={DEFAULT_LOCATION}
            currentPos={currentPos}
            isActive={isActive}
            points={points}
            route={route}
            isLocked={isLocked}
            isDark={isDark}
            handleMapClick={handleMapClick}
          />
        </Suspense>
      </div>

      {/* LAYER 1: VIGNETTE (Keep at z-10, MUST be pointer-events-none) */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,transparent_20%,black_100%)]"
        style={{ opacity: isDark ? 0.6 : 0.1 }}
      />

      {/* LAYER 2: HUD ELEMENTS (z-20) */}
      {/* We remove the 'h-full w-full' wrapper if possible, or ensure it's passthrough */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Individual components MUST have pointer-events-auto inside them */}
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

        {/* Give InstallButton a high internal Z-index if it's fixed */}
        <InstallButton />

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
      </div>

      {/* LAYER 3: MODALS (z-[100]) */}
      <AnimatePresence mode="wait">
        {(isDossierOpen || isSettingsOpen) && (
          <div className="fixed inset-0 z-100">
            <ModalContainer
              onClose={() => {
                setIsDossierOpen(false);
                setIsSettingsOpen(false);
              }}
            >
              {isDossierOpen ? (
                <PersonnelDossier
                  userData={userData}
                  onSave={() => {
                    handleUpdateUser;
                    setIsDossierOpen(false);
                    triggerToast("Dossier Updated");
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
                    triggerToast("Settings update");
                    setSpeedKmh(newSettings.speed);
                    setIsWakeLockEnabled(newSettings.wakeLock);
                    setIsHapticsEnabled(newSettings.haptics);
                    setIsSettingsOpen(false);
                    console.log("SYSTEM CONFIG UPDATED");
                  }}
                />
              )}
            </ModalContainer>
          </div>
        )}
        {/* 2. Welcome Overlay (Priority Onboarding) */}
        {showWelcome && (
          <WelcomeOverlay
            key="welcome"
            onComplete={() => {
              setShowWelcome(false);
              localStorage.setItem("has_onboarded", "true"); // Commit to storage here
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
