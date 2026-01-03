import React, { useState, useMemo, useRef, useEffect } from "react";
import L from "leaflet";
import { useMapEvents } from "react-leaflet";
import { TentMarker } from "./TentMarker";

export interface TentlayerPorps {
  tentPositionArray: {
    id: string;
    latlng: L.LatLng;
    distanceMark: number;
  }[];
  currentPos: L.LatLng | null;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
}

export const TentLayer = ({
  tentPositionArray,
  currentPos,
  isActive,
  setIsActive,
}: TentlayerPorps) => {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const activeMarkerRef = useRef<L.Marker | null>(null);

  // 1. Initialize Map Events
  const map = useMapEvents({
    moveend: () => setBounds(map.getBounds()),
    zoomend: () => setBounds(map.getBounds()),
  });

  // 2. FIX: Capture initial bounds on mount
  useEffect(() => {
    if (map) setBounds(map.getBounds());
  }, [map]);

  // 3. Centralized Popup Logic
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

  // 4. Optimized Viewport Filtering
  const visibleTents = useMemo(() => {
    if (!tentPositionArray?.length || !bounds) return [];

    // Filter indices in bounds first (more memory efficient than mapping everything)
    const inBoundsIndices: number[] = [];
    for (let i = 0; i < tentPositionArray.length; i++) {
      if (bounds.contains(tentPositionArray[i].latlng)) {
        inBoundsIndices.push(i);
      }
    }

    const totalInView = inBoundsIndices.length;
    const maxVisible = 5;

    if (totalInView === 0) return [];

    // If few tents, show them all
    if (totalInView <= maxVisible) {
      return inBoundsIndices.map((idx) => ({
        ...tentPositionArray[idx],
        originalIdx: idx,
      }));
    }

    // Interpolate to pick 5 spread-out tents across the visible segment
    const result = [];
    for (let i = 0; i < maxVisible; i++) {
      const lookupIdx = Math.floor((i / (maxVisible - 1)) * (totalInView - 1));
      const actualIdx = inBoundsIndices[lookupIdx];
      result.push({ ...tentPositionArray[actualIdx], originalIdx: actualIdx });
    }
    return result;
  }, [tentPositionArray, bounds]);

  return (
    <>
      {visibleTents.map((tent) => (
        <TentMarker
          key={tent.id}
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
