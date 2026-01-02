import { Sun, Moon } from "lucide-react";
import { useGlobal } from "@/contexts/GlobalContext";
import { triggerTactilePulse } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const { settings, updateSettings } = useGlobal();
  const isDark = settings.isDark;

  const handleToggle = () => {
    updateSettings({ isDark: !isDark });
    if (settings.isHapticsEnabled) triggerTactilePulse("short");
  };

  return (
    <Button
      variant="ghost"
      onClick={handleToggle}
      className="w-11 h-11 rounded-xl bg-hud/50 hover:bg-(--accent-primary)/10 group transition-all"
    >
           {" "}
      {isDark ? (
        <Moon
          size={18}
          className="text-(--accent-primary) drop-shadow-[0_0_8px_var(--accent-glow)]"
        />
      ) : (
        <Sun
          size={18}
          className="text-(--text-secondary) group-hover:text-(--accent-primary)"
        />
      )}
         {" "}
    </Button>
  );
};
