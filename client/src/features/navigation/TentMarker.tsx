import React, { useEffect, useRef, useState } from "react";
import { Popup, Marker } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import { GiCampingTent } from "react-icons/gi";
import { PopUpcard } from "./PopupCard";
import { useMissionContext } from "../mission/contexts/MissionContext";
import { useRouteLogic } from "../mission/useRouteLogic";

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

  OpenPopup: (tentId: string, marker: L.Marker) => void;
  ClosePopup: () => void;
  points: any;
}

// export const TentMarker = ({
//   tent,
//   index,
//   OpenPopup,
//   ClosePopup,
// }: TentMarkerProps) => {
//   const markerRef = useRef<L.Marker>(null);
//   // Inside your TentMarker component
//   const hasTriggered = useRef(false);

//   const { missionStates, setMissionStates } = useMissionContext();
//   const position = missionStates.position;
//   const isActive = missionStates.missionStatus === "active";
//   const [locality, setLocality] = useState<string>("earth");

//   useEffect(() => {
//     if (!position.current || !tent.latlng || !isActive) return;

//     try {
//       // Standardize both points to Leaflet LatLng objects
//       const p1 = L.latLng(position.current);
//       const p2 = L.latLng(tent.latlng);

//       // Safety check for valid coordinates
//       if (!p1 || !p2) return;

//       const distance = p1.distanceTo(p2);

//       if (distance < 8 && !hasTriggered.current && markerRef.current) {
//         hasTriggered.current = true;
//         setMissionStates({
//           ...missionStates,
//           missionStatus: "paused",
//         });
//         OpenPopup(tent.id, markerRef.current);
//       }
//     } catch (err) {
//       console.error("Coordinate calculation failed", err);
//     }
//   }, [position.current, isActive, tent.latlng, OpenPopup, tent.id]);

//   async function getLocality(lat: number, lng: number): Promise<string> {
//     try {
//       const response = await fetch(
//         `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
//       );
//       const data = await response.json();
//       // Logic: Neighborhood -> Village/Town -> City
//       return data.locality || data.village || data.city || "Wilderness";
//     } catch (error) {
//       return "Unknown Territory";
//     }
//   }

//   useEffect(() => {
//     const handleLocality = async () => {
//       // Small safety check
//       if (!tent.latlng) return;

//       const name = await getLocality(tent.latlng.lat, tent.latlng.lng);
//       setLocality(name);
//     };

//     handleLocality();
//   }, [tent.latlng.lat, tent.latlng.lng]);

//   return (
//     <Marker
//       position={tent.latlng}
//       icon={index % 2 === 0 ? TENT_LEFT : TENT_RIGHT}
//       ref={markerRef}
//       eventHandlers={{
//         click: (e) => OpenPopup(tent.id, e.target),
//       }}
//     >
//       <Popup
//         minWidth={160}
//         maxWidth={160}
//         autoPan={false}
//         keepInView={false}
//         closeButton={false}
//       >
//         <PopUpcard
//           index={tent.originalIdx}
//           handleMarkerClick={ClosePopup}
//           tent={tent}
//           locality={locality}
//         />
//       </Popup>
//     </Marker>
//   );
// };

export const TentMarker = ({ tent, index, OpenPopup, ClosePopup }: any) => {
  const markerRef = useRef<L.Marker>(null);
  const hasTriggered = useRef(false);
  const { missionStates, setMissionStates } = useMissionContext();
  const { getLocalityName } = useRouteLogic();
  const [locality, setLocality] = useState<string>("Loading...");

  const isActive = missionStates.missionStatus === "active";
  const currentPos = missionStates.position.current;

  // 1. Trigger Pause Logic
  useEffect(() => {
    if (!currentPos || !tent.latlng || !isActive || hasTriggered.current)
      return;

    const p1 = L.latLng(currentPos);
    const p2 = L.latLng(tent.latlng);
    const distance = p1.distanceTo(p2);

    // Increase threshold slightly for high-speed stability (e.g., 10-15m)
    if (distance < 10 && markerRef.current) {
      hasTriggered.current = true;

      // Use functional update to avoid stale state bugs
      setMissionStates((prev) => ({ ...prev, missionStatus: "paused" }));
      OpenPopup(tent.id, markerRef.current);
    }
  }, [currentPos, isActive, tent.latlng, tent.id, OpenPopup, setMissionStates]);

  // 2. Geocoding Logic (Run only once per marker)
  useEffect(() => {
    let isMounted = true;
    const fetchLocality = async () => {
      if (!tent.latlng) return;

      const name = await getLocalityName(tent[0], tent[1]);
      if (isMounted) setLocality(name);
    };

    fetchLocality();
    return () => {
      isMounted = false;
    };
  }, [tent.latlng]); // Only run if coordinate changes

  return (
    <Marker
      position={tent.latlng}
      icon={index % 2 === 0 ? TENT_LEFT : TENT_RIGHT}
      ref={markerRef}
      eventHandlers={{
        click: (e) => OpenPopup(tent.id, e.target as L.Marker),
      }}
    >
      <Popup autoPan={false} closeButton={false}>
        <PopUpcard
          index={index}
          handleMarkerClick={ClosePopup}
          tent={tent}
          locality={locality}
        />
      </Popup>
    </Marker>
  );
};
