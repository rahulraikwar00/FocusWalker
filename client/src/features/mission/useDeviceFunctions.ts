import { useEffect, useRef } from "react";
import { triggerTactilePulse } from "@/lib/utils";

export function useDeviceCapabilities(
  isActive: boolean,
  isWakeLockEnabled: boolean
) {
  const wakeLockResource = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const requestLock = async () => {
      if ("wakeLock" in navigator && isActive && isWakeLockEnabled) {
        try {
          wakeLockResource.current = await navigator.wakeLock.request("screen");
        } catch (err) {
          console.error("WakeLock Error:", err);
        }
      }
    };

    const releaseLock = async () => {
      if (wakeLockResource.current) {
        await wakeLockResource.current.release();
        wakeLockResource.current = null;
      }
    };

    isActive && isWakeLockEnabled ? requestLock() : releaseLock();

    return () => {
      releaseLock();
    };
  }, [isActive, isWakeLockEnabled]);

  return { triggerTactilePulse };
}
