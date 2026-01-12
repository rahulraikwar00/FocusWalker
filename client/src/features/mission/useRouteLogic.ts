import confetti from "canvas-confetti";
import L from "leaflet";
import { useState, useRef, useEffect, useCallback } from "react";
import { lineString } from "@turf/helpers";
import along from "@turf/along";
import {
  getMissionId,
  StorageService,
  toggleStayAwake,
  triggerTactilePulse,
} from "@/lib/utils";
import { useGlobal } from "./contexts/GlobalContext";
import { useMap } from "react-leaflet";
import { useMissionContext, MissionState } from "./contexts/MissionContext";
import { start } from "repl";
const METERS_PER_STEP = 0.72; // Average step length in meters
// const BREAK_DURATION = 25; //in min

// Define what an OSRM Route actually looks like
export interface OSRMRoute {
  distance: number;
  duration: number;
  geometry: string | any; // Usually a polyline string or GeoJSON
  legs: any[];
  weight: number;
  coordinates?: L.LatLng[]; // We add this after parsing the geometry
  name?: string;
}

export interface MissionMetrics {
  steps: number;
  timeLeft: number;
  distDone: number;
  totalDist?: number;
  totalTime?: number;
}

export interface ActiveRoute {
  path: [number, number][]; // [lat, lng] for Leaflet
  rawLine: [number, number][]; // [lng, lat] for Turf calculations
  distance: number;
  duration: number;
}

