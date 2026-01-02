import React from "react";
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

// --- UI COMPONENT ---
export const TentMarker = ({ tent, index, markerRef, onSecure }: any) => (
  <Marker
    position={tent.latlng}
    icon={index % 2 === 0 ? TENT_LEFT : TENT_RIGHT}
    ref={markerRef}
  >
    <Popup
      minWidth={160}
      maxWidth={160}
      autoPan={false}
      keepInView={false}
      closeButton={false}
    >
      <PopUpcard index={index} onSecure={onSecure} tent={tent} />
    </Popup>
  </Marker>
);
