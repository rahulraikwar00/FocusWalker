import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  // Use HTMLVideoElement for the ref type
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        // 'environment' is best for PWA rear-camera usage (scanning/photos)
        video: { facingMode: "environment" },
        audio: false,
      });

      setStream(mediaStream);
      setIsOpen(true);

      // We use a timeout or useEffect to ensure the video element exists before assigning
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied or unavailable:", err);
      alert(
        "Unable to access camera. Please ensure you have granted permission."
      );
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
            <button
              onClick={takePhoto}
              className="flex-1 bg-(--bg-primary) text-white p-2 rounded"
            >
              Capture
            </button>
            <button
              onClick={closeCamera}
              className="flex-1 bg-gray-600 text-white p-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
