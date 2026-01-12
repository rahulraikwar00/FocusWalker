import React, { useState, useMemo, useRef, useEffect } from "react";
import L from "leaflet";
import { useMapEvents } from "react-leaflet";
import { TentMarker } from "./TentMarker";
import { MissionTent } from "@/components/shared/MapContainer";
import { useGlobal } from "../mission/contexts/GlobalContext";
import { useRouteLogic } from "../mission/useRouteLogic";
import { useMissionContext } from "../mission/contexts/MissionContext";

export interface TentData {
  id: string;
  latlng: [number, number]; // Our standardized tuple
  originalIdx: number;
  distanceMark?: number;
}

export const TentLayer = () => {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const activeMarkerRef = useRef<L.Marker | null>(null);

  const {} = useGlobal();
  const { checkPoints } = useMissionContext().missionStates;
  const {} = useRouteLogic();

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
  }, [map, checkPoints]);

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

  // const visibleTents = useMemo<TentData>(() => {
  //   // 1. Safety Guard: Check if array exists
  //   if (
  //     !checkPoints ||
  //     !Array.isArray(checkPoints) ||
  //     checkPoints.length === 0
  //   ) {
  //     return [];
  //   }

  //   // 2. Safety Guard: If map isn't ready, show a small preview slice (prevents blank map)
  //   if (!bounds || !bounds.isValid()) {
  //     return checkPoints.slice(0, 5).map((t, i) => ({ ...t, originalIdx: i }));
  //   }

  //   const inBoundsIndices: number[] = [];

  //   for (let i = 0; i < checkPoints.length; i++) {
  //     const rawCoords = checkPoints[i];
  //     if (rawCoords && Array.isArray(rawCoords) && rawCoords.length >= 2) {
  //       try {
  //         const latLngPoint = L.latLng(rawCoords[0], rawCoords[1]);
  //         if (bounds.contains(latLngPoint)) {
  //           inBoundsIndices.push(i);
  //         }
  //       } catch (e) {
  //         console.error("Invalid coordinate at index " + i, e);
  //         continue;
  //       }
  //     }
  //   }

  //   const totalInView = inBoundsIndices.length;
  //   if (totalInView === 0) return [];

  //   const maxVisible = 5;

  //   const selectedTents: TentData[] = []; // Explicitly type the array

  //   if (totalInView <= maxVisible) {
  //     for (const idx of inBoundsIndices) {
  //       selectedTents.push({ ...checkPoints[idx], originalIdx: idx });
  //     }
  //   } else {
  //     // 4. Strategic Sampling: Prevents UI lag with thousands of points
  //     for (let i = 0; i < maxVisible; i++) {
  //       const divisor = maxVisible > 1 ? maxVisible - 1 : 1;
  //       const lookupIdx = Math.floor((i / divisor) * (totalInView - 1));
  //       const actualIdx = inBoundsIndices[lookupIdx];

  //       if (checkPoints[actualIdx]) {
  //         selectedTents.push({
  //           ...checkPoints[actualIdx],
  //           originalIdx: actualIdx,
  //         });
  //       }
  //     }
  //   }
  //   return selectedTents;
  // }, [checkPoints, bounds]);

  // Ensure this interface matches your standard

  const visibleTents = useMemo<TentData[]>(() => {
    // 1. Safety Guard
    if (
      !checkPoints ||
      !Array.isArray(checkPoints) ||
      checkPoints.length === 0
    ) {
      return [];
    }

    // 2. Map Not Ready Guard: Convert raw coordinates to TentData objects
    if (!bounds || !bounds.isValid()) {
      return checkPoints.slice(0, 5).map((coords, i) => ({
        id: `tent-preview-${i}`,
        latlng: coords as [number, number],
        originalIdx: i,
      }));
    }

    // 3. Find indices currently in view
    const inBoundsIndices: number[] = [];
    for (let i = 0; i < checkPoints.length; i++) {
      const coords = checkPoints[i];
      if (coords) {
        const latLngPoint = L.latLng(coords[0], coords[1]);
        if (bounds.contains(latLngPoint)) {
          inBoundsIndices.push(i);
        }
      }
    }

    const totalInView = inBoundsIndices.length;
    if (totalInView === 0) return [];

    const maxVisible = 5;
    const selectedTents: TentData[] = [];

    // 4. Create the final TentData objects
    if (totalInView <= maxVisible) {
      for (const idx of inBoundsIndices) {
        selectedTents.push({
          id: `tent-${idx}`,
          latlng: checkPoints[idx] as [number, number], // Assign, don't spread!
          originalIdx: idx,
        });
      }
    } else {
      // Strategic Sampling
      for (let i = 0; i < maxVisible; i++) {
        const divisor = maxVisible > 1 ? maxVisible - 1 : 1;
        const lookupIdx = Math.floor((i / divisor) * (totalInView - 1));
        const actualIdx = inBoundsIndices[lookupIdx];

        selectedTents.push({
          id: `tent-${actualIdx}`,
          latlng: checkPoints[actualIdx] as [number, number],
          originalIdx: actualIdx,
        });
      }
    }

    return selectedTents;
  }, [checkPoints, bounds]);
  return (
    <>
      {visibleTents.map((tent) => (
        <TentMarker
          key={`tent-${tent.originalIdx}`}
          tent={tent}
          index={tent.originalIdx}
          OpenPopup={openPopup}
          ClosePopup={closePopup}
        />
      ))}
    </>
  );
};
