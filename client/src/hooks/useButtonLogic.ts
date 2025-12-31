import { useState, useRef, useCallback } from "react";

export const useButtonLogic = (onTap: () => void, onHold: () => void) => {
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const holdThreshold = 800; // Time in ms to trigger "Give Up"

  const startHold = useCallback(() => {
    setIsHolding(true);
    timerRef.current = setTimeout(() => {
      onHold();
      setIsHolding(false);
    }, holdThreshold);
  }, [onHold]);

  const cancelHold = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsHolding(false);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    startHold();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // If timer is still running, it was a TAP, not a HOLD
    if (isHolding && timerRef.current) {
      onTap();
    }
    cancelHold();
  };

  return { isHolding, handlePointerDown, handlePointerUp, cancelHold };
};
