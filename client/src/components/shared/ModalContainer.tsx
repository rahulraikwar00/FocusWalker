import { motion } from "framer-motion";
import { useGlobal } from "@/contexts/GlobalContext";

interface ModalProps {
  children: React.ReactNode;
  title?: string;
  onClose?: () => void; // Optional extra callback
}

export default function ModalContainer({
  children,
  onClose,
  title,
}: ModalProps) {
  const { setUI } = useGlobal();

  // Unified close handler
  const handleClose = () => {
    // 1. Close all global modal states
    setUI({
      isDossierOpen: false,
      isSettingsOpen: false,
    });

    // 2. Run local callback if provided (e.g., for resetting local drafts)
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6">
      {/* 1. Tactical Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-(--bg-page)/60 backdrop-blur-xl cursor-zoom-out"
      />

      {/* 2. Content Card */}
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md bg-hud border border-(--hud-border) rounded-[2.5rem] p-8 shadow-(--shadow-tactical) pointer-events-auto overflow-hidden backdrop-blur-2xl"
      >
        {/* HUD Corner Accents */}
        <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-(--accent-primary)/30 rounded-tl-lg" />
        <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-(--accent-primary)/30 rounded-tr-lg" />

        {/* Adjusted Bottom brackets for visual balance */}
        <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-(--accent-primary)/30 rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-(--accent-primary)/30 rounded-br-lg" />

        {/* Content Area */}
        <div className="relative z-10 text-(--text-primary)">
          {title && (
            <header className="mb-6">
              <h3 className="text-[10px] font-black tracking-[0.3em] text-(--accent-primary) uppercase">
                {title}
              </h3>
              <div className="h-px w-8 bg-(--accent-primary) mt-1 opacity-50" />
            </header>
          )}

          {children}

          {/* Unified Close Button */}
          <button
            onClick={handleClose}
            className="w-full mt-8 py-4 text-[10px] font-black text-(--accent-primary) uppercase tracking-[0.5em] hover:bg-(--accent-primary)/10 active:bg-(--accent-primary)/20 transition-all rounded-2xl border border-(--accent-primary)/10"
          >
            Terminate Session
          </button>
        </div>
      </motion.div>
    </div>
  );
}
