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

interface MapProps {
  DELHI_DEFAULT: L.LatLngExpression;
  handleMapClick: (e: L.LeafletMouseEvent) => void;
  currentPos: L.LatLng | null;
  isActive: boolean;
  points: { start: L.LatLng | null; end: L.LatLng | null };
  route: { path: L.LatLngExpression[] } | null;
  isLocked: boolean;
}

// 1. Rename to avoid conflict with library MapContainer
// 2. Add 'return' statement
export const MapView = ({
  DELHI_DEFAULT,
  handleMapClick,
  currentPos,
  isActive,
  points,
  route,
  isLocked,
}: MapProps) => {
  return (
    <MapContainer
      center={DELHI_DEFAULT}
      zoom={13}
      className="w-full h-full z-0 bg-[#0A0A0A]"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; <a href='https://carto.com/'>CARTO</a>"
      />

      {/* Ensure MapController is imported or defined in your scope */}
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
          pathOptions={{ color: "#BFFF04", weight: 4 }}
        />
      )}

      {currentPos && (
        <Marker
          position={currentPos}
          icon={L.divIcon({
            className: "m",
            html: `<div class="w-4 h-4 bg-[#BFFF04] rounded-full border-2 border-black shadow-[0_0_10px_#BFFF04]"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        />
      )}
    </MapContainer>
  );
};

function MapController({
  pos,
  isActive,
  onMapClick,
  points,
  isLocked,
  currentPos,
}: any) {
  const map = useMap();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (map) map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useMapEvents({
    click: (e) => {
      if (!isActive && onMapClick) onMapClick(e);
    },
  });

  React.useEffect(() => {
    if (!isActive && points?.start && map) {
      try {
        map.flyTo(points.start, 15, { animate: true, duration: 0.8 });
      } catch (e) {
        console.error("Map flyTo error:", e);
      }
    }
  }, [isActive, points?.start, map]);
  // Handle Auto-Recenter (Tracking Mode)
  React.useEffect(() => {
    if (isLocked && currentPos && isActive) {
      map.setView(currentPos, 18, { animate: true, duration: 0.5 });
    }
  }, [currentPos, isLocked, isActive, map]);

  // Handle Fit-Bounds (Standby Mode: See both dots)
  React.useEffect(() => {
    if (!isActive && points.start && points.end) {
      const bounds = L.latLngBounds([points.start, points.end]);
      map.fitBounds(bounds, { padding: [70, 70], animate: true });
    } else if (!isActive && points.start && !points.end) {
      map.flyTo(points.start, 15);
    }
  }, [isActive, points, map]);

  return null;
}
