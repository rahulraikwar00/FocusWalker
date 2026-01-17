import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  // 1. Sync the video element with the stream whenever the stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;

      // PC/Chrome sometimes needs an explicit play call
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch((e) => console.error("Play error:", e));
      };
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log("Camera track stopped due to unmount");
        });
      }
    };
  }, [stream]);

  // 2. Initialize device list
  const initDevices = async () => {
    try {
      const initialStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === "videoinput");

      // Sort to find the "Main" camera
      const sorted = videoInputs.sort((a, b) => {
        const labelA = a.label.toLowerCase();
        const labelB = b.label.toLowerCase();
        if (
          labelA.includes("0") ||
          (labelA.includes("back") && !labelA.includes("wide"))
        )
          return -1;
        return 0;
      });

      setDevices(sorted);
      initialStream.getTracks().forEach((track) => track.stop()); // Stop the test stream
      return sorted;
    } catch (err) {
      console.error("Permission denied or no camera found", err);
      return [];
    }
  };

  const startCamera = async (
    index: number,
    availableDevices: MediaDeviceInfo[],
  ) => {
    // Clean up old stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    const device = availableDevices[index];
    const constraints = {
      video: {
        deviceId: device ? { exact: device.deviceId } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setIsOpen(true);
    } catch (err) {
      console.error("Error starting camera:", err);
    }
  };

  const openCamera = async () => {
    const available = await initDevices();
    if (available.length > 0) {
      await startCamera(0, available);
    }
  };

  const switchCamera = () => {
    const nextIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextIndex);
    startCamera(nextIndex, devices);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      onCapture(canvas.toDataURL("image/jpeg", 0.9));
      closeCamera();
    }
  };

  const closeCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setIsOpen(false);
  };

  return (
    <div className="w-full h-auto flex items-center justify-center ">
      {!isOpen ? (
        <button
          onClick={openCamera}
          className="w-full h-auto flex flex-col items-center gap-3 "
        >
          <div className="p-1">
            <Camera size={30} />
          </div>
        </button>
      ) : (
        <div className="relative w-full h-48 bg-black">
          {/* Minimal Viewfinder: Just a soft vignette */}
          <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]" />

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transition-opacity duration-1000"
          />

          <div className="absolute bottom-4 left-0 w-full px-6 flex justify-between items-center z-20">
            <button
              onClick={closeCamera}
              className="text-[10px] font-bold text-white/60 uppercase tracking-widest px-2 py-1"
            >
              Cancel
            </button>
            <button
              onClick={takePhoto}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-2xl scale-100 active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-full border border-black/5" />
            </button>
            <div className="w-10" /> {/* Spacer for balance */}
          </div>
        </div>
      )}
    </div>
  );
};
