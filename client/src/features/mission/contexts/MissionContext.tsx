import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

interface ActiveRoute {
  path: [number, number][]; // [lat, lng] for Leaflet
  rawLine: [number, number][]; // [lng, lat] for Turf calculations
  distance: number;
  duration: number;
}

export interface MissionState {
  missionStatus: "finished" | "active" | "paused" | "idle";
  currentMissionId: string | null;
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
  checkPoints: [number, number][] | null; // Changed from [] to any[] for
}

// 1. Define the shape of what the Context actually holds (State + SetState)
interface MissionContextType {
  missionStates: MissionState;
  setMissionStates: Dispatch<SetStateAction<MissionState>>;
}

const initialDefaultState: MissionState = {
  missionStatus: "idle",
  currentMissionId: null,
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

  useEffect(() => {
    console.log("setting the item");
    localStorage.setItem("missionData", JSON.stringify(missionStates));
  }, [missionStates.missionStatus]);

  // 3. Optimized provider value
  return (
    <MissionContext.Provider value={{ missionStates, setMissionStates }}>
      {children}
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
