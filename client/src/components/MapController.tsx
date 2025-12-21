import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

interface MapControllerProps {
  currentPos: { lat: number; lng: number } | null;
  isActive: boolean;
  onMapClick: (e: L.LeafletMouseEvent) => void;
  isLocked: boolean;
}

export default function MapController({
  currentPos,
  isActive,
  onMapClick,
  isLocked,
}: MapControllerProps) {
  const map = useMap();

  // 1. Smooth Camera Follow Logic
  useEffect(() => {
    if (currentPos && isActive) {
      // panTo provides a smooth cinematic slide to the new coordinate
      map.panTo([currentPos.lat, currentPos.lng], {
        animate: true,
        duration: 0.5, // Seconds
        easeLinearity: 0.25,
      });
    }
  }, [currentPos, isActive, map]);

  // 2. Map Event Listeners
  useMapEvents({
    click: (e) => {
      // Prevent placing new pins while the timer is running or route exists
      if (!isLocked) {
        onMapClick(e);
      }
    },
  });

  // This component doesn't render anything visual
  return null;
}
