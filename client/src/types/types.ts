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

export interface CheckPointData {
  id: string;
  label: string; // "Checkpoint Alpha", "Supply Drop", etc.
  note: string;
  timestamp: string; // ISO string is better for sorting: "2026-01-04T12:00:00Z"
  distanceMark: number;
  photo?: string; // Base64
  // NEW: Precise location data
  coords?: {
    lat: number;
    lng: number;
  };
}

export interface RouteData {
  id: string;
  missionName: string; // User-defined or auto-generated: "Evening Patrol"
  originName: string; // Renamed from startName
  targetName: string; // Renamed from endName
  totalDistance: number;
  totalDuration: number;
  timestamp: string; // Mission start date
  logs: CheckPointData[]; // Renamed from tents to logs or waypoints
  // NEW: Mission status
  status: "completed" | "aborted" | "active";
}
