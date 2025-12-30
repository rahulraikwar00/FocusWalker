import { useState, useCallback } from "react";
import L from "leaflet";

export const useUserLocation = () => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition(new L.LatLng(latitude, longitude));
        setLoading(false);
        console.log(position);
      },
      (err) => {
        setLoading(false);
        // Human-friendly error messages
        if (err.code === 1) setError("Please enable location access");
        else if (err.code === 2) setError("Location signal lost");
        else setError("Could not find your location");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return { position, error, loading, getPosition };
};
