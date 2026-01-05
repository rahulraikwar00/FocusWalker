import L from "leaflet";
import { ReactNode } from "react";

// --- BASE UTILITY TYPES ---
export type ToastType = "info" | "success" | "warning" | "error";

export interface SearchResult {
  name: string;
  latlng: L.LatLng;
}

// --- MISSION & ROUTE TYPES ---
export interface ActiveRoute {
  path: L.LatLng[]; // Use LatLng objects to ensure [Lat, Lng] order for Leaflet
  rawLine: [number, number][]; // Keep raw [Lng, Lat] for Turf.js or processing
  distance: number;
  duration: number;
}

export interface MissionTent {
  id: string;
  latlng: L.LatLng;
  distanceMark: number;
  originalIdx: number;
}

export interface MissionMetrics {
  steps: number;
  timeLeft: number;
  distDone: number;
}

export interface CheckPointData {
  id: string;
  label: string;
  note: string;
  timestamp: string;
  distanceMark: number;
  photo?: string | null;
  coords?: { lat: number; lng: number };
}

export interface RouteData {
  id: string;
  missionName: string;
  originName: string;
  destinationName: string;
  totalDistance: number;
  totalDuration: number;
  timestamp: string;
  logs: CheckPointData[];
  status: "completed" | "aborted" | "active";
  logCount?: number;
}

// --- COMPONENT PROPS ---
export interface MapProps {
  DEFAULT_LOCATION: L.LatLngExpression;
  handleMapClick: (e: L.LeafletMouseEvent) => void;
  currentPos: L.LatLng | null;
  isActive: boolean;
  points: {
    start: L.LatLng | null;
    end: L.LatLng | null;
  };
  route: ActiveRoute | null;
  isLocked: boolean;
  isDark: boolean;
  tentPositionArray: MissionTent[];
  isLoadingRoute: boolean;
  removePoint: (type: "start" | "end", isActive: boolean) => void;
  setIsActive: (value: boolean) => void;
}

export interface HudCardProps {
  isActive: boolean;
  progress: number;
  metrics: MissionMetrics;
  handleStopMission: () => void;
  handleStartMission: () => void;
  reset: () => void;
  setIsActive: (active: boolean) => void;
  route: ActiveRoute | null;
  isLocked: boolean;
  setIsLocked: (active: boolean) => void;
  getLocalityName: (point: L.LatLng | null) => string;
}

export interface TentMarkerProps {
  tent: MissionTent;
  index: number;
  currentPos: L.LatLng | null;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  OpenPopup: (tentId: string, marker: L.Marker) => void;
  ClosePopup: () => void;
}

export interface StatItemProps {
  label: string;
  value: string | number;
  unit: string;
  isPrimary?: boolean;
}

export interface ModalProps {
  children: ReactNode;
  title?: string;
  onClose?: () => void;
}

// --- USER & STATE TYPES ---
export interface UserData {
  id: string;
  name: string;
  rank: string;
  unit: string;
  clearance: string;
  avatar: string;
  bio: string;
}

export interface GlobalState {
  isDossierOpen: boolean;
  isSettingsOpen: boolean;
  isSideSheetOpen: boolean;
  searchQuery: string;
  toast: { show: boolean; msg: string; type: ToastType };
  isLocked: boolean;
  showWelcome: boolean;
  settings: {
    isDark: boolean;
    speedKmh: number;
    isWakeLockEnabled: boolean;
    isHapticsEnabled: boolean;
    breakDuration: number;
  };
  missionStatus: "idle" | "active" | "paused";
  user: UserData;
}

export interface GlobalContextValue extends GlobalState {
  setUI: (updates: Partial<GlobalState>) => void;
  updateSettings: (updates: Partial<GlobalState["settings"]>) => void;
  updateUser: (updates: Partial<UserData>) => void;
  triggerToast: (msg: string, type?: ToastType) => void;
  toggleTheme: () => void;
  completeOnboarding: () => void;
  setMissionStatus: (status: GlobalState["missionStatus"]) => void;
}
