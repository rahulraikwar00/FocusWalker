import React, { useEffect, useRef } from "react";
import { Popup, Marker } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import { GiCampingTent } from "react-icons/gi";
import { PopUpcard } from "./PopupCard";

// --- RPG ICON ASSET GENERATOR ---
const createIcon = (side: "left" | "right") =>
  L.divIcon({
    html: renderToStaticMarkup(
      <div className="relative flex items-center justify-center">
        <div
          className="absolute inset-0 blur-sm opacity-60 animate-pulse"
          style={{ color: "var(--accent-primary)" }}
        >
          <GiCampingTent size={28} fill="var(--hud-bg)" />
        </div>
        <div style={{ color: "var(--accent-primary)" }}>
          <GiCampingTent size={28} fill="currentColor" />
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
  tent: {
    id: string;
    latlng: L.LatLng;
    distanceMark: number;
  };
  index: number;
  currentPos: L.LatLng | null;
  isActive: boolean;
  setIsActive: (value: boolean) => void; // Changed signature
  OpenPopup: (tentId: string, marker: L.Marker) => void;
  ClosePopup: () => void;
}
export const TentMarker = ({
  tent,
  index,
  currentPos,
  isActive,
  setIsActive,
  OpenPopup,
  ClosePopup,
}: TentMarkerProps) => {
  const markerRef = useRef<L.Marker>(null);
  // Inside your TentMarker component
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!currentPos || !tent.latlng || !isActive) {
      return;
    }
    const p1 = L.latLng(currentPos);
    const p2 = L.latLng(tent.latlng);
    const distance = p1.distanceTo(p2);

    // Added check: !hasTriggered.current
    if (distance < 1.5 && !hasTriggered.current && markerRef.current) {
      console.log("Mission Objective Reached");

      hasTriggered.current = true; // Lock the trigger
      setIsActive(false);
      OpenPopup(tent.id, markerRef.current);
    }

    // // Optional: Reset the lock if the user moves far away (e.g., > 10m)
    // // This allows them to trigger it again if they leave and come back
    // if (distance > 10 && hasTriggered.current) {
    //   hasTriggered.current = false;
    // }
  }, [currentPos, isActive, tent.latlng, setIsActive, OpenPopup, tent.id]);

  return (
    <Marker
      position={tent.latlng}
      icon={index % 2 === 0 ? TENT_LEFT : TENT_RIGHT}
      ref={markerRef}
      eventHandlers={{
        click: (e) => OpenPopup(tent.id, e.target),
      }}
    >
      <Popup
        minWidth={160}
        maxWidth={160}
        autoPan={false}
        keepInView={false}
        closeButton={false}
      >
        <PopUpcard
          index={index}
          handleMarkerClick={ClosePopup}
          tent={tent}
          setIsActive={setIsActive} // Pass this so "Secure Camp" can restart the journey
        />
      </Popup>
    </Marker>
  );
};
