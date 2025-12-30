import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
