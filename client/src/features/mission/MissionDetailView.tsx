import { StorageService } from "@/lib/utils";
import L from "leaflet";
import React, { use, useEffect, useState } from "react";

import { RouteData } from "@/types/types";
import { useDrawer } from "./contexts/DrawerContext";
import { Button } from "@/components/ui/button";
export const MissionDetailView = () => {
  const [mission, setMission] = useState<RouteData[] | null>(null);

  const { isOpen } = useDrawer();

  useEffect(() => {
    const missionDetails = async () => {
      const details = await StorageService.getAllSummaries();
      setMission(details);
      console.log(details);
    };
    missionDetails();
  }, [isOpen]); // fetch and memo and add if new mssio is added

  console.log("mission details", mission);

  return (
    <div className="flex flex-col space-y-2">
      {mission?.map((route) => (
        <Button key={route.id}>
          <RouteDetailsCard key={route.id} route={route} />
        </Button>
      ))}
    </div>
  );
};

const RouteDetailsCard = ({ route }: { route: RouteData }) => {
  return (
    <div className="w-full rounded-lg bg-gray-800 p-3 text-white shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {route.missionName ?? "Mission"}
        </h3>

        {route.status && (
          <span
            className={`rounded px-2 py-0.5 text-xs capitalize ${
              route.status === "completed"
                ? "bg-green-600"
                : route.status === "active"
                ? "bg-blue-600"
                : "bg-red-600"
            }`}
          >
            {route.status}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="mt-2 flex justify-between text-xs text-gray-300">
        <div>
          <p className="text-gray-400">Distance</p>
          <p className="text-white font-medium">
            {route.totalDistance.toFixed(2)} km
          </p>
        </div>

        <div>
          <p className="text-gray-400">Duration</p>
          <p className="text-white font-medium">
            {route.totalDuration != null ? `${route.totalDuration} min` : "—"}
          </p>
        </div>
      </div>

      {/* Timestamp (optional) */}
      {route.timestamp && (
        <p className="mt-2 text-[11px] text-gray-500">
          {new Date(route.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
};
