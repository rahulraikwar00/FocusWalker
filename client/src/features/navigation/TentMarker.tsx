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
  tent: any;
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
    if (!currentPos || !tent.latlng || !isActive) return;

    try {
      // Standardize both points to Leaflet LatLng objects
      const p1 = L.latLng(currentPos);
      const p2 = L.latLng(tent.latlng);

      // Safety check for valid coordinates
      if (!p1 || !p2) return;

      const distance = p1.distanceTo(p2);

      if (distance < 8 && !hasTriggered.current && markerRef.current) {
        hasTriggered.current = true;
        setIsActive(false);
        OpenPopup(tent.id, markerRef.current);
      }
    } catch (err) {
      console.error("Coordinate calculation failed", err);
    }
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
          index={tent.originalIdx}
          handleMarkerClick={ClosePopup}
          tent={tent}
          setIsActive={setIsActive} // Pass this so "Secure Camp" can restart the journey
        />
      </Popup>
    </Marker>
  );
};
