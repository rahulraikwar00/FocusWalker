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

interface MapProps {
  DEFAULT_LOCATION: L.LatLngExpression;
  handleMapClick: (e: L.LeafletMouseEvent) => void;
  currentPos: L.LatLng | null;
  isActive: boolean;
  points: { start: L.LatLng | null; end: L.LatLng | null };
  route: { path: L.LatLngExpression[] } | null;
  isLocked: boolean;
  isDark: boolean;
  tentPositionArray: any;
  removePoint: (type: "start" | "end") => void;
  isLoadingRoute: boolean;
}

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

const tacticalIcon = L.divIcon({
  className: "custom-marker",
  html: MARKER_HTML,
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
  }: MapProps) => {
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
            isLoadingRoute={isLoadingRoute}
          />

          {/* Start Marker */}
          {points.start && (
            <Marker
              position={points.start}
              icon={tacticalIcon}
              eventHandlers={{
                click: (e) => {
                  // L.DomEvent.stopPropagation(e); // STOP BUBBLING
                  removePoint("start");
                },
              }}
            />
          )}

          {/* End Marker */}
          {points.end && (
            <Marker
              position={points.end}
              icon={tacticalIcon}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e); // STOP BUBBLING
                  removePoint("end");
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
    // Optimization: Only re-render if critical visual props change
    return (
      prev.isDark === next.isDark &&
      prev.isActive === next.isActive &&
      prev.isLocked === next.isLocked &&
      prev.currentPos?.lat === next.currentPos?.lat &&
      prev.currentPos?.lng === next.currentPos?.lng &&
      prev.route?.path === next.route?.path &&
      prev.points === next.points
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
  isLoadingRoute,
}: any) {
  const map = useMap();

  // Fix Leaflet resize issues on load
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  // Click handler: Only allow adding points when NOT in mission
  useMapEvents({
    click: (e) => {
      if (!isActive && onMapClick) onMapClick(e);
    },
  });

  // Camera Logic: Auto-Follow User (Locked Mode)
  useEffect(() => {
    if (isLocked && currentPos && isActive) {
      map.setView(currentPos, 17, { animate: true, duration: 1 });
    }
  }, [currentPos, isLocked, isActive, map]);

  // Camera Logic: Fit View (Standby Mode)
  useEffect(() => {
    if (!isActive && points?.start && points?.end) {
      const bounds = L.latLngBounds([points.start, points.end]);
      map.fitBounds(bounds, { padding: [100, 100], animate: true });
    } else if (!isActive && points?.start) {
      map.flyTo(points.start, 15, { duration: 0.8 });
    }
  }, [isActive, points, map]);

  return null;
}
