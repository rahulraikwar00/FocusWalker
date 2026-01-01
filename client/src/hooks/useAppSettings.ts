import { useEffect, useState } from "react";
import { triggerTactilePulse, toggleStayAwake } from "@/lib/utils";

export const useAppSettings = () => {
  const [settings, setSettings] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return {
      speedKmh: 5.0,
      isHapticsEnabled: true,
      isWakeLockEnabled: true,
      isDark: savedTheme ? savedTheme === "dark" : true,
    };
  });

  // --- THEME SYNC ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [settings.isDark]);

  // --- WAKE LOCK SYNC ---
  useEffect(() => {
    toggleStayAwake(settings.isWakeLockEnabled);

    // Cleanup: Release lock if component unmounts
    return () => {
      toggleStayAwake(false);
    };
  }, [settings.isWakeLockEnabled]);

  const toggleTheme = () => {
    setSettings((prev) => ({ ...prev, isDark: !prev.isDark }));
    if (settings.isHapticsEnabled) triggerTactilePulse("short");
  };

  const toggleHaptics = () => {
    const nextValue = !settings.isHapticsEnabled;
    setSettings((prev) => ({ ...prev, isHapticsEnabled: nextValue }));
    if (nextValue) triggerTactilePulse("double"); // Pulsing on enable
  };

  return { settings, setSettings, toggleTheme, toggleHaptics };
};
