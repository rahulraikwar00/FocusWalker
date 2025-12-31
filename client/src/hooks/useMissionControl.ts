import { toggleStayAwake, triggerTactilePulse } from "@/lib/utils";

export function useMissionControl(
  settings: { isHapticsEnabled: boolean; isWakeLockEnabled: boolean },
  setIsActive: (arg0: boolean) => void
) {
  const handleStartMission = async () => {
    if (settings.isHapticsEnabled) triggerTactilePulse("double");
    try {
      if (settings.isWakeLockEnabled) await toggleStayAwake(true);
      setIsActive(true);
    } catch (err) {
      console.error("Failed to engage WakeLock", err);
      setIsActive(true);
    }
  };

  const handleStopMission = async () => {
    try {
      await toggleStayAwake(false);
      if (settings.isHapticsEnabled) triggerTactilePulse("short");
    } finally {
      setIsActive(false);
    }
  };

  return { handleStartMission, handleStopMission };
}
