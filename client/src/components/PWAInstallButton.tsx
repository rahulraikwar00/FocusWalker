import { Download } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function InstallButton() {
  const { isVisible, handleInstall } = usePWAInstall();

  if (!isVisible) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevents clicks from hitting the map below
        handleInstall();
      }}
      className="fixed top-24 right-6 z-10000 flex items-center gap-2 px-4 py-3 
                 bg-(--accent-primary) text-(--bg-page) rounded-2xl 
                 text-[10px] font-bold uppercase tracking-widest 
                 shadow-lg active:scale-95 transition-all cursor-pointer"
    >
      <Download size={14} strokeWidth={3} />
      <span>Install App</span>
    </button>
  );
}
