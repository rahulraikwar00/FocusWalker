import { ReactNode } from "react";
import L from "leaflet";

/** --- CORE DATA MODELS --- **/

export interface SearchResult {
  name: string;
  latlng: L.LatLng;
}

export interface CheckPointData {
  id: string;
  label: string;
  note: string;
  timestamp: string;
  distanceMark: number;
  photo?: string | null;
  coords?: L.LatLng | null;
  picture?: string;
}

export interface RouteData {
  id: string;
  missionName?: string;
  originName?: string;
  destinationName?: string;
  totalDistance: number;
  totalDuration: number;
  timestamp?: string;
  logs?: CheckPointData[];
  status?: "completed" | "aborted" | "active";
  logCount?: number;
}

// Unified Route structure used by logic and components
export interface ActiveRoute {
  path: [number, number][]; // For Leaflet Rendering [lat, lng]
  rawLine: [number, number][]; // For Turf Logic [lng, lat]
  distance: number;
  duration: number;
}

/** --- COMPONENT PROPS --- **/

export interface StatItemProps {
  label: string;
  value: string | number;
  unit: string;
  isPrimary?: boolean;
}

export interface HudCardProps {
  isActive: boolean;
  progress: number;
  isLocked: boolean;
  route: ActiveRoute | null;
  metrics: {
    timeLeft: number;
    distDone: number;
    steps: number;
  };
  handleStopMission: () => void;
  handleStartMission: () => void;
  reset: () => void;
  setIsActive: (active: boolean) => void;
  setIsLocked: (locked: boolean) => void;
}

export interface HUDtopProps {
  userData: {
    callsign: string;
    rank: string;
  };
  setIsDossierOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

export interface MapProps {
  DEFAULT_LOCATION: L.LatLngExpression;
  currentPos: L.LatLng | null;
  isActive: boolean;
  isLocked: boolean;
  isDark: boolean;
  isLoadingRoute: boolean;
  points: { start: L.LatLng | null; end: L.LatLng | null };
  route: ActiveRoute | null;
  tentPositionArray: L.LatLng[] | null;
  handleMapClick: (e: L.LeafletMouseEvent) => void;
  removePoint: (type: "start" | "end", isActive: boolean) => void;
  setIsActive: (active: boolean) => void;
}

export interface LocationSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  points: { start: L.LatLng | null; end: L.LatLng | null };
  searchLocation: (query: string) => Promise<SearchResult[]>;
  onLocationSelect: (location: SearchResult) => void;
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

export interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
}
