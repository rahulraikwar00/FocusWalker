import * as React from "react";
import L, { point } from "leaflet";
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
import {
  MissionContextProvider,
  useMissionContext,
} from "@/features/mission/contexts/MissionContext";
import { useRouteLogic } from "@/features/mission/useRouteLogic";
import { useGlobal } from "@/features/mission/contexts/GlobalContext";

export interface MissionTent {
  id: string;
  latlng: L.LatLng;
  distanceMark: number;
  originalIdx: number;
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

export const MapView = memo(({}: any) => {
  const DEFAULT_LOCATION = new L.LatLng(20.5937, 78.9629);
  const { missionStates, setMissionStates } = useMissionContext();
  const { settings } = useGlobal();
  const { handleMapClick, isActive, isLocked, isLoadingRoute, removePoint } =
    useRouteLogic();

  const tileUrl = useMemo(
    () =>
      settings.isDark
        ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=b3cff5aa-9649-46f1-84b2-1d3de0a1aa01"
        : "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=b3cff5aa-9649-46f1-84b2-1d3de0a1aa01",
    [settings.isDark]
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
          key={settings.isDark ? "dark" : "light"} // Key change forces re-render when theme flips
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          keepBuffer={8}
        />

        {/* Logic Controller Component */}
        <MapController onMapClick={handleMapClick} />

        {/* Start Marker */}
        {missionStates.position.start && !isActive && (
          <Marker
            position={missionStates.position.start}
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
        {missionStates.position.end && (
          <Marker
            position={missionStates.position.end}
            icon={endtacticalIcon}
            eventHandlers={{
              click: (e) => {
                // L.DomEvent.stopPropagation(e); // STOP BUBBLING
                removePoint("end", isActive);
              },
            }}
          />
        )}
        {missionStates.route?.path && (
          <Polyline
            key={missionStates.route.path.length} // Force re-draw if length changes
            positions={missionStates.route.path}
            pathOptions={{
              color: settings.isDark ? "#BFFF04" : "#86B300",
              weight: 4,
              opacity: 0.8,
              dashArray: isActive ? "1, 10" : "none",
              pane: "markerPane",
            }}
          />
        )}

        {/* POIs & Current Position */}
        {missionStates.checkPoints && <TentLayer />}
        {missionStates.position.current && (
          <Marker
            position={missionStates.position.current}
            icon={tacticalIcon}
            zIndexOffset={1000}
          />
        )}
      </MapContainer>
    </div>
  );
});

/**
 * --- INTERNAL MAP CONTROLLER ---
 * Handles Camera movement and Event listeners
 */
function MapController({ onMapClick }: any) {
  const map = useMap();

  const { isLocked } = useGlobal();
  const { missionStates } = useMissionContext();
  const isActive = missionStates.missionStatus === "active";

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
    if (isActive && isLocked && missionStates.position.current) {
      map.setView(missionStates.position.current, 18, {
        animate: true,
        duration: 0.5,
      });
      return;
    }
    // --- 2. OBJECTIVE REACHED (Pause/Popup Mode) ---
    // If we just stopped at a tent (not the start point)
    if (
      !isActive &&
      missionStates.position.current &&
      missionStates.position.start &&
      // Convert both to Leaflet objects to use .equals()
      !L.latLng(missionStates.position.current).equals(
        L.latLng(missionStates.position.start)
      )
    ) {
      map.flyTo(missionStates.position.current, 17, {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }

    // --- 3. PLANNING MODE (Route Overview) ---
    // Triggered when no mission is active and points are set
    if (
      !isActive &&
      missionStates.position.start &&
      missionStates.position.end
    ) {
      const bounds = L.latLngBounds([
        missionStates.position.start,
        missionStates.position.end,
      ]);
      map.flyToBounds(bounds, {
        padding: [80, 80],
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [isActive, isLocked, map, missionStates.position, missionStates.route]);

  return null;
}
