import { useState, useEffect } from "react";
import { Download } from "lucide-react"; // Import an icon

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    // Show the native install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setInstallPrompt(null);
  };

  return { isVisible, handleInstall };
}

export default function InstallButton() {
  const { isVisible, handleInstall } = usePWAInstall();

  if (!isVisible) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed top-24 right-6 z-3000 flex items-center gap-2 bg-[#BFFF04] text-black px-4 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-[0_0_20px_rgba(191,255,4,0.4)] animate-bounce"
    >
      <Download size={14} />
      Install System
    </button>
  );
}
