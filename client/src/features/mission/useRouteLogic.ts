import confetti from "canvas-confetti";
import L from "leaflet";
import { useState, useRef, useEffect, useCallback } from "react";
import { lineString } from "@turf/helpers";
import along from "@turf/along";
import {
  getMissionId,
  toggleStayAwake,
  triggerTactilePulse,
} from "@/lib/utils";
import { useGlobal } from "./contexts/GlobalContext";
import { useMissionContext, MissionState } from "./contexts/MissionContext";
import {
  saveMissionStatesToStorage,
  StorageService,
} from "@/lib/storageService";
import { CheckPointData } from "@/types/types";
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
  const progressRef = useRef(missionStates.metrics.progress || 0);
  const { user } = useGlobal();

  const isActive = missionStates.missionStatus === "active";

  // Speed converted to meters per second
  const speedMs = (speedKmh * 1000) / 3600;

  useEffect(() => {
    if (missionStates.metrics.progress > 0) {
      progressRef.current = missionStates.metrics.progress;
    }
  }, []); // Run once on mount

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
          `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
        );
        const data = await res.json();

        if (data.code === "Ok" && data.routes?.length > 0) {
          const r = data.routes[0];

          // 1. Process the route data using your helper
          const newRoute: ActiveRoute = {
            path: r.geometry.coordinates.map(
              (c: any) => [c[1], c[0]] as [number, number],
            ),
            rawLine: r.geometry.coordinates,
            distance: r.distance,
            duration: r.distance / speedMs,
          };

          // 2. Calculate tactical "Tent" checkpoints
          const line = lineString(r.geometry.coordinates);
          const tents = calculateTents(line, r.distance).map(
            (t) => [t.coords.lat, t.coords.lng] as [number, number], // Cast to Tuple
          );

          setMissionStates((prev) => ({
            ...prev,
            route: newRoute,
            checkPoints: tents,
            metrics: {
              ...prev.metrics,
              progress: 0,
              steps: 0,
              distDone: 0,
              timeLeft: Math.ceil(r.distance / speedMs),
              totalDist: r.distance,
              totalTime: r.distance / speedMs,
            },
          }));

          // 4. PRE-GENERATE MISSION ID (Optional but recommended)
          // You can store this in a ref or state so it's ready when they click "START"
          const startFingerprint = `${start.lat.toFixed(4)},${start.lng.toFixed(
            4,
          )}`;
          const endFingerprint = `${end.lat.toFixed(4)},${end.lng.toFixed(4)}`;
          console.log(
            `Tactical ID Ready: OP_${startFingerprint}_${endFingerprint}`,
          );
        }
      } catch (err) {
        console.error("OSRM Route Error:", err);
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [speedMs, setMissionStates],
  );

  useEffect(() => {
    const { start, end } = missionStates.position;

    // Only run if we have both points but no ID yet
    if (start && end && !missionStates.currentMissionId) {
      const newId = getMissionId({
        start: L.latLng(start),
        end: L.latLng(end),
      });

      setMissionStates((prev) => ({
        ...prev,
        currentMissionId: newId,
      }));
    }
  }, [
    missionStates.position.start,
    missionStates.position.end,
    missionStates.currentMissionId,
  ]);
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
          checkPointId: `tent-${accumulatedDistance}`,
          coords: new L.LatLng(lat, lng),
          distanceMark: accumulatedDistance,
        });

        accumulatedDistance += segmentDistanceMeters;
      }
      return tents;
    },
    [speedMs],
  );

  //locacality name using lat lng
  const getLocalityName = async (lat: number, lon: number): Promise<string> => {
    // try {
    //   const response = await fetch(
    //     `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
    //     {
    //       headers: {
    //         "User-Agent": "FocusWalker-Tactical-App", //
    //       },
    //     }
    //   );

    //   const data = await response.json();

    //   const addr = data.address;
    //   const locality =
    //     addr.suburb ||
    //     addr.neighbourhood ||
    //     addr.city_district ||
    //     addr.town ||
    //     addr.village ||
    //     addr.city;

    //   return locality || "Unknown Sector";
    // } catch (error) {
    //   console.error("Geocoding failed:", error);
    //   return "Unknown Sector";
    // }
    return "testNameLocality";
  };

  const normalize = (coord: number) => Math.round(coord * 1000000) / 1000000;
  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (isActive) return;

      const clickedCoord: [number, number] = [
        normalize(e.latlng.lat),
        normalize(e.latlng.lng),
      ];

      // 1. Determine the logic BEFORE setting state
      const currentStart = missionStates.position.start;
      const currentEnd = missionStates.position.end;

      if (!currentStart) {
        // SET START
        setMissionStates((prev) => ({
          ...prev,
          position: { ...prev.position, start: clickedCoord },
        }));
      } else if (!currentEnd) {
        // SET END AND FETCH
        const startLatLng = L.latLng(currentStart);
        const endLatLng = L.latLng(clickedCoord);

        // Call this OUTSIDE the setter
        fetchRoute(startLatLng, endLatLng);
        setMissionStates((prev) => ({
          ...prev,
          position: { ...prev.position, end: clickedCoord },
        }));
      }
    },
    [isActive, missionStates.position, fetchRoute, setMissionStates],
  );
  // Inside useRouteLogic.ts

  const removePoint = (type: "start" | "end", isActive: boolean) => {
    if (isActive) return;

    // Use a functional update (prev => ...) to ensure you have the latest state
    setMissionStates((prev) => {
      // Shared
      //  values to avoid repetition
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

  const searchLocation = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      if (!query || isActive) return [];
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query,
          )}&limit=5`,
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
    [isActive],
  );

  interface SearchResult {
    name: string;
    latlng: L.LatLng;
  }
  // 3. Memoize handleLocationSelect
  const handleLocationSelect = useCallback(
    (result: SearchResult) => {
      // 1. Ensure the format is [lat, lng] to match MissionState
      const newLoc: [number, number] = [
        normalize(result.latlng.lat),
        normalize(result.latlng.lng),
      ];

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
    [fetchRoute, setMissionStates], // Proper dependencies
  );

  const handleDestinationSelect = useCallback(
    (dest: any) => {
      // 1. Normalize coordinates immediately
      const endLoc: [number, number] = [
        normalize(dest.lat),
        normalize(dest.lng),
      ];

      setMissionStates((prev) => {
        // 2. Determine start location from current state
        const effectiveStart = prev.position.start || prev.position.current;

        // 3. Fail if we have absolutely no way to know where we are
        if (!effectiveStart) {
          console.error(
            "Navigation Error: No coordinates available to initialize start.",
          );
          return prev;
        }
        const startLatLng = L.latLng(effectiveStart[0], effectiveStart[1]);
        const endLatLng = L.latLng(endLoc[0], endLoc[1]);
        fetchRoute(startLatLng, endLatLng);

        // 5. Return the full updated state in ONE go
        return {
          ...prev,
          position: {
            ...prev.position,
            start: effectiveStart, // Ensures start is populated if it was missing
            end: endLoc, // Sets the destination
          },
        };
      });
    },
    [fetchRoute, setMissionStates],
  );
  useEffect(() => {
    if (missionStates.metrics.progress > 0) {
      progressRef.current = missionStates.metrics.progress;
      console.log("HUD: Progress Synced from DB ->", progressRef.current);
    }
  }, [missionStates.currentMissionId]);

  useEffect(() => {
    const { route } = missionStates;
    if (!isActive || !route?.rawLine) return;

    const frame = (time: number) => {
      // 1. Calculate Time Delta
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // 2. Advance Progress
      const routeDist = route.distance || 1;
      const newProgress = Math.min(
        progressRef.current + (delta * speedMs) / routeDist,
        1,
      );
      progressRef.current = newProgress;

      const dDone = newProgress * routeDist;

      try {
        // 3. Calculate New Coordinates
        const pt = along(lineString(route.rawLine), dDone / 1000, {
          units: "kilometers",
        });
        const [lng, lat] = pt.geometry.coordinates;

        // 4. Atomic State Update (prev => ...)
        // This avoids re-triggering the effect when missionStates changes
        setMissionStates((prev) => ({
          ...prev,
          position: { ...prev.position, current: [lat, lng] },
          metrics: {
            ...prev.metrics,
            progress: newProgress, // Use the raw float for internal logic
            distDone: Math.floor(dDone),
            steps: Math.floor(dDone / METERS_PER_STEP),
            timeLeft: Math.ceil((route.duration || 0) * (1 - newProgress)),
          },
        }));

        // 5. Loop or Finish
        if (newProgress < 1) {
          animRef.current = requestAnimationFrame(frame);
        } else {
          completeMission();
        }
      } catch (e) {
        console.error("Animation Point Error:", e);
      }
    };

    const completeMission = () => {
      setMissionStates((prev) => ({ ...prev, missionStatus: "finished" }));
      reset("finished");
      confetti();
    };

    animRef.current = requestAnimationFrame(frame);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = 0;
    };
  }, [isActive, missionStates.route, speedMs, setMissionStates]);
  // Note: missionStates.route is a dependency, but missionStates itself is NOT.
  const handleStartMission = async () => {
    const existing = await StorageService.getFullMission(
      missionStates.currentMissionId,
    );
    if (!existing) {
      const initialMission = {
        ...missionStates,
        timeStamp: new Date().toISOString(),
      };
      saveMissionStatesToStorage(initialMission);
    } else {
      await StorageService.updateMission(missionStates.currentMissionId, {
        metrics: { ...missionStates.metrics },
        missionStatus: "active",
      });
    }
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

    saveMissionStatesToStorage(missionStates);
    cancelAnimationFrame(animRef.current);
    lastTimeRef.current = 0;
  };

  // const reset = useCallback(
  //   async (type: "finished" | "paused") => {
  //     // 1. Move Side Effects OUT of the state setter
  //     // We use the 'missionStates' variable directly from the component scope
  //     const missionid = missionStates.currentMissionId;
  //     if (missionid && type === "paused") {
  //       alert("you are about to remove allData of this mission");
  //       StorageService.deleteMission(missionid);
  //     }
  //     // 2. Capture the location from the Hook, not the state
  //     const currentPos = user.location
  //       ? (user.location as [number, number])
  //       : null;

  //     // 3. Perform the State Update (Purely for updating data)
  //     setMissionStates((prev) => {
  //       if (type === "paused") {
  //         return {
  //           ...prev,
  //           missionStatus: "idle",
  //           currentMissionId: "",
  //           position: {
  //             end: null,
  //             current: currentPos,
  //             start: currentPos, // Set start to the user's current location
  //           },
  //           metrics: {
  //             steps: 0,
  //             progress: 0,
  //             distDone: 0,
  //             totalDist: 0,
  //             timeLeft: 0,
  //             totalTime: 0,
  //           },
  //           route: null,
  //           checkPoints: null,
  //         };
  //       } else {
  //         return {
  //           ...prev,
  //           missionStatus: "finished",
  //           currentMissionId: "",
  //           route: null,
  //           checkPoints: null,
  //         };
  //       }
  //     });

  //     // Reset refs
  //     progressRef.current = 0;
  //     lastTimeRef.current = 0;
  //   },
  //   // ADD dependencies here so the function knows when location or ID changes
  //   [setMissionStates, user.location, missionStates.currentMissionId]
  // );

  const reset = useCallback(
    async (type: "finished" | "paused") => {
      const missionId = missionStates.currentMissionId;

      // --- CASE 1: ABORT/PAUSE (Hard Reset) ---
      if (type === "paused") {
        if (missionId) {
          await StorageService.deleteMission(missionId);
        }

        const currentPos = user.location
          ? (user.location as [number, number])
          : null;

        setMissionStates((prev) => ({
          ...prev,
          missionStatus: "idle",
          currentMissionId: "",
          position: { start: currentPos, current: currentPos, end: null },
          metrics: {
            steps: 0,
            progress: 0,
            distDone: 0,
            totalDist: 0,
            timeLeft: 0,
            totalTime: 0,
          },
          route: null, // Clear map
          checkPoints: null, // Clear map
        }));

        progressRef.current = 0;
      }

      // --- CASE 2: FINISHED (Appreciation State) ---
      else {
        setMissionStates((prev) => ({
          ...prev,
          missionStatus: "finished",
          currentMissionId: "",
        }));
      }
      lastTimeRef.current = 0;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    },
    [setMissionStates, user.location, missionStates.currentMissionId],
  );

  return {
    handleDestinationSelect,
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
    // updateMissionStatus,
  };
}
