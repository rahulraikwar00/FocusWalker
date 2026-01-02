import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/contexts/GlobalContext";

export const SettingsButton = () => {
  const { setUI } = useGlobal();
  return (
    <Button
      variant="ghost"
      onClick={() => setUI({ isSettingsOpen: true })}
      className="w-11 h-11 rounded-xl bg-hud/50 hover:bg-(--accent-primary)/10 group transition-all"
    >
      <Settings
        size={20}
        className="text-(--text-secondary) group-hover:rotate-90 group-hover:text-(--accent-primary) transition-all duration-500"
      />
    </Button>
  );
};
