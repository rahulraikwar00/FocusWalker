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
import { memo, useEffect } from "react";

interface MapProps {
  DEFAULT_LOCATION: L.LatLngExpression;
  handleMapClick: (e: L.LeafletMouseEvent) => void;
  currentPos: L.LatLng | null;
  isActive: boolean;
  points: { start: L.LatLng | null; end: L.LatLng | null };
  route: { path: L.LatLngExpression[] } | null;
  isLocked: boolean;
  isDark: boolean;
}

const MARKER_HTML = `
  <div class="relative flex items-center justify-center">
    <div class="absolute w-8 h-8 bg-(--accent-glow) rounded-full animate-ping opacity-20"></div>
    <div class="w-4 h-4 bg-(--accent-primary) rounded-full border-2 border-(--bg-page) shadow-[0_0_15px_var(--accent-glow)]"></div>
  </div>
`;

// 2. Create a static icon instance (or useMemo inside)
const tacticalIcon = L.divIcon({
  className: "custom-marker",
  html: MARKER_HTML,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// 1. Rename to avoid conflict with library MapContainer
// 2. Add 'return' statement
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
  }: MapProps) => {
    return (
      <MapContainer
        center={DEFAULT_LOCATION}
        zoom={5}
        className="w-full h-full z-0 " // Uses theme background
        zoomControl={false}
        minZoom={5}
      >
        <TileLayer
          key={isDark ? "stadia-dark" : "stadia-light"}
          url={
            isDark
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
          keepBuffer={12}
          updateWhenIdle={false}
          className="map-tiles"
        />

        <MapController
          onMapClick={handleMapClick}
          isActive={isActive}
          points={points}
          isLocked={isLocked}
          currentPos={currentPos}
        />

        {route?.path && (
          <Polyline
            positions={route.path}
            // Uses standard CSS variable for the route line
            pathOptions={{
              color: isDark ? "#BFFF04" : "#86B300", // Fallback colors for JS-only components
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}

        {currentPos && <Marker position={currentPos} icon={tacticalIcon} />}
      </MapContainer>
    );
  },

  (prev, next) => {
    // Return TRUE if they are equal (Don't re-render)
    // Return FALSE if they are different (Do re-render)
    return (
      prev.isDark === next.isDark &&
      prev.isActive === next.isActive &&
      prev.isLocked === next.isLocked &&
      prev.currentPos?.lat === next.currentPos?.lat &&
      prev.currentPos?.lng === next.currentPos?.lng &&
      prev.route?.path?.length === next.route?.path?.length &&
      prev.points?.start?.lat === next.points?.start?.lat &&
      prev.points?.end?.lat === next.points?.end?.lat
    );
  }
);

function MapController({
  pos,
  isActive,
  onMapClick,
  points,
  isLocked,
  currentPos,
}: any) {
  const map = useMap();
  const { position, error } = useUserLocation();

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      if (map) map.invalidateSize();
    });
    return () => cancelAnimationFrame(handle);
  }, [map]);

  useMapEvents({
    click: (e) => {
      if (!isActive && onMapClick) onMapClick(e);
    },
  });

  useEffect(() => {
    if (!map || !position) return;

    console.log("user locaiton is get");
    map.flyTo(position, 16, {
      animate: true,
      duration: 1.5, // Seconds
      easeLinearity: 0.25,
    });
  }, [position, map]);

  useEffect(() => {
    if (!isActive && points?.start && map) {
      try {
        map.flyTo(points.start, 15, { animate: true, duration: 0.8 });
      } catch (e) {
        console.error("Map flyTo error:", e);
      }
    }
  }, [isActive, points?.start, map]);
  // Handle Auto-Recenter (Tracking Mode)
  useEffect(() => {
    if (isLocked && currentPos && isActive) {
      map.setView(currentPos, 18, { animate: true, duration: 0.5 });
    }
  }, [currentPos, isLocked, isActive, map]);

  // Handle Fit-Bounds (Standby Mode: See both dots)
  useEffect(() => {
    if (!isActive && points.start && points.end) {
      const bounds = L.latLngBounds([points.start, points.end]);
      map.fitBounds(bounds, { padding: [70, 70], animate: true });
    } else if (!isActive && points.start && !points.end) {
      map.flyTo(points.start, 15);
    }
  }, [isActive, points, map]);

  return null;
}
