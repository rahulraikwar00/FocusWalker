import { useState, useEffect } from "react";

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detect iOS
    const isIphone =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    setIsIOS(isIphone && !isStandalone);

    // 2. Standard PWA Prompt (Android/Chrome)
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsVisible(true);
    };

    const onInstall = () => {
      setIsVisible(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstall);

    // If already in PWA mode, never show the button
    setIsVisible(false);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      alert("Click the 'Share' icon and then 'Add to Home Screen' to install.");
      return;
    }

    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsVisible(false);
    setInstallPrompt(null);
  };

  return { isVisible: isVisible || isIOS, handleInstall, isIOS };
}
