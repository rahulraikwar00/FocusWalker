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
    availableDevices: MediaDeviceInfo[]
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
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      {!isOpen ? (
        <Button onClick={openCamera} className="w-full">
          <Camera className="mr-2 h-4 w-4" /> Open Camera
        </Button>
      ) : (
        <div className="relative bg-black rounded-lg overflow-hidden border shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // PC browsers often require 'muted' to autoplay video
            className="w-full h-auto min-h-60 block"
          />

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {devices.length > 1 && (
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full opacity-80 hover:opacity-100"
                onClick={switchCamera}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="p-4 flex gap-3 bg-white/10 backdrop-blur-sm">
            <Button
              onClick={takePhoto}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Take Photo
            </Button>
            <Button
              onClick={closeCamera}
              variant="destructive"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
