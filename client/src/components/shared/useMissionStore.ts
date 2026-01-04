import { StorageService } from "@/lib/utils";
import { RouteData, CheckPointData } from "@/types/types";
import { useState } from "react";

export const useMission = () => {
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);

  // START: Called from RouteSelectionCard
  const startMission = (initialData: Partial<RouteData>) => {
    const newRoute: RouteData = {
      id: `route_${Date.now()}`,
      missionName: initialData.missionName || "New Patrol",
      originName: initialData.originName || "Start Point",
      destinationName: initialData.destinationName || "End Point",
      totalDistance: 0,
      totalDuration: 0,
      timestamp: new Date().toISOString(),
      logs: [],
      status: "active",
    };
    setActiveRoute(newRoute);
  };

  // ADD LOG: Called from PopUpcard
  const addCheckpoint = async (log: CheckPointData) => {
    if (!activeRoute) return;

    // 1. Update Memory
    const updatedLogs = [log, ...activeRoute.logs];
    setActiveRoute({ ...activeRoute, logs: updatedLogs });

    // 2. Background Save to Disk (Safe from crashes)
    await StorageService.saveLogs(activeRoute.id, updatedLogs);
  };

  // FINISH: Called from Global "End Mission" button
  const finalizeMission = async () => {
    if (!activeRoute) return;

    const completedRoute: RouteData = { ...activeRoute, status: "completed" };

    // Save summary to index and clear active state
    await StorageService.saveRouteSummary(completedRoute);
    setActiveRoute(null);
  };

  const getLogsByStation = async (stationId: string) => {
    if (!activeRoute) return null;
    const allLogs = await StorageService.getFullRoute(activeRoute.id);
    if (!allLogs) return null;
    return allLogs.logs.filter((log) => log.id === stationId);
  };

  return {
    activeRoute,
    startMission,
    addCheckpoint,
    finalizeMission,
    getLogsByStation,
  };
};
