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

    return (
      tentPositionArray
        // 1. Attach the original index BEFORE filtering
        .map((tent, originalIdx) => ({
          ...tent,
          originalIdx,
        }))
        // 2. Filter by Viewport (Check if latlng exists to avoid NaN)
        .filter((tent) => {
          if (!tent.latlng) return false;
          try {
            return bounds.contains(L.latLng(tent.latlng));
          } catch (e) {
            return false;
          }
        })
        // 3. Filter by Density
        .filter((_, i) => {
          if (zoom > 15) return true;
          if (zoom >= 13) return i % 2 === 0;
          return i % 5 === 0;
        })
    );
  }, [tentPositionArray, bounds, zoom]);

  const closePopup = (id: string) => markerRefs.current[id]?.closePopup();

  const openpopup = (id: string) => markerRefs.current[id]?.openPopup();

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
