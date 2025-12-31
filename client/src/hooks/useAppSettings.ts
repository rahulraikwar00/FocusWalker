import { triggerTactilePulse } from "@/lib/utils";
import { useState } from "react";

// Create this file: hooks/useAppSettings.js
export const useAppSettings = () => {
  const [settings, setSettings] = useState({
    speedKmh: 5.0,
    isHapticsEnabled: true,
    isWakeLockEnabled: true,
    isDark: true,
  });

  const toggleTheme = () => {
    const newDark = !settings.isDark;
    setSettings((prev) => ({ ...prev, isDark: newDark }));

    // DOM manipulation stays here
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Haptics here too
    if (settings.isHapticsEnabled) triggerTactilePulse("short");
  };

  return { settings, setSettings, toggleTheme };
};
