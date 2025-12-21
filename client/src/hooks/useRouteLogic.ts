import { useState, useRef, useEffect, useMemo } from "react";
import * as turf from "@turf/turf";

export function useRouteLogic(speedKmh: number) {
  const [points, setPoints] = useState<{ start: any; end: any }>({
    start: null,
    end: null,
  });
  const [route, setRoute] = useState<any>(null);
  const [currentPos, setCurrentPos] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Stats
  const [metrics, setMetrics] = useState({
    steps: 0,
    timeLeft: 0,
    distDone: 0,
  });

  const progressRef = useRef(0);
  const lastTimeRef = useRef(0);
  const speedMs = (speedKmh * 1000) / 3600;

  const handleMapClick = async (e: any) => {
    if (!points.start) {
      setPoints({ ...points, start: e.latlng });
      setCurrentPos(e.latlng);
    } else if (!points.end) {
      setPoints({ ...points, end: e.latlng });
      fetchRoute(points.start, e.latlng);
    }
  };

  const fetchRoute = async (start: any, end: any) => {
    setIsLoadingRoute(true);
    setRouteError(null);
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.code !== "Ok") throw new Error("Could not find route");

      const r = data.routes[0];
      setRoute({
        path: r.geometry.coordinates.map((c: any) => ({
          lat: c[1],
          lng: c[0],
        })),
        line: turf.lineString(r.geometry.coordinates),
        distance: r.distance,
        duration: r.distance / speedMs,
      });
    } catch (err: any) {
      setRouteError(err.message);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const reset = () => {
    setIsActive(false);
    setPoints({ start: null, end: null });
    setRoute(null);
    setCurrentPos(null);
    setProgress(0);
    progressRef.current = 0;
    setMetrics({ steps: 0, timeLeft: 0, distDone: 0 });
  };

  return {
    points,
    route,
    currentPos,
    isActive,
    progress,
    metrics,
    handleMapClick,
    setIsActive,
    reset,
    isLoadingRoute,
    routeError,
  };
}
