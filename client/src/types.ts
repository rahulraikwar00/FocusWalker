import { ReactNode } from "react";

export interface StatItemProps {
  label: string;
  value: string;
  unit: string;
}

export interface HudCardProps {
  isActive: boolean;
  progress: number;
  metrics: {
    timeLeft: number;
    distDone: number;
    steps: number;
  };
  handleStopMission: () => void;
  handleStartMission: () => void;
  reset: () => void;
  setIsActive: (active: boolean) => void;
  route: { path: L.LatLngExpression[] } | null;
  isLocked: boolean;
  setIsLocked: (active: boolean) => void;
}

// 1. Individual Item Interface
export interface StatItemProps {
  label: string;
  value: string;
  unit: string;
  isPrimary?: boolean;
}

export interface HUDtopProps {
  userData: {
    callsign: string;
    rank: string;
  };
  setIsDossierOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

export interface SearchResult {
  name: string;
  latlng: L.LatLng;
}

export interface LocationSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  points: { start: L.LatLng | null; end: L.LatLng | null };
  // Modified to return a list of results
  searchLocation: (query: string) => Promise<SearchResult[]>;
  onLocationSelect: (location: SearchResult) => void;
}

export interface MapProps {
  DEFAULT_LOCATION: L.LatLngExpression;
  handleMapClick: (e: L.LeafletMouseEvent) => void;
  currentPos: L.LatLng | null;
  isActive: boolean;
  points: { start: L.LatLng | null; end: L.LatLng | null };
  route: { path: L.LatLngExpression[] } | null;
  isLocked: boolean;
  isDark: boolean;
}

export interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
}

export interface SystemSettingsProps {
  speedKmh: number;
  isWakeLockEnabled: boolean;
  isHapticsEnabled: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  onApply: (settings: {
    speed: number;
    wakeLock: boolean;
    haptics: boolean;
  }) => void;
}
