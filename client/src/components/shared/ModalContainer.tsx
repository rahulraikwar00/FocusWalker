import { useGlobal } from "@/features/mission/contexts/GlobalContext";
import { ModalProps } from "@/types/types";

export function ModalContainer({ children, onClose, title }: ModalProps) {
  const { setUI } = useGlobal();

  const handleClose = () => {
    setUI({
      isDossierOpen: false,
      isSettingsOpen: false,
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto no-scrollbar">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-2xl h-[85vh] bg-(--bg-page) rounded-4xl overflow-hidden flex flex-col shadow-2xl border border-(--hud-border)">
        {/* Apple Style Grabber */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-9 h-1 bg-(--text-secondary)/20 rounded-full" />

        {/* Content Area */}
        <div className="flex-1 scrollbar-hide overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
