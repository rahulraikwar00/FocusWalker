import React, { useEffect, useRef, useState } from "react";
import { Popup, Marker } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import { GiCampingTent } from "react-icons/gi";
import { PopUpcard } from "./PopupCard";
import { useMissionContext } from "../mission/contexts/MissionContext";
import { useRouteLogic } from "../mission/useRouteLogic";

// --- RPG ICON ASSET GENERATOR ---
const createIcon = (side: "left" | "right") =>
  L.divIcon({
    html: renderToStaticMarkup(
      <div className="relative flex items-center justify-center">
        <div
          className="absolute inset-0 blur-sm opacity-60 animate-pulse"
          style={{ color: "var(--accent-primary)" }}
        >
          <GiCampingTent size={32} fill="var(--hud-bg)" />
        </div>
        <div style={{ color: "var(--accent-primary)" }}>
          <GiCampingTent size={32} fill="currentColor" />
        </div>
      </div>
    ),
    className: "rpg-tent-marker",
    iconSize: [40, 40],
    iconAnchor: [side === "left" ? -5 : 45, 30],
  });

const TENT_LEFT = createIcon("left");
const TENT_RIGHT = createIcon("right");

interface TentMarkerProps {
  tent: any;
  index: number;
  OpenPopup: (tentId: string, marker: L.Marker) => void;
  ClosePopup: () => void;
  points: any;
}

export const TentMarker = ({
  tent,
  index,
  OpenPopup,
  ClosePopup,
}: TentMarkerProps) => {
  const markerRef = useRef<L.Marker>(null);
  const hasTriggered = useRef(false);
  const { missionStates, setMissionStates } = useMissionContext();
  const { getLocalityName } = useRouteLogic();
  const [locality, setLocality] = useState<string>("Loading...");

  const isActive = missionStates.missionStatus === "active";
  const currentPos = missionStates.position.current;

  // 1. Trigger Pause Logic
  useEffect(() => {
    if (!currentPos || !tent.latlng || !isActive || hasTriggered.current)
      return;

    const p1 = L.latLng(currentPos);
    const p2 = L.latLng(tent.latlng);
    const distance = p1.distanceTo(p2);

    // Increase threshold slightly for high-speed stability (e.g., 10-15m)
    if (distance < 10 && markerRef.current) {
      hasTriggered.current = true;

      // Use functional update to avoid stale state bugs
      setMissionStates((prev) => ({ ...prev, missionStatus: "paused" }));
      OpenPopup(tent.id, markerRef.current);
    }
  }, [currentPos, isActive, tent.latlng, tent.id, OpenPopup, setMissionStates]);

  // 2. Geocoding Logic (Run only once per marker)
  useEffect(() => {
    let isMounted = true;
    const fetchLocality = async () => {
      if (!tent.latlng) return;

      const name = await getLocalityName(tent[0], tent[1]);
      if (isMounted) setLocality(name);
    };

    fetchLocality();
    return () => {
      isMounted = false;
    };
  }, [tent.latlng]); // Only run if coordinate changes

  return (
    <Marker
      position={tent.latlng}
      icon={index % 2 === 0 ? TENT_LEFT : TENT_RIGHT}
      ref={markerRef}
      eventHandlers={{
        click: (e) => OpenPopup(tent.id, e.target as L.Marker),
      }}
    >
      <Popup autoPan={false} closeButton={false}>
        <PopUpcard
          index={index}
          handleMarkerClick={ClosePopup}
          tent={tent}
          locality={locality}
        />
      </Popup>
    </Marker>
  );
};
