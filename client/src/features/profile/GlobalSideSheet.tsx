import { useDrawer } from "@/features/mission/contexts/DrawerContext";
import { MapPin, X, History, ChevronLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { MissionDetailView } from "@/features/mission/MissionDetailView";

import { Button } from "@/components/ui/button";

export const GlobalSideSheet = () => {
  const { isOpen, toggle } = useDrawer();
  const [selectedMission, setSelectedMission] = useState<any | null>(null);

  useEffect(() => {}, []);
  console.log("iam drarer");

  return (
    <>
      {/* Overlay */}
      <div
        onClick={toggle}
        className={`fixed inset-0 bg-(--bg-hud) backdrop-blur-md z-9998 transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Side Sheet */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-80 md:w-96 bg-(--bg-page) border-r border-(--hud-border) shadow-2xl z-9999 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* HEADER */}
          <div className="p-6 border-b border-(--hud-border) flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedMission ? (
                <Button
                  onClick={() => setSelectedMission(null)}
                  className="p-1 -ml-1 hover:bg-(--text-secondary)/10 rounded-full transition-colors"
                >
                  <ChevronLeft className="text-(--accent-primary)" size={24} />
                </Button>
              ) : (
                <History className="text-(--accent-primary)" size={20} />
              )}
              <h2 className="text-sm font-black uppercase tracking-widest text-(--text-primary)">
                {selectedMission ? "Mission Intel" : "Mission Logs"}
              </h2>
            </div>
            <Button onClick={toggle} className="p-2 text-(--text-secondary)">
              <X size={20} />
            </Button>
          </div>
          {/* CONTENT */}
          <MissionDetailView />
        </div>
      </div>
    </>
  );
};
const EmptyState = () => (
  <div className="h-40 flex flex-col items-center justify-center text-(--text-secondary) opacity-40">
    <MapPin size={32} className="mb-2" />
    <p className="text-[10px] uppercase font-bold">No Records Found</p>
  </div>
);

export const ToggleButton = () => {
  const { toggle } = useDrawer();

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      className="w-11 h-11 rounded-xl bg-hud/50 hover:bg-(--accent-primary)/10 group transition-all"
    >
      <MapPin
        size={20}
        className="text-(--accent-primary) group-hover:animate-bounce-slow"
      />
    </Button>
  );
};
