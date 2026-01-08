import { useState, useRef, useEffect } from "react";
import L from "leaflet";
import along from "@turf/along";
import confetti from "canvas-confetti";

interface MetricsProps {
  steps: number;
  timeLeft: number;
  distDone: number;
  totaltime?: number;
  totalDist?: number;
}
export function useMissionProgress(
  isActive: boolean,
  setIsActive: (v: boolean) => void,
  route: any,
  speedMs: number
) {
  const [progress, setProgress] = useState(0);
  const [currentPos, setCurrentPos] = useState<L.LatLng | null>(null);
  const [metrics, setMetrics] = useState<MetricsProps>({
    steps: 0,
    timeLeft: 0,
    distDone: 0,
    totaltime: 0,
    totalDist: 0,
  });

  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef(0);

  // --- FIX: INITIALIZE METRICS WHEN ROUTE LOADS ---
  useEffect(() => {
    if (route && !isActive && progressRef.current === 0) {
      // Set the initial state so the HUD shows the total time/distance immediately
      setMetrics({
        steps: 0,
        timeLeft: Math.ceil(route.duration || 0),
        distDone: 0,
        totaltime: route.duration,
      });

      // Set the marker to the start of the route
      if (route.path && route.path.length > 0) {
        setCurrentPos(new L.LatLng(route.path[0][0], route.path[0][1]));
      }
    }
  }, [route, isActive]);

  // --- ANIMATION LOOP ---
  useEffect(() => {
    if (!isActive || !route?.line) return;

    const frame = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const routeDist = route.distance || 1;
      progressRef.current = Math.min(
        progressRef.current + (delta * speedMs) / routeDist,
        1
      );
      const dDone = progressRef.current * routeDist;

      const pt = along(route.line, dDone / 1000, { units: "kilometers" });
      const [lng, lat] = pt.geometry.coordinates;

      setCurrentPos(new L.LatLng(lat, lng));
      setProgress(progressRef.current);
      setMetrics({
        steps: Math.floor(dDone / 0.72),
        timeLeft: Math.ceil((route.duration || 0) * (1 - progressRef.current)),
        distDone: dDone,
      });

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
  }, [isActive, route, speedMs, setIsActive]);

  return {
    progress,
    currentPos,
    metrics,
    progressRef,
    setMetrics,
    setProgress,
    setCurrentPos,
    // Helper to clear progress on reset
    resetProgress: () => {
      progressRef.current = 0;
      setProgress(0);
      setMetrics({
        steps: 0,
        timeLeft: 0,
        distDone: 0,
        totalDist: 0,
        totaltime: 0,
      });
    },
  };
}
