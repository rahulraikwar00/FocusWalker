import confetti from "canvas-confetti";
import L from "leaflet";
import { useState, useRef, useEffect, useCallback } from "react";
import { lineString } from "@turf/helpers";
import along from "@turf/along";
import { toggleStayAwake, triggerTactilePulse } from "@/lib/utils";
const METERS_PER_STEP = 0.72; // Average step length in meters

export function useRouteLogic(speedKmh: number, isWakeLockEnabled: boolean) {
  const [points, setPoints] = useState<{
    start: L.LatLng | null;
    end: L.LatLng | null;
  }>({ start: null, end: null });
  const [route, setRoute] = useState<any>(null);
  const [currentPos, setCurrentPos] = useState<L.LatLng | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [metrics, setMetrics] = useState({
    steps: 0,
    timeLeft: 0,
    distDone: 0,
  });
  const [isLocked, setIsLocked] = useState(true); // Default to locked
  const [tentPositionArray, setTentPositionArray] = useState<any>(null);

  const wakeLockResource = useRef<WakeLockSentinel | null>(null);

  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef(0);

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
          const line = lineString(r.geometry.coordinates);
          setRoute({
            path: r.geometry.coordinates.map((c: any) => [c[1], c[0]]),
            line: lineString(r.geometry.coordinates),
            distance: r.distance,
            duration: r.distance / speedMs,
          });
          const tents = calculateTents(line, r.distance);
          setTentPositionArray(tents);

          setMetrics({
            steps: 0,
            timeLeft: Math.ceil(r.distance / speedMs),
            distDone: 0,
          });
        }
      } catch (err) {
        console.error("OSRM Route Error:", err);
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [speedMs]
  );

  const calculateTents = useCallback(
    (line: any, totalDistance: number) => {
      const segmentMinutes = 1;
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

  // Inside useRouteLogic.ts

  const removePoint = (type: "start" | "end", isActive: boolean) => {
    if (isActive) return;
    setPoints((prev) => {
      setRoute(null);
      setTentPositionArray(null);
      setProgress(0);

      if (type === "start") {
        // If start is removed, we usually want to clear everything
        // because the destination was relative to that start.
        return { start: null, end: null };
      } else {
        return { ...prev, end: null };
      }
    });

    triggerTactilePulse("short");
  };

  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (isActive) return;

      setPoints((p) => {
        if (!p.start) {
          // SET START
          return { ...p, start: e.latlng };
        } else if (!p.end) {
          // SET END & TRIGGER ROUTE
          fetchRoute(p.start, e.latlng);
          return { ...p, end: e.latlng };
        }
        // If both exist, ignore map clicks (must remove a point first)
        return p;
      });
    },
    [isActive, fetchRoute]
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
      const newLoc = result.latlng;
      setPoints((p) => {
        if (!p.start) {
          // setCurrentPos(newLoc);
          return { ...p, start: newLoc };
        } else {
          fetchRoute(p.start, newLoc);
          return { ...p, end: newLoc };
        }
      });
    },
    [fetchRoute]
  );

  // Safe Animation Loop
  useEffect(() => {
    if (!isActive || !route || !route.line) return;

    const frame = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Ensure we don't divide by zero
      const routeDist = route.distance || 1;
      progressRef.current = Math.min(
        progressRef.current + (delta * speedMs) / routeDist,
        1
      );

      const dDone = progressRef.current * routeDist;

      try {
        const pt = along(route.line, dDone / 1000, {
          units: "kilometers",
        });
        const [lng, lat] = pt.geometry.coordinates;

        setCurrentPos(new L.LatLng(lat, lng));
        setProgress(progressRef.current);
        setMetrics({
          steps: Math.floor(dDone / METERS_PER_STEP),
          timeLeft: Math.ceil(
            (route.duration || 0) * (1 - progressRef.current)
          ),
          distDone: dDone,
        });
      } catch (e) {
        console.error("Animation Point Error:", e);
      }

      if (progressRef.current < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setIsActive(false);
        confetti();
      }
    };

    animRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animRef.current);
      lastTimeRef.current = 0;
    };
  }, [isActive, route, speedMs]);

  const handleStartMission = async () => {
    // 1. Hardware Feedback
    triggerTactilePulse("double");

    // 2. System Settings (WakeLock)
    if (isWakeLockEnabled) {
      await toggleStayAwake(true);
    }

    // 3. Local State Change
    setIsActive(true);
  };

  const handleStopMission = async () => {
    await toggleStayAwake(false);
    triggerTactilePulse("short");
    setIsActive(false);
    // Important: Don't reset everything, just stop the movement
    cancelAnimationFrame(animRef.current);
    lastTimeRef.current = 0;
  };

  // 4. Memoize reset
  const reset = useCallback(() => {
    setPoints({ start: null, end: null });
    setRoute(null);
    setCurrentPos(null);
    setIsActive(false);
    setProgress(0);
    setTentPositionArray(null);
    progressRef.current = 0;
    lastTimeRef.current = 0;
    setMetrics({ steps: 0, timeLeft: 0, distDone: 0 });
  }, []);
  return {
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
    isLoadingRoute,
    setIsLocked,
    isLocked,
    handleLocationSelect,
    tentPositionArray,
    handleStopMission,
    handleStartMission,
    removePoint,
    setPoints,
  };
}
