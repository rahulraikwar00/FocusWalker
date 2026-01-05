import React, { useRef, useState } from "react";
import { CameraUtils } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CameraProp {
  onPhotoTaken: (base64: string) => void;
}

export const CameraCapture = ({ onPhotoTaken }: CameraProp) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Forces back camera on mobile
        audio: false,
      });
      if (videoRef.current) {
        console.log("Accessing camera...");
        const s = await CameraUtils.startCamera(videoRef.current);
        setStream(s);
        setIsPreviewing(true);
      }
      // Stream successful: User granted permission
      return stream;
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        alert("Camera access was denied. Please enable camera permissions.");
      }
      console.error("Camera error:", err);
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const base64 = CameraUtils.takePhoto(videoRef.current);
      onPhotoTaken(base64);
      handleStop();
    }
  };

  const handleStop = () => {
    CameraUtils.stopCamera(stream);
    setStream(null);
    setIsPreviewing(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {!isPreviewing ? (
        <Button onClick={handleStart} className="btn-secondary text-[10px]">
          START CAMERA
        </Button>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-tactical/30">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-40 object-cover"
          />
          <Button
            onClick={handleCapture}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-tactical text-black p-2 rounded-full font-bold text-[10px]"
          >
            CAPTURE
          </Button>
        </div>
      )}
    </div>
  );
};
