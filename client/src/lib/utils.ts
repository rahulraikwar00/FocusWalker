import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CheckPointData } from "../types/types";

interface TacticalSettings {
  speed: number;
  haptics: boolean;
  wakeLock: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let wakeLockSentinel: WakeLockSentinel | null = null;

export const toggleStayAwake = async (enable: boolean) => {
  if (!("wakeLock" in navigator)) {
    console.warn("System: Wake Lock not supported on this browser.");
    return;
  }

  try {
    if (enable) {
      wakeLockSentinel = await navigator.wakeLock.request("screen");
      console.log("System: Screen Lock Engaged 🟢");
    } else {
      if (wakeLockSentinel) {
        await wakeLockSentinel.release();
        wakeLockSentinel = null;
        console.log("System: Screen Lock Released 🔴");
      }
    }
  } catch (err) {
    console.error(`System: Wake Lock Error - ${err}`);
  }
};

export const triggerTactilePulse = (
  type: "short" | "double" | "error" = "short"
) => {
  if (!("vibrate" in navigator)) return;

  switch (type) {
    case "short":
      // A single sharp tactical click
      navigator.vibrate(40);
      break;
    case "double":
      // Useful for "Mission Started" or "Step Reached"
      navigator.vibrate([50, 30, 50]);
      break;
    case "error":
      // A long pulse for warnings
      navigator.vibrate(200);
      break;
  }
};

// ###############################################
// CAMERA SECTION
// ###############################################

/**
 * Utility to handle camera stream and image capture
 */
export const CameraUtils = {
  // 1. Start the camera stream
  async startCamera(videoElement: HTMLVideoElement) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
        audio: false,
      });
      videoElement.srcObject = stream;
      return stream;
    } catch (err) {
      console.error("Camera access denied:", err);
      throw err;
    }
  },

  // 2. Capture a frame and return Base64 string
  takePhoto(videoElement: HTMLVideoElement): string {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw the current video frame to the canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      // Convert to Base64 (JPEG for smaller file size)
      return canvas.toDataURL("image/jpeg", 0.7); // 0.7 = 70% quality to save space
    }
    return "";
  },

  // 3. Stop the camera to save battery
  stopCamera(stream: MediaStream | null) {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  },
};

export const getMissionId = (points: {
  start: L.LatLng | null;
  end: L.LatLng | null;
}) => {
  if (!points.start || !points.end) return "";

  const start = `${points.start.lat.toFixed(5)}_${points.start.lng.toFixed(5)}`;
  const end = `${points.end.lat.toFixed(5)}_${points.end.lng.toFixed(5)}`;

  return `${start}__TO__${end}`;
};

// const points: {
//     start: L.LatLng | null;
//     end: L.LatLng | null;
// }
