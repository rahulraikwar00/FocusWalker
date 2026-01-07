import React, { useEffect, useRef, useState } from "react";
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
  points: any;
}

export const TentMarker = ({
  tent,
  index,
  currentPos,
  isActive,
  setIsActive,
  OpenPopup,
  ClosePopup,
  points,
}: TentMarkerProps) => {
  const markerRef = useRef<L.Marker>(null);
  // Inside your TentMarker component
  const hasTriggered = useRef(false);

  const [locality, setLocality] = useState<string>("earth");

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

  // async function getLocality(lat: number, lon: number): Promise<string> {
  //   try {
  //     const response = await fetch(
  //       `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
  //     );
  //     const data = await response.json();
  //     console.log("localtiy data", data);

  //     // Returns 'locality' (e.g., "Brooklyn") or falls back to 'city' (e.g., "New York")
  //     return data.locality || data.city || "Unknown Location";
  //   } catch (error) {
  //     console.error("Geocoding failed:", error);
  //     return "Unknown Territory";
  //   }
  // }

  async function getLocality(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      // Logic: Neighborhood -> Village/Town -> City
      return data.locality || data.village || data.city || "Wilderness";
    } catch (error) {
      return "Unknown Territory";
    }
  }

  useEffect(() => {
    const handleLocality = async () => {
      // Small safety check
      if (!tent.latlng) return;

      const name = await getLocality(tent.latlng.lat, tent.latlng.lng);
      setLocality(name);
    };

    handleLocality();
  }, [tent.latlng.lat, tent.latlng.lng]);

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
          points={points}
          index={tent.originalIdx}
          handleMarkerClick={ClosePopup}
          tent={tent}
          setIsActive={setIsActive} // Pass this so "Secure Camp" can restart the journey
          locality={locality}
        />
      </Popup>
    </Marker>
  );
};
