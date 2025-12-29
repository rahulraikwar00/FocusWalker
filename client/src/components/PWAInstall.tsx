import { useState, useEffect } from "react";
import { Download } from "lucide-react"; // Import an icon
import { AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      <button
        onClick={handleInstall}
        className="fixed top-48 right-0 z-3000 flex items-center gap-3 bg-(--accent-primary) text-(--bg-page) pl-4 pr-3 py-3 rounded-l-2xl font-black text-[10px] tracking-[0.2em] uppercase shadow-[0_0_20px_var(--accent-glow)] transition-all hover:pr-5 active:scale-95 group"
      >
        <div className="flex flex-col items-end mr-1">
          <span className="leading-none">Install</span>
          <span className="text-[7px] opacity-70">System</span>
        </div>
        <div className="bg-(--bg-page)/20 p-1.5 rounded-lg">
          <Download
            size={16}
            className="group-hover:translate-y-0.5 transition-transform"
          />
        </div>
      </button>
    </AnimatePresence>
  );
}