export function useRouteLogic() {
  const { missionStates, setMissionStates } = useMissionContext();
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isLocked, setIsLocked] = useState(true); // Default to locked
  const wakeLockResource = useRef<WakeLockSentinel | null>(null);
  const { breakDuration, isWakeLockEnabled, speedKmh } = useGlobal().settings;
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef(0);

  const isActive = missionStates.missionStatus === "active";
  const missionid = missionStates.currentMissionId;

  // Speed converted to meters per second
  const speedMs = (speedKmh * 1000) / 3600;

  useEffect(() => {
    const requestLock = async () => {
      // ADDED: Check if user actually wants it enabled in settings
      if ("wakeLock" in navigator && isActive && isWakeLockEnabled) {
        try {
          wakeLockResource.current = await navigator.wakeLock.request("screen");
          console.log("HUD: Wake Lock Active 🟢");
        } catch (err) {
          console.error(err);
        }
      }
    };

    const releaseLock = async () => {
      if (wakeLockResource.current) {
        await wakeLockResource.current.release();
        wakeLockResource.current = null;
      }
    };

    if (isActive && isWakeLockEnabled) {
      requestLock();
    } else {
      releaseLock();
    }

    const handleVisibilityChange = () => {
      if (
        isActive &&
        isWakeLockEnabled &&
        document.visibilityState === "visible"
      ) {
        requestLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      releaseLock();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive, isWakeLockEnabled]);

  const fetchRoute = useCallback(
    async (start: L.LatLng, end: L.LatLng) => {
      if (!start || !end) return;
      setIsLoadingRoute(true);

      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
        );
        const data = await res.json();

        if (data.code === "Ok" && data.routes?.length > 0) {
          const r = data.routes[0];

          // 1. Process the route data using your helper
          const newRoute: ActiveRoute = {
            path: r.geometry.coordinates.map(
              (c: any) => [c[1], c[0]] as [number, number]
            ),
            rawLine: r.geometry.coordinates,
            distance: r.distance,
            duration: r.distance / speedMs,
          };

          // 2. Calculate tactical "Tent" checkpoints
          const line = lineString(r.geometry.coordinates);
          const tents = calculateTents(line, r.distance).map(
            (t) => [t.latlng.lat, t.latlng.lng] as [number, number] // Cast to Tuple
          );
          const newId = getMissionId({ start, end });

          setMissionStates((prev) => ({
            ...prev,
            currentMissionId: newId,
            route: newRoute,
            checkPoints: tents,
            metrics: {
              ...prev.metrics,
              steps: 0,
              timeLeft: Math.ceil(r.distance / speedMs),
              distDone: 0,
              totalDist: r.distance,
              totalTime: r.distance / speedMs,
            },
          }));
          // 4. PRE-GENERATE MISSION ID (Optional but recommended)
          // You can store this in a ref or state so it's ready when they click "START"
          const startFingerprint = `${start.lat.toFixed(4)},${start.lng.toFixed(
            4
          )}`;
          const endFingerprint = `${end.lat.toFixed(4)},${end.lng.toFixed(4)}`;
          console.log(
            `Tactical ID Ready: OP_${startFingerprint}_${endFingerprint}`
          );
        }
      } catch (err) {
        console.error("OSRM Route Error:", err);
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [missionStates.position.start, missionStates.position.end]
  );

  const calculateTents = useCallback(
    (line: any, totalDistance: number) => {
      const segmentMinutes = breakDuration;
      const segmentDistanceMeters = speedMs * 60 * segmentMinutes;
      const tents = [];

      let accumulatedDistance = segmentDistanceMeters;

      // While we haven't reached the end of the total distance
      while (accumulatedDistance < totalDistance) {
        const pt = along(line, accumulatedDistance / 1000, {
          units: "kilometers",
        });
        const [lng, lat] = pt.geometry.coordinates;

        tents.push({
          id: `tent-${accumulatedDistance}`,
          latlng: new L.LatLng(lat, lng),
          distanceMark: accumulatedDistance,
        });

        accumulatedDistance += segmentDistanceMeters;
      }
      return tents;
    },
    [speedMs]
  );

  //locacality name using lat lng
  const getLocalityName = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
        {
          headers: {
            "User-Agent": "FocusWalker-Tactical-App", //
          },
        }
      );

      const data = await response.json();

      const addr = data.address;
      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.city_district ||
        addr.town ||
        addr.village ||
        addr.city;

      return locality || "Unknown Sector";
    } catch (error) {
      console.error("Geocoding failed:", error);
      return "Unknown Sector";
    }
  };

  // Inside useRouteLogic.ts

  const removePoint = (type: "start" | "end", isActive: boolean) => {
    if (isActive) return;

    // Use a functional update (prev => ...) to ensure you have the latest state
    setMissionStates((prev) => {
      // Shared reset values to avoid repetition
      const resetBase = {
        ...prev,
        missionStatus: "idle" as const,
        currentMissionId: "",
        metrics: {
          steps: 0,
          progress: 0,
          distDone: 0,
          totalDist: 0,
          timeLeft: 0,
          totalTime: 0,
        },
        route: null,
        checkPoints: null,
      };

      if (type === "start") {
        return {
          ...resetBase,
          position: {}, // Resets all: current, start, and end
        };
      } else {
        return {
          ...resetBase,
          position: {
            ...prev.position,
            current: undefined, // Use undefined for optional fields
            end: undefined,
          },
        };
      }
    });

    triggerTactilePulse("short");
  };

  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (isActive) return;

      // Convert Leaflet object to your State's tuple format [number, number]
      const clickedCoord: [number, number] = [e.latlng.lat, e.latlng.lng];

      setMissionStates((prev) => {
        // 1. If no start point exists
        if (!prev.position.start) {
          return {
            ...prev,
            position: { ...prev.position, start: clickedCoord },
          };
        }

        // 2. If start exists but no end point exists
        if (!prev.position.end) {
          const startLatLng = L.latLng(prev.position.start);
          const endLatLng = L.latLng(clickedCoord);
          fetchRoute(startLatLng, endLatLng);

          return {
            ...prev,
            position: { ...prev.position, end: clickedCoord },
          };
        }

        return prev;
      });
    },
    [isActive, fetchRoute, setMissionStates] // Added setMissionStates to dependencies
  );

  const searchLocation = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      if (!query || isActive) return [];
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5`
        );
        const data = await res.json();
        return data.map((item: any) => ({
          name: item.display_name,
          latlng: new L.LatLng(parseFloat(item.lat), parseFloat(item.lon)),
        }));
      } catch (e) {
        return [];
      }
    },
    [isActive]
  );

  interface SearchResult {
    name: string;
    latlng: L.LatLng;
  }
  // 3. Memoize handleLocationSelect
  const handleLocationSelect = useCallback(
    (result: SearchResult) => {
      // 1. Ensure the format is [lat, lng] to match MissionState
      const newLoc: [number, number] = [result.latlng.lat, result.latlng.lng];

      setMissionStates((prev) => {
        // 2. Logic: If no start, set start. Otherwise, set end and fetch.
        if (!prev.position.start) {
          return {
            ...prev,
            position: { ...prev.position, start: newLoc },
          };
        } else {
          const startLatLng = L.latLng(prev.position.start);
          const endLatLng = L.latLng(newLoc);
          fetchRoute(startLatLng, endLatLng);

          return {
            ...prev,
            position: { ...prev.position, end: newLoc },
          };
        }
      });
    },
    [fetchRoute, setMissionStates] // Proper dependencies
  );

  // Safe Animation Loop
  useEffect(() => {
    if (!isActive || !missionStates.route || !missionStates.route.rawLine)
      return;
    console.log("start animation..");

    const frame = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const routeData = missionStates.route!;
      const routeDist = routeData.distance || 1;

      progressRef.current = Math.min(
        progressRef.current + (delta * speedMs) / routeDist,
        1
      );

      const dDone = progressRef.current * routeDist;

      try {
        // Turf.js uses [lng, lat]
        const pt = along(lineString(routeData.rawLine), dDone / 1000, {
          units: "kilometers",
        });
        const [lng, lat] = pt.geometry.coordinates;

        // Update Global State
        setMissionStates((prev) => ({
          ...prev,
          position: {
            ...prev.position,
            current: [lat, lng], // Map to [Lat, Lng]
          },
          metrics: {
            ...prev.metrics,
            progress: progressRef.current,
            distDone: dDone,
            steps: Math.floor(dDone / METERS_PER_STEP),
            timeLeft: Math.ceil(
              (routeData.duration || 0) * (1 - progressRef.current)
            ),
          },
        }));
      } catch (e) {
        console.error("Animation Point Error:", e);
      }

      if (progressRef.current < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setMissionStates({
          ...missionStates,
          missionStatus: "finished",
        });
        reset(); // Ensure reset clears local refs too
        confetti();
      }
    };

    animRef.current = requestAnimationFrame(frame);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = 0;
    };
  }, [
    isActive,
    missionStates.route,
    speedMs,
    setMissionStates,
    missionStates.position,
  ]);

  const handleStartMission = async () => {
    // 1. Hardware Feedback
    triggerTactilePulse("double");
    setMissionStates({
      ...missionStates,
      missionStatus: "active",
    });
  };

  const handleStopMission = async () => {
    await toggleStayAwake(false);
    triggerTactilePulse("short");
    setMissionStates({
      ...missionStates,
      missionStatus: "paused",
    });
    cancelAnimationFrame(animRef.current);
    lastTimeRef.current = 0;
  };

  interface UpdateMissionStatusProps {
    status: "active" | "paused" | "finished" | "reset";
    missionId: string;
  }
  const updateMissionStatus = async (
    status: UpdateMissionStatusProps["status"],
    missionId: string
  ) => {
    if (!missionId) return;

    const partialData = {
      status,
    };
    await StorageService.UpdateRouteSummary(missionId, partialData);
  };
  // 4. Memoize reset
  // 1. Call hooks at the top level of your component

  const reset = useCallback(async () => {
    // 2. Get the ID from the state we already have at the top level
    const missionid = missionStates.currentMissionId;

    if (missionid) {
      await StorageService.removeRouteSummary(missionid);
    }

    // 3. Reset Global Context State in one go
    setMissionStates((prev) => ({
      ...prev,
      missionStatus: "idle",
      currentMissionId: null,
      position: {}, // Clears start, end, and current
      metrics: {
        steps: 0,
        progress: 0,
        distDone: 0,
        totalDist: 0,
        timeLeft: 0,
        totalTime: 0,
      },
      route: null,
      checkPoints: null,
    }));

    progressRef.current = 0;
    lastTimeRef.current = 0;

    // If setPoints/setRoute are still local states, clear them here:
    // setPoints({ start: null, end: null });
  }, [missionStates.currentMissionId, setMissionStates, isActive]);

  return {
    isActive,
    handleMapClick,
    searchLocation,
    reset,
    isLoadingRoute,
    setIsLocked,
    isLocked,
    handleLocationSelect,
    handleStopMission,
    handleStartMission,
    removePoint,
    getLocalityName,
    updateMissionStatus,
  };
}
