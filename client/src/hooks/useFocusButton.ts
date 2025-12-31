import { useState } from "react";

function useJourney() {
  const [isWalking, setIsWalking] = useState(false);
  const [position, setPosition] = useState(0); // Position along the path
  let timer: string | number | NodeJS.Timeout | undefined;

  const startPress = () => {
    // Start 2-second timer for "Rest"
    timer = setTimeout(() => {
      // Logic for "Rest for the day"
      alert("Resting for the day!");
    }, 2000);
  };

  const endPress = () => {
    clearTimeout(timer);
    // If released before 2s, it's a simple Play/Pause
    setIsWalking(!isWalking);
  };

  return { isWalking, position, startPress, endPress };
}
