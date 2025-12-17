import React from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface RouteStatusProps {
  isLoadingRoute: boolean;
  routeError: string | null;
  startPos: any;
  endPos: any;
  routeData: any;
  distanceText: string;
  totalDuration: number;
  METERS_PER_STEP: number;
  isActive: boolean;
}

export default function RouteStatus({
  isLoadingRoute,
  routeError,
  startPos,
  endPos,
  routeData,
  distanceText,
  totalDuration,
  METERS_PER_STEP,
  isActive,
}: RouteStatusProps) {
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isActive) return null;

  return (
    <div className="text-sm text-center bg-muted/50 p-2 rounded w-full min-h-14 flex items-center justify-center">
      {routeError && (
        <div className="flex items-start gap-2 text-amber-500">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{routeError}</span>
        </div>
      )}
      {isLoadingRoute && (
        <span className="flex items-center gap-2 text-blue-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Calculating route...
        </span>
      )}
      {!isLoadingRoute && !routeError && !startPos && (
        <span className="text-green-600 font-bold animate-pulse">
          Tap map to set START
        </span>
      )}
      {!isLoadingRoute && !routeError && startPos && !endPos && (
        <span className="text-orange-500 font-bold animate-pulse">
          Tap map to set DESTINATION
        </span>
      )}
      {!isLoadingRoute && !routeError && startPos && endPos && routeData && (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">✅ Route Ready!</span>
          <span className="text-xs">
            {distanceText} · {formatTime(totalDuration)} · ~
            {Math.floor(routeData.distance / METERS_PER_STEP).toLocaleString()}{" "}
            steps
          </span>
        </div>
      )}
    </div>
  );
}
