import { ModalProps } from "@/types";
import { motion } from "framer-motion";

export default function ModalContainer({
  children,
  onClose,
  title,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* 1. Tactical Backdrop - Uses your page background variable */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-(--bg-page)/60 backdrop-blur-xl"
      />

      {/* 2. Content Card - Uses your .glass-card utility logic */}
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", damping: 25, stiffness: 400 }}
        className="relative w-full max-w-md bg-hud border border-hud-border rounded-[2.5rem] p-8 shadow-(--shadow-tactical) pointer-events-auto overflow-hidden backdrop-blur-2xl"
      >
        {/* Decorative HUD Corners - Using your accent-primary variable */}
        <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-(--accent-primary)/30 rounded-tl-lg" />
        <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-(--accent-primary)/30 rounded-tr-lg" />

        {/* Bottom brackets adjusted to clear the button area */}
        <div className="absolute bottom-24 left-6 w-4 h-4 border-b-2 border-l-2 border-(--accent-primary)/30 rounded-bl-lg" />
        <div className="absolute bottom-24 right-6 w-4 h-4 border-b-2 border-r-2 border-(--accent-primary)/30 rounded-br-lg" />

        {/* Content Area */}
        <div className="relative z-10 text-(--text-primary)">
          {title && (
            <div className="mb-4">
              <h3 className="text-[10px] font-black tracking-[0.3em] text-(--accent-primary) uppercase">
                {title}
              </h3>
            </div>
          )}
          {children}
          <button
            onClick={onClose}
            className="w-full mt-8 py-4 text-[10px] font-black text-(--accent-primary) uppercase tracking-[0.5em] hover:bg-(--accent-primary)/10 transition-all rounded-2xl"
          >
            close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
