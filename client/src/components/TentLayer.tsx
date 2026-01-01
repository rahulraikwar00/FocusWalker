import React, { useState, useMemo, useRef, useEffect } from "react";
import L from "leaflet";
import { useMapEvents } from "react-leaflet";
import { TentMarker } from "./TentMarker";

export const TentLayer = ({
  tentPositionArray,
  currentPos,
}: {
  tentPositionArray: any[];
  currentPos: any;
}) => {
  const [zoom, setZoom] = useState(13);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});

  // Logic: Map interaction handler
  const map = useMapEvents({
    moveend: () => {
      setBounds(map.getBounds());
      setZoom(map.getZoom());
    },
    zoomend: () => setZoom(map.getZoom()),
  });

  // Logic: Viewport & Zoom filtering
  const visibleTents = useMemo(() => {
    if (!tentPositionArray || !bounds) return [];

    // 1. Get all tents currently in the viewport first
    const inBounds = tentPositionArray
      .map((tent, originalIdx) => ({ ...tent, originalIdx }))
      .filter((tent) => {
        if (!tent.latlng) return false;
        try {
          return bounds.contains(L.latLng(tent.latlng));
        } catch (e) {
          return false;
        }
      });

    // 2. Logic: If we have more than 7, calculate a "Step" to pick them evenly
    const totalInView = inBounds.length;
    const maxVisible = 5;

    if (totalInView <= maxVisible) {
      return inBounds;
    }

    // Calculate the step (e.g., if 70 tents are in view, pick every 10th one)
    const step = Math.floor(totalInView / maxVisible);

    return inBounds.filter((_, i) => i % step === 0).slice(0, maxVisible); // Ensure hard cap of 7
  }, [tentPositionArray, bounds]); // Zoom is no longer needed as the logic is purely density-based

  const closePopup = (id: string) => markerRefs.current[id]?.closePopup();

  return (
    <>
      {visibleTents.map((tent, index) => (
        <TentMarker
          key={tent.id}
          tent={tent}
          index={tent.originalIdx}
          markerRef={(el: any) => (markerRefs.current[tent.id] = el)}
          onSecure={closePopup}
        />
      ))}
    </>
  );
};
