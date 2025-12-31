import confetti from "canvas-confetti";
import L from "leaflet";
import { useState, useRef, useEffect, useCallback } from "react";
import * as turf from "@turf/turf";
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
          setRoute({
            path: r.geometry.coordinates.map((c: any) => [c[1], c[0]]),
            line: turf.lineString(r.geometry.coordinates),
            distance: r.distance,
            duration: r.distance / speedMs,
          });
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
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (isActive) return;

    if (!points.start) {
      setPoints((p) => ({ ...p, start: e.latlng }));
      setCurrentPos(e.latlng);
    } else if (!points.end) {
      setPoints((p) => ({ ...p, end: e.latlng }));
    }
  };

  // 2. Use an Effect to handle the heavy fetching logic
  useEffect(() => {
    if (points.start && points.end && !route) {
      // This runs AFTER the click has finished and the UI has updated
      fetchRoute(points.start, points.end);
    }
  }, [points.end]);

  // 1. Just fetches the list for the UI dropdown
  const searchLocation = async (query: string): Promise<SearchResult[]> => {
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
      console.error("Search Fetch Error:", e);
      return [];
    }
  };

  interface SearchResult {
    name: string;
    latlng: L.LatLng;
  }
  // 2. Handles what happens when a user clicks a result
  const handleLocationSelect = (result: SearchResult) => {
    const newLoc = result.latlng;

    if (!points.start) {
      // Setting the first point (Origin)
      setPoints((p) => ({ ...p, start: newLoc }));
      setCurrentPos(newLoc);
    } else {
      // Setting the second point (Destination)
      setPoints((p) => ({ ...p, end: newLoc }));
      // Trigger the routing engine
      fetchRoute(points.start, newLoc);
    }
  };

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
        const pt = turf.along(route.line, dDone / 1000, {
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

  const reset = () => {
    setPoints({ start: null, end: null });
    setRoute(null);
    setCurrentPos(null);
    setIsActive(false);
    setProgress(0);
    progressRef.current = 0;
    lastTimeRef.current = 0;
    setMetrics({ steps: 0, timeLeft: 0, distDone: 0 });
  };

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
  };
}
