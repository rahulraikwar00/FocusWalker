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
import {
  MissionContextProvider,
  useMissionContext,
} from "@/features/mission/contexts/MissionContext";

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

export default function FocusTacticalMap() {
  const { isDossierOpen, isSettingsOpen, showWelcome, completeOnboarding } =
    useGlobal();
  const { missionStates } = useMissionContext();

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-page-bg font-sans text-(--text-primary) transition-colors duration-500">
      {/* LAYER 0: MAP (Bottom) */}

      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="bg-(--bg-page) h-full w-full animate-pulse" />
          }
        >
          <MapView />
        </Suspense>
      </div>

      {/* LAYER 1: HUD ELEMENTS (Middle) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {!missionStates.route && <LocationSearch />}
        <SettingsSideBar />
        <UserHeader />
        {/* New Sidebar Component */}

        <InstallButton />
        <ControlCard />
      </div>

      {/* LAYER 2: OVERLAYS & MODALS (Top) */}
      <AnimatePresence mode="wait">
        {showWelcome && <WelcomeOverlay onComplete={completeOnboarding} />}
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
