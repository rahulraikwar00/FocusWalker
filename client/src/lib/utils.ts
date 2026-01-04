import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CheckPointData, RouteData } from "../types/types";

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
// STORAGE SECTION
// ###############################################

import localforage from "localforage";

// Bucket 1: Summaries for the Sidebar
const indexStore = localforage.createInstance({
  name: "FocusWalker",
  storeName: "mission_index",
});

// Bucket 2: Heavy logs and Photos
const detailStore = localforage.createInstance({
  name: "FocusWalker",
  storeName: "mission_details",
});

export const StorageService = {
  // Save specific logs for a mission
  async saveLogs(routeId: string, logs: CheckPointData[]) {
    return await detailStore.setItem(`logs_${routeId}`, logs);
  },

  // Save the mission summary to the index
  async saveRouteSummary(route: RouteData) {
    const { logs, ...summary } = route;
    return await indexStore.setItem(route.id, summary);
  },

  // Get all summaries for the sidebar
  async getAllSummaries() {
    const summaries: any[] = [];
    await indexStore.iterate((value) => {
      summaries.push(value);
    });
    return summaries.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  // Load full data (Summary + Logs)
  async getFullRoute(routeId: string): Promise<RouteData | null> {
    const summary = await indexStore.getItem<any>(routeId);
    const logs = await detailStore.getItem<CheckPointData[]>(`logs_${routeId}`);
    if (!summary) return null;
    return { ...summary, logs: logs || [] };
  },
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
