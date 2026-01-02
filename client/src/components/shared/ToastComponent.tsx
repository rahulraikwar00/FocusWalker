// components/TacticalToast.tsx
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const TacticalToast = ({
  message,
  isVisible,
  type = "success",
}: {
  message: string;
  isVisible: boolean;
  type?: "success" | "error";
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{
            opacity: 0,
            y: -20,
            x: "-50%",
            transition: { duration: 0.2 },
          }}
          className="fixed top-24 left-1/2 z-9999 pointer-events-none"
        >
          <div
            className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl
            ${
              type === "success"
                ? "bg-hud/80 border-(--accent-primary)/30 text-(--accent-primary)"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }
          `}
          >
            {type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span className="text-xs font-bold uppercase tracking-widest font-mono">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
