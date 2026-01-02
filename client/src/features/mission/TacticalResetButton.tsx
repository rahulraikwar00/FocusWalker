import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "../../components/ui/button";

export const TacticalResetButton = ({ onReset }: { onReset: () => void }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isConfirming) {
      const timer = setTimeout(() => setIsConfirming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirming]);

  const handleHandleClick = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      onReset();
      setIsConfirming(false);
    }
  };

  return (
    <Button
      onClick={handleHandleClick}
      className={`flex-1 h-full rounded-3xl border transition-all duration-300 relative overflow-hidden ${
        isConfirming
          ? "bg-red-500/20 border-red-500 text-red-500"
          : "bg-(--text-secondary)/10 border-(--hud-border) text-(--text-secondary)"
      }`}
    >
      <AnimatePresence mode="wait">
        {isConfirming ? (
          <motion.span
            key="confirm"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="text-[10px] font-black"
          >
            SURE?
          </motion.span>
        ) : (
          <motion.div
            key="icon"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <RotateCcw size={20} />
          </motion.div>
        )}
      </AnimatePresence>

      {isConfirming && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-red-500/50"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 3, ease: "linear" }}
        />
      )}
    </Button>
  );
};
