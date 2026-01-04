import React, { useRef, useState } from "react";
import { CameraUtils } from "@/lib/utils";

interface Props {
  onPhotoTaken: (base64: string) => void;
}

export const CameraCapture = ({ onPhotoTaken }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleStart = async () => {
    if (videoRef.current) {
      const s = await CameraUtils.startCamera(videoRef.current);
      setStream(s);
      setIsPreviewing(true);
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
        <button onClick={handleStart} className="btn-secondary text-[10px]">
          Open Camera
        </button>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-tactical/30">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-40 object-cover"
          />
          <button
            onClick={handleCapture}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-tactical text-black p-2 rounded-full font-bold text-[10px]"
          >
            CAPTURE
          </button>
        </div>
      )}
    </div>
  );
};
