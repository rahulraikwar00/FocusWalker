// src/features/map/PositionLock.tsx
import { Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/contexts/GlobalContext";

export const PositionLock = () => {
  const { isLocked, setUI } = useGlobal();

  const toggleLock = () => setUI({ isLocked: !isLocked });

  // Developer Tip: Keep complex tailwind logic outside the return
  const buttonStyles = isLocked
    ? "bg-(--accent-primary)/15 border-(--accent-primary) text-(--accent-primary) shadow-[0_0_15px_var(--accent-glow)]"
    : "bg-(--text-secondary)/10 border-(--hud-border) text-(--text-secondary) hover:bg-(--text-secondary)/20";

  return (
    <Button
      onClick={toggleLock}
      title={isLocked ? "Release View" : "Lock to Position"}
      className={`w-11 h-11 rounded-xl border transition-all duration-500 ease-out p-0 ${buttonStyles}`}
    >
      <div className="relative">
        {isLocked ? (
          <Lock size={18} className="animate-pulse scale-110" />
        ) : (
          <LockOpen size={18} className="rotate-12 opacity-60 scale-90" />
        )}
      </div>
    </Button>
  );
};
