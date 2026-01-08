import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openCamera = async () => {
    try {
      // 1. Get a list of all available media devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");

      // 2. Find the "Main" camera.
      // Most phones list the Main sensor as 'Camera 0' or just 'Back Camera'.
      // The wide-angle is usually labeled 'wide', 'ultra', or 'camera 1'.
      const mainCamera =
        videoDevices.find(
          (device) =>
            device.label.toLowerCase().includes("0") ||
            (device.label.toLowerCase().includes("back") &&
              !device.label.toLowerCase().includes("wide"))
        ) ||
        videoDevices.find((d) => d.label.toLowerCase().includes("back")) ||
        videoDevices[0];

      const constraints: any = {
        video: {
          // If we found a specific ID, use it, otherwise fallback to environment
          deviceId: mainCamera ? { exact: mainCamera.deviceId } : undefined,
          facingMode: mainCamera ? undefined : "environment",

          // Requesting a high-res but standard aspect ratio
          width: { ideal: 1920 },
          height: { ideal: 1080 },

          // 3. Force the zoom to 1x to bypass ultra-wide default
          advanced: [{ zoom: 1.0 }],
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      setStream(mediaStream);
      setIsOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      // Fallback for older browsers that don't support 'exact' deviceId
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setStream(fallbackStream);
        setIsOpen(true);
      } catch (fallbackErr) {
        alert("Unable to access the main sensor. Check permissions.");
      }
    }
  };

  // Necessary to link the stream to the video element once it renders
  useEffect(() => {
    if (isOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isOpen, stream]);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !stream) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL("image/jpeg", 0.9);
    onCapture(base64);
    closeCamera();
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsOpen(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  return (
    <div className="flex flex-col gap-2">
      {!isOpen ? (
        <Button onClick={openCamera}>
          <Camera />
        </Button>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline // CRITICAL for PWA/iOS to prevent full-screen takeover
            className="w-full h-64 border rounded bg-black"
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={takePhoto}
              className="flex-1 bg-(--bg-primary) text-white p-2 rounded"
            >
              Capture
            </Button>
            <Button
              onClick={closeCamera}
              className="flex-1 bg-gray-600 text-white p-2 rounded"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
