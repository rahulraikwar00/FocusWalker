import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Play, Pause, RotateCcw, MapPin, Navigation, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import confetti from "canvas-confetti";

// Fix Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Types
type LatLng = { lat: number; lng: number };

// Helper to calculate distance between two points (Haversine formula) in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Map Click Handler Component
function MapEvents({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

export default function MapTimer() {
  const [startPos, setStartPos] = useState<LatLng | null>(null);
  const [endPos, setEndPos] = useState<LatLng | null>(null);
  const [currentPos, setCurrentPos] = useState<LatLng | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [duration, setDuration] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  // HUD State
  const [isSettingStart, setIsSettingStart] = useState(true); // Toggle between setting start or end

  // Animation Frame
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Handle Map Clicks
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (isActive) return; // Don't change points while running

    if (isSettingStart) {
      setStartPos(e.latlng);
      setCurrentPos(e.latlng); // Reset current pos to start
      setIsSettingStart(false); // Auto-switch to setting destination
    } else {
      setEndPos(e.latlng);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 }
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  // Movement Logic
  useEffect(() => {
    if (isActive && startPos && endPos && timeLeft > 0) {
      const totalDuration = duration;
      const elapsedTime = totalDuration - timeLeft;
      const progress = elapsedTime / totalDuration; // 0 to 1

      // Linear Interpolation (Lerp)
      const lat = startPos.lat + (endPos.lat - startPos.lat) * progress;
      const lng = startPos.lng + (endPos.lng - startPos.lng) * progress;
      
      setCurrentPos({ lat, lng });
    } else if (timeLeft === 0 && endPos) {
      setCurrentPos(endPos); // Ensure we land exactly on end
    }
  }, [timeLeft, isActive, startPos, endPos, duration]);

  const toggleTimer = () => {
    if (!startPos || !endPos) return;
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
    if (startPos) setCurrentPos(startPos);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate Distance Text
  const distanceText = startPos && endPos 
    ? `${getDistanceFromLatLonInKm(startPos.lat, startPos.lng, endPos.lat, endPos.lng).toFixed(2)} km` 
    : "0 km";

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[51.505, -0.09]} 
          zoom={13} 
          scrollWheelZoom={true} 
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onMapClick={handleMapClick} />
          
          {startPos && (
            <Marker position={startPos} icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}>
              <Popup>Start Point</Popup>
            </Marker>
          )}

          {endPos && (
            <Marker position={endPos} icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}>
              <Popup>Destination</Popup>
            </Marker>
          )}

          {/* Path Line */}
          {startPos && endPos && (
            <Polyline 
              positions={[startPos, endPos]} 
              color="blue" 
              dashArray="10, 10" 
              weight={3} 
              opacity={0.5} 
            />
          )}

          {/* The Walking Dot */}
          {currentPos && (
            <CircleMarker 
              center={currentPos} 
              radius={8} 
              pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }} 
            >
              <Popup>You are here</Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      {/* HUD Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md">
        <Card className="p-4 bg-background/90 backdrop-blur-md shadow-2xl border-2 border-primary/20">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              MAP TIMER
            </h1>

            <div className="text-5xl font-mono font-bold tracking-widest text-foreground tabular-nums">
              {formatTime(timeLeft)}
            </div>

            {/* Instructions / Status */}
            {!isActive && (
              <div className="text-sm text-muted-foreground text-center bg-muted/50 p-2 rounded w-full">
                {!startPos ? (
                  <span className="text-green-600 font-bold animate-pulse">Tap map to set START point</span>
                ) : !endPos ? (
                  <span className="text-red-500 font-bold animate-pulse">Tap map to set DESTINATION</span>
                ) : (
                  <span>Ready to go! Trip distance: {distanceText}</span>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3 w-full justify-center">
               <Button 
                size="lg"
                className={`w-16 h-16 rounded-full shadow-lg transition-all ${!startPos || !endPos ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                disabled={!startPos || !endPos}
                onClick={toggleTimer}
              >
                {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </Button>

              <Button 
                variant="outline" 
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={resetTimer}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="w-12 h-12 rounded-full">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Timer Settings</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-6">
                    <div className="space-y-4">
                      <Label>Duration (Minutes)</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[duration / 60]} 
                          min={1} 
                          max={120} 
                          step={1}
                          onValueChange={(vals) => {
                            const newDuration = vals[0] * 60;
                            setDuration(newDuration);
                            if (!isActive) setTimeLeft(newDuration);
                          }}
                        />
                        <span className="font-mono text-xl w-12">{duration / 60}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                       <Label>Map Controls</Label>
                       <div className="flex gap-2">
                         <Button 
                           variant={isSettingStart ? "default" : "outline"}
                           size="sm"
                           onClick={() => setIsSettingStart(true)}
                           className="flex-1"
                         >
                           <MapPin className="w-4 h-4 mr-2 text-green-500" />
                           Set Start
                         </Button>
                         <Button 
                           variant={!isSettingStart ? "default" : "outline"}
                           size="sm"
                           onClick={() => setIsSettingStart(false)}
                           className="flex-1"
                         >
                           <MapPin className="w-4 h-4 mr-2 text-red-500" />
                           Set End
                         </Button>
                       </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      </div>

      {/* Legend / Info (Bottom) */}
      <div className="absolute bottom-6 left-6 z-10 hidden md:block">
         <Card className="p-3 bg-white/80 backdrop-blur text-xs space-y-1">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-green-500"></div>
             <span>Start Point</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500"></div>
             <span>Destination</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>
             <span>You (Timer)</span>
           </div>
         </Card>
      </div>
    </div>
  );
}
