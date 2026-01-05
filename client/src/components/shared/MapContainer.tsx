import * as React from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { memo, useEffect, useMemo } from "react";
import { TentLayer } from "../../features/navigation/TentLayer";
import { MapProps } from "@/types/types";

/**
 * --- TACTICAL MARKER ICON ---
 * Defined outside to prevent unnecessary re-creations
 */
const MARKER_HTML = `
  <div class="relative flex items-center justify-center">
    <div class="absolute w-8 h-8 bg-(--accent-glow) rounded-full animate-ping opacity-20"></div>
    <div class="w-4 h-4 bg-(--accent-primary) rounded-full border-2 border-(--bg-page) shadow-[0_0_15px_var(--accent-glow)]"></div>
  </div>
`;
const START_MARKER_HTML = `
  <div class="relative flex items-center justify-center">
    <div class="absolute w-8 h-8 bg-(--accent-glow) rounded-full animate-pulse opacity-25"></div>
    <div class="w-5 h-5 border-2 border-(--accent-primary) rounded-full bg-(--bg-page) flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)]">
      <div class="w-2 h-2 bg-(--accent-primary) rounded-full"></div>
    </div>
  </div>
`;
const END_MARKER_HTML = `
  <div class="relative flex items-center justify-center">
    <div class="absolute w-10 h-10 bg-(--accent-glow) rounded-full animate-pulse opacity-20"></div>
    
    <div class="relative flex flex-col items-center">
      <div class="w-6 h-6 bg-(--accent-primary) rounded-full border-2 border-(--bg-page) flex items-center justify-center shadow-[0_0_20px_var(--accent-glow)]">
        <div class="w-1.5 h-1.5 bg-(--bg-page) rounded-full"></div>
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 border-t-(--accent-primary) -mt-1"></div>
    </div>
  </div>
`;

const tacticalIcon = L.divIcon({
  className: "custom-marker",
  html: MARKER_HTML,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
const starttacticalIcon = L.divIcon({
  className: "custom-marker",
  html: START_MARKER_HTML,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
const endtacticalIcon = L.divIcon({
  className: "custom-marker",
  html: END_MARKER_HTML,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export const MapView = memo(
  ({
    DEFAULT_LOCATION,
    handleMapClick,
    currentPos,
    isActive,
    points,
    route,
    isLocked,
    isDark,
    tentPositionArray,
    isLoadingRoute,
    removePoint,
    setIsActive,
  }: any) => {
    // Choose Tile Provider based on theme
    const tileUrl = useMemo(
      () =>
        isDark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      [isDark]
    );

    return (
      <div className="w-full h-full relative">
        {isLoadingRoute && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-500">
            <div className="relative flex flex-col items-center">
              <div className="relative w-24 h-1">
                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                <div className="absolute inset-0 bg-(--accent-primary) rounded-full animate-[loading-line_1.5s_ease-in-out_infinite] shadow-[0_0_8px_var(--accent-glow)]"></div>
              </div>
              <span className="mt-4 text-(--text-primary) text-xs font-bold tracking-[0.3em] uppercase animate-pulse">
                Mapping your journey...
              </span>
              <span className="mt-1 text-(--text-primary)/70 text-xs italic">
                Preparing the path ahead
              </span>
            </div>
          </div>
        )}
        <MapContainer
          center={DEFAULT_LOCATION}
          zoom={5}
          className="w-full h-full z-0 bg-(--bg-page)"
          zoomControl={false}
          minZoom={3}
        >
          <TileLayer
            key={isDark ? "dark" : "light"} // Key change forces re-render when theme flips
            url={tileUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            keepBuffer={8}
          />

          {/* Logic Controller Component */}
          <MapController
            onMapClick={handleMapClick}
            isActive={isActive}
            points={points}
            isLocked={isLocked}
            currentPos={currentPos}
          />

          {/* Start Marker */}
          {points.start && (
            <Marker
              position={points.start}
              icon={starttacticalIcon}
              eventHandlers={{
                click: (e) => {
                  // L.DomEvent.stopPropagation(e); // STOP BUBBLING
                  removePoint("start", isActive);
                },
              }}
            />
          )}

          {/* End Marker */}
          {points.end && (
            <Marker
              position={points.end}
              icon={endtacticalIcon}
              eventHandlers={{
                click: (e) => {
                  // L.DomEvent.stopPropagation(e); // STOP BUBBLING
                  removePoint("end", isActive);
                },
              }}
            />
          )}

          {/* Tactical Path (Route) */}
          {route?.path && (
            <Polyline
              positions={route.path}
              pathOptions={{
                color: isDark ? "#BFFF04" : "#86B300",
                weight: 4,
                opacity: 0.8,
                dashArray: isActive ? "1, 10" : "none", // Dashed line when active
              }}
            />
          )}

          {/* POIs & Current Position */}
          {tentPositionArray && (
            <TentLayer
              tentPositionArray={tentPositionArray}
              currentPos={currentPos}
              setIsActive={setIsActive}
              isActive={isActive}
            />
          )}

          {currentPos && (
            <Marker
              position={currentPos}
              icon={tacticalIcon}
              zIndexOffset={1000}
            />
          )}
        </MapContainer>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.isDark === next.isDark &&
      prev.isActive === next.isActive &&
      prev.isLocked === next.isLocked &&
      // Check the length of the path instead of the array reference
      prev.route?.path?.length === next.route?.path?.length &&
      prev.currentPos?.lat === next.currentPos?.lat &&
      prev.points.start?.lat === next.points.start?.lat &&
      prev.points.end?.lat === next.points.end?.lat
    );
  }
);

/**
 * --- INTERNAL MAP CONTROLLER ---
 * Handles Camera movement and Event listeners
 */
function MapController({
  isActive,
  onMapClick,
  points,
  isLocked,
  currentPos,
}: any) {
  const map = useMap();

  // Fix Leaflet resize issues
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);

  useMapEvents({
    click: (e) => {
      if (!isActive && onMapClick) onMapClick(e);
    },
  });

  useEffect(() => {
    // --- 1. TACTICAL FOLLOW (Movement Mode) ---
    // Use setView for movement to avoid the "bounce" of flyTo during rapid updates
    if (isActive && isLocked && currentPos) {
      map.setView(currentPos, 18, {
        animate: true,
        duration: 0.5, // Fast enough to keep up with movement
      });
      return;
    }

    // --- 2. OBJECTIVE REACHED (Pause/Popup Mode) ---
    // If we just stopped at a tent (not the start point)
    if (
      !isActive &&
      currentPos &&
      points.start &&
      !currentPos.equals(points.start)
    ) {
      map.flyTo(currentPos, 17, {
        duration: 0.8, // Smooth cinematic arrival
        easeLinearity: 0.25,
      });
      return;
    }

    // --- 3. PLANNING MODE (Route Overview) ---
    // Triggered when no mission is active and points are set
    if (!isActive && points.start && points.end) {
      const bounds = L.latLngBounds([points.start, points.end]);
      map.flyToBounds(bounds, {
        padding: [80, 80],
        duration: 1.2, // Grand overview transition
        easeLinearity: 0.25,
      });
    }
  }, [isActive, isLocked, points, map, currentPos]);

  return null;
}
