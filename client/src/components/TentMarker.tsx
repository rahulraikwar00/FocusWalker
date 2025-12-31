import React from "react";
import { Popup, Marker } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import { GiCampingTent } from "react-icons/gi";

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
    <Popup minWidth={160} maxWidth={160} closeButton={false}>
      {/* Main Container using your glass-card and tactical shadow */}
      <div className="glass-card flex flex-col rounded-3xl overflow-hidden w-40">
        {/* Visual Header: Simple and soft */}
        <div className="flex flex-col items-center justify-center pt-5 pb-3 bg-(--accent-glow)">
          <div className="relative">
            <GiCampingTent
              size={42}
              className="text-(--accent-primary) drop-shadow-[0_0_10px_var(--accent-glow)]"
            />
            {/* Subtle floor glow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-(--accent-primary) blur-md opacity-50" />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 flex flex-col gap-1 text-center">
          <span className="text-[10px] font-bold tracking-[0.15em] opacity-60 text-(--text-secondary) uppercase">
            Intel {index + 1}
          </span>

          <h3 className="text-sm font-bold text-(--text-primary)">Rest Area</h3>

          <p className="text-[11px] leading-tight text-(--text-secondary) mb-3">
            {25 * (index + 1)}m focus required for sector recovery.
          </p>

          {/* Using your btn-primary utility */}
          <button
            className="btn-primary w-full text-[10px] py-2 px-0 uppercase tracking-widest cursor-pointer shadow-lg"
            onClick={() => onSecure(tent.id)}
          >
            Secure
          </button>
        </div>
      </div>
    </Popup>
  </Marker>
);
