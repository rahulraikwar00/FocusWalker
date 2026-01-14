import { Download } from "lucide-react";
import { usePWAInstall } from "@/components/shared/usePWAInstall";

export default function InstallButton() {
  const { isVisible, handleInstall, isIOS } = usePWAInstall();

  if (!isVisible) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleInstall();
      }}
      style={{ zIndex: 999999 }} // Force absolute priority
      className="fixed top-24 right-6 flex items-center gap-2 px-4 py-3 
                 bg-[#BFFF04] text-black rounded-xl
                 text-[10px] font-black uppercase tracking-widest 
                 shadow-2xl active:scale-90 transition-all 
                 pointer-events-auto cursor-pointer border-none"
    >
      <Download size={14} strokeWidth={3} />
      {/* <span>{isIOS ? "Setup Link" : "Install App"}</span> */}
    </button>
  );
}
