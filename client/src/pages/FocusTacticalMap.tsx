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
import { useAppSettings } from "@/hooks/useAppSettings";
import { useUserDossier } from "@/hooks/useUserDossier";
import { useUIState } from "@/hooks/useUIState";
import { useMissionControl } from "@/hooks/useMissionControl";

const MapView = React.lazy(() =>
  import("@/components/MapContainer").then((module) => ({
    default: module.MapView,
  }))
);

const DEFAULT_LOCATION = new L.LatLng(20.5937, 78.9629);

export default function FocusTacticalMap() {
  const { settings, setSettings, toggleTheme, toggleHaptics } =
    useAppSettings();

  const {
    isDossierOpen,
    searchQuery,
    isSettingsOpen,
    setIsDossierOpen,
    setSearchQuery,
    setIsSettingsOpen,
    showWelcome,
    completeOnboarding,
    toast,
    triggerToast,
  } = useUIState();
  const { userData, updateUser } = useUserDossier();

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
    tentPositionArray,
  } = useRouteLogic(settings.speedKmh, settings.isWakeLockEnabled);
  const { handleStartMission, handleStopMission } = useMissionControl(
    settings,
    setIsActive
  );

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
            isDark={settings.isDark}
            handleMapClick={handleMapClick}
            tentPositionArray={tentPositionArray}
          />
        </Suspense>
      </div>

      {/* LAYER 1: VIGNETTE (Keep at z-10, MUST be pointer-events-none) */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,transparent_20%,black_100%)]"
        style={{ opacity: settings.isDark ? 0.6 : 0.1 }}
      />

      {/* LAYER 2: HUD ELEMENTS (z-20) */}

      <div className="absolute inset-0 z-20 pointer-events-none">
        <HUDtop
          userData={userData}
          setIsSettingsOpen={setIsSettingsOpen}
          setIsDossierOpen={setIsDossierOpen}
        />

        {!route && (
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
          mapState={{
            isActive,
            progress,
            metrics,
            route,
            isLocked,
          }}
          mapActions={{
            handleStopMission,
            handleStartMission,
            reset,
            setIsActive,
            setIsLocked,
          }}
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
                  onSave={(newData: any) => {
                    updateUser(newData);
                    setIsDossierOpen(false);
                    triggerToast("Dossier Updated");
                  }}
                />
              ) : (
                <SystemSettings
                  speedKmh={settings.speedKmh}
                  isWakeLockEnabled={settings.isWakeLockEnabled}
                  isHapticsEnabled={settings.isHapticsEnabled}
                  isDark={settings.isDark}
                  toggleTheme={toggleTheme}
                  onApply={(newSettings) => {
                    setSettings(newSettings);
                    toggleStayAwake(newSettings.isWakeLockEnabled);
                    if (newSettings.isHapticsEnabled) {
                      triggerTactilePulse("double");
                    }
                    setIsSettingsOpen(false);
                    triggerToast("System: Configuration Applied 🟢");
                  }}
                />
              )}
            </ModalContainer>
          </div>
        )}
        {/* 2. Welcome Overlay (Priority Onboarding) */}
        {showWelcome && <WelcomeOverlay onComplete={completeOnboarding} />}
      </AnimatePresence>
    </div>
  );
}
