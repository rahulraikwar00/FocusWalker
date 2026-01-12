import * as React from "react";
import { Suspense, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AnimatePresence } from "framer-motion";

// Components
import { ControlCard } from "@/features/mission/ControlCard";
import { UserHeader } from "@/features/profile/UserHeader";
import { LocationSearch } from "@/features/navigation/LocationSearch";
import { WelcomeOverlay } from "@/features/profile/WelcomeOverlay";
import { PersonnelDossier } from "@/features/profile/DossierOverlay";
import { SystemSettings } from "@/features/profile/SystemSettings";
import InstallButton from "@/components/shared/PWAInstallButton";

// Hooks
import { useGlobal } from "@/features/mission/contexts/GlobalContext";
import { useRouteLogic } from "@/features/mission/useRouteLogic";
import { SettingsSideBar } from "@/features/profile/SideBarSettings";
import { ModalContainer } from "@/components/shared/ModalContainer";

const MapView = React.lazy(() =>
  import("@/components/shared/MapContainer").then((module) => ({
    default: module.MapView,
  }))
);

// Define the interface clearly
export interface MissionTent {
  id: string;
  latlng: L.LatLng;
  originalIdx: number;
}
const DEFAULT_LOCATION = new L.LatLng(20.5937, 78.9629);

export default function FocusTacticalMap() {
  // 1. Single Source of Truth from Global Context
  const {
    settings,
    isDossierOpen,
    isSettingsOpen,
    showWelcome,
    completeOnboarding,
    isLocked,
    setUI,
  } = useGlobal();

  // 2. Specialized Logic Hooks
  // We keep these because they handle complex math, GPS, and routing logic
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
    reset,
    handleLocationSelect,
    tentPositionArray,
    handleStartMission,
    handleStopMission,
    setPoints,
    isLoadingRoute,
    removePoint,
    getLocalityName,
    updateMissionStatus,
  } = useRouteLogic(settings.speedKmh, settings.isWakeLockEnabled);

  const formattedTents = useMemo((): MissionTent[] => {
    // Add explicit return type
    if (!tentPositionArray) return [];

    return (tentPositionArray as any[]).map((t, i) => {
      // Determine the lat/lng regardless of input format
      const lat = t.lat ?? t[0] ?? (t.latlng ? t.latlng.lat : 0);
      const lng = t.lng ?? t[1] ?? (t.latlng ? t.latlng.lng : 0);

      return {
        id: `tent-${i}`,
        latlng: L.latLng(lat, lng), // This creates the Leaflet LatLng object
        originalIdx: i,
      };
    });
  }, [tentPositionArray]);
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-page-bg font-sans text-(--text-primary) transition-colors duration-500">
      {/* LAYER 0: MAP (Bottom) */}
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
            tentPositionArray={formattedTents}
            isLoadingRoute={isLoadingRoute}
            removePoint={removePoint}
            setIsActive={setIsActive}
          />
        </Suspense>
      </div>

      {/* LAYER 1: HUD ELEMENTS (Middle) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <UserHeader />
        <SettingsSideBar /> {/* New Sidebar Component */}
        {!route && (
          <LocationSearch
            points={points}
            searchLocation={searchLocation}
            onLocationSelect={handleLocationSelect}
          />
        )}
        <InstallButton />
        <ControlCard
          points={points}
          mapState={{ isActive, progress, metrics, route }}
          mapActions={{
            handleStopMission,
            handleStartMission,
            reset,
            getLocalityName,
            updateMissionStatus,
          }}
        />
      </div>

      {/* LAYER 2: OVERLAYS & MODALS (Top) */}
      <AnimatePresence mode="wait">
        {/* Onboarding Overlay */}
        {showWelcome && <WelcomeOverlay onComplete={completeOnboarding} />}

        {/* Global Modals */}
        {(isDossierOpen || isSettingsOpen) && (
          <ModalContainer
            title={isDossierOpen ? "Personnel Dossier" : "System Settings"}
          >
            {isDossierOpen ? <PersonnelDossier /> : <SystemSettings />}
          </ModalContainer>
        )}
      </AnimatePresence>
    </div>
  );
}
