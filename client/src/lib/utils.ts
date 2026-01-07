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
  /* =============================
      ROUTE SUMMARY (INDEX STORE)
     ============================= */

  async saveRouteSummary(route: RouteData, missionId: string) {
    const { logs, ...summary } = route;
    // Key is: route_123
    return await indexStore.setItem(`route_${missionId}`, summary);
  },

  async getAllSummaries() {
    const summaries: RouteData[] = [];
    await indexStore.iterate((value: RouteData) => {
      summaries.push(value);
    });
    // Sorting by date (assuming your RouteData has a date field)
    // is usually helpful for a history list
    return summaries.reverse();
  },

  async removeRouteSummary(missionId: string) {
    try {
      // FIX: Must use the same key format as saveRouteSummary
      const summaryKey = `route_${missionId}`;
      const detailKey = `logs_${missionId}`;

      // 1. Remove from the Index (Sidebar)
      await indexStore.removeItem(summaryKey);

      // 2. Remove from the Details (Heavy Logs/Photos)
      // This is crucial to prevent "Ghost Data" taking up storage
      await detailStore.removeItem(detailKey);

      console.log(`Mission ${missionId} purged successfully.`);
      return true;
    } catch (error) {
      console.error("Failed to delete mission:", error);
      return false;
    }
  },

  /* =============================
           LOG STORAGE
     ============================= */

  async saveAllLogs(missionId: string, logs: CheckPointData[]) {
    return await detailStore.setItem(`logs_${missionId}`, logs);
  },

  async saveLog(missionId: string, log: CheckPointData) {
    const key = `logs_${missionId}`;
    const existingLogs =
      (await detailStore.getItem<CheckPointData[]>(key)) ?? [];
    existingLogs.push(log);
    return await detailStore.setItem(key, existingLogs);
  },

  /* =============================
           FULL ROUTE LOADER
     ============================= */

  async getFullRoute(missionId: string): Promise<RouteData | null> {
    // Key is: route_123
    const summary = await indexStore.getItem<RouteData>(`route_${missionId}`);

    if (!summary) return null;

    const logs =
      (await detailStore.getItem<CheckPointData[]>(`logs_${missionId}`)) ?? [];

    return { ...summary, logs };
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
