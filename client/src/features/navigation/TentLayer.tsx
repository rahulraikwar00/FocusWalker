import React, { useState, useMemo, useRef, useEffect } from "react";
import L from "leaflet";
import { useMapEvents } from "react-leaflet";
import { TentMarker } from "./TentMarker";
import { MissionTent } from "@/components/shared/MapContainer";

export const TentLayer = ({
  tentPositionArray,
  currentPos,
  isActive,
  setIsActive,
  points,
}: any) => {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const activeMarkerRef = useRef<L.Marker | null>(null);

  const map = useMapEvents({
    moveend: () => setBounds(map.getBounds()),
    zoomend: () => setBounds(map.getBounds()),
  });

  // Ensure bounds are captured as soon as the map or route loads
  useEffect(() => {
    if (map) {
      const b = map.getBounds();
      if (b.isValid()) setBounds(b);
    }
  }, [map, tentPositionArray]);

  const openPopup = React.useCallback((tentId: string, marker: L.Marker) => {
    if (activeMarkerRef.current && activeMarkerRef.current !== marker) {
      activeMarkerRef.current.closePopup();
    }
    activeMarkerRef.current = marker;
    marker.openPopup();
  }, []);

  const closePopup = React.useCallback(() => {
    if (activeMarkerRef.current) {
      activeMarkerRef.current.closePopup();
      activeMarkerRef.current = null;
    }
  }, []);

  const visibleTents = useMemo(() => {
    // 1. Safety Guard: Check if array exists
    if (
      !tentPositionArray ||
      !Array.isArray(tentPositionArray) ||
      tentPositionArray.length === 0
    ) {
      return [];
    }

    // 2. Safety Guard: If map isn't ready, show a small preview slice (prevents blank map)
    if (!bounds || !bounds.isValid()) {
      return tentPositionArray
        .slice(0, 5)
        .map((t, i) => ({ ...t, originalIdx: i }));
    }

    const inBoundsIndices: number[] = [];

    for (let i = 0; i < tentPositionArray.length; i++) {
      const tent = tentPositionArray[i];

      // 3. THE "LAT" ERROR FIX:
      // Ensure the point is valid before calling Leaflet methods
      if (tent && tent.latlng) {
        try {
          const point = tent.latlng;
          if (bounds.contains(point)) {
            inBoundsIndices.push(i);
          }
        } catch (e) {
          continue; // Skip malformed points instead of crashing
        }
      }
    }

    const totalInView = inBoundsIndices.length;
    if (totalInView === 0) return [];

    const maxVisible = 5;
    const selectedTents = [];

    if (totalInView <= maxVisible) {
      for (const idx of inBoundsIndices) {
        selectedTents.push({ ...tentPositionArray[idx], originalIdx: idx });
      }
    } else {
      // 4. Strategic Sampling: Prevents UI lag with thousands of points
      for (let i = 0; i < maxVisible; i++) {
        const divisor = maxVisible > 1 ? maxVisible - 1 : 1;
        const lookupIdx = Math.floor((i / divisor) * (totalInView - 1));
        const actualIdx = inBoundsIndices[lookupIdx];

        if (tentPositionArray[actualIdx]) {
          selectedTents.push({
            ...tentPositionArray[actualIdx],
            originalIdx: actualIdx,
          });
        }
      }
    }
    return selectedTents;
  }, [tentPositionArray, bounds]);

  return (
    <>
      {visibleTents.map((tent) => (
        <TentMarker
          points={points}
          key={`tent-${tent.id}-${tent.originalIdx}`}
          tent={tent}
          index={tent.originalIdx}
          currentPos={currentPos}
          isActive={isActive}
          setIsActive={setIsActive}
          OpenPopup={openPopup}
          ClosePopup={closePopup}
        />
      ))}
    </>
  );
};
