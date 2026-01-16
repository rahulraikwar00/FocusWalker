import { StorageService } from "@/lib/storageService";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

export interface CheckPointData {
  checkPointId: string;
  missionId: string; // <--- The "Foreign Key" connecting to MissionState.currentMissionId
  label: string;
  note: string;
  timestamp: string;
  distanceMark: number;
  photo?: string | null;
  coords?: L.LatLng | null;
  picture?: string;
}

interface ActiveRoute {
  path: [number, number][]; // [lat, lng] for Leaflet
  rawLine: [number, number][]; // [lng, lat] for Turf calculations
  distance: number;
  duration: number;
}

export interface MissionState {
  missionName: string;
  missionStatus: "finished" | "active" | "paused" | "idle";
  currentMissionId: string;
  position: {
    current?: [number, number] | null;
    start?: [number, number] | null;
    end?: [number, number] | null;
  };
  metrics: {
    steps: number;
    progress: number;
    distDone: number;
    totalDist: number;
    timeLeft: number;
    totalTime: number;
  };
  searchQuery: string;
  route: ActiveRoute | null; // Changed from [] to any[] for flexibility
  checkPoints: [number, number][] | null; // Changed from [] to any
  timeStamp: string;
}

// 1. Define the shape of what the Context actually holds (State + SetState)
interface MissionContextType {
  missionStates: MissionState;
  setMissionStates: Dispatch<SetStateAction<MissionState>>;
}

const initialDefaultState: MissionState = {
  missionName: "DEMO_MISSION_NAME",
  missionStatus: "idle",
  currentMissionId: "NO_ID_GIVEN",
  position: {},
  metrics: {
    steps: 0,
    progress: 0,
    distDone: 0,
    totalDist: 0,
    timeLeft: 0,
    totalTime: 0,
  },
  searchQuery: "",
  route: null,
  checkPoints: null,
  timeStamp: new Date().toISOString(),
};

// 2. Initialize with null, but type it with the Context Interface
const MissionContext = createContext<MissionContextType | null>(null);

export const MissionContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [missionStates, setMissionStates] =
    useState<MissionState>(initialDefaultState);
  const [isInitialized, setIsInitialized] = useState(true);

  // STEP 1: HYDRATION (Run once on mount)
  useEffect(() => {
    const hydrate = async () => {
      const active = await StorageService.getActiveMission(); // The method we discussed
      if (active) {
        setMissionStates(active);
      }
      setIsInitialized(true);
    };
    hydrate();
  }, []);
  console.log("acive mission", missionStates);
  useEffect(() => {
    if (!isInitialized || missionStates.missionStatus === "idle") return;
    StorageService.saveMission(missionStates);
  }, [
    missionStates.missionStatus,
    missionStates.metrics.steps,
    missionStates.position.current,
  ]);
  // 3. Optimized provider value
  return (
    <MissionContext.Provider value={{ missionStates, setMissionStates }}>
      {isInitialized ? children : <>loading...</>}
    </MissionContext.Provider>
  );
};

// 4. Custom hook with a safety check
export const useMissionContext = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error(
      "useMissionContext must be used within a MissionContextProvider"
    );
  }
  return context;
};
