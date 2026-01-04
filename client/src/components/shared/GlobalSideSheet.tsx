import { useDrawer } from "@/features/mission/contexts/DrawerContext";
import { MapPin, X, History, ChevronLeft } from "lucide-react";
import { HistoryCard } from "@/features/navigation/HistoryCard";

import { useState, useEffect } from "react";
import { MissionDetailView } from "@/features/mission/MissionDetailView";
import { Button } from "../ui/button";

export const GlobalSideSheet = () => {
  const { isOpen, toggle } = useDrawer();
  const [history, setHistory] = useState([]);
  const [selectedMission, setSelectedMission] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      const globalKey = "treklog";
      const saved = JSON.parse(localStorage.getItem(globalKey) || "[]");
      setHistory(saved);
    } else {
      // Reset view when closing
      setTimeout(() => setSelectedMission(null), 300);
    }
  }, [isOpen]);

  return (
    <>
      <div
        onClick={toggle}
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-9998 transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-80 md:w-96 bg-(--bg-page) border-r border-(--hud-border) shadow-2xl z-9999 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* HEADER: Dynamic based on view */}
          <div className="p-6 border-b border-(--hud-border) flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedMission ? (
                <button
                  onClick={() => setSelectedMission(null)}
                  className="p-1 -ml-1 hover:bg-(--text-secondary)/10 rounded-full transition-colors"
                >
                  <ChevronLeft className="text-(--accent-primary)" size={24} />
                </button>
              ) : (
                <History className="text-(--accent-primary)" size={20} />
              )}
              <h2 className="text-sm font-black uppercase tracking-widest text-(--text-primary)">
                {selectedMission ? "Mission Intel" : "Mission Logs"}
              </h2>
            </div>
            <button onClick={toggle} className="p-2 text-(--text-secondary)">
              <X size={20} />
            </button>
          </div>

          {/* CONTENT: List or Detail */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {selectedMission ? (
              <MissionDetailView mission={selectedMission} />
            ) : (
              <div className="p-4 space-y-4">
                {history.length > 0 ? (
                  history.map((log: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => setSelectedMission(log)}
                      className="cursor-pointer active:scale-95 transition-transform"
                    >
                      <HistoryCard data={log} />
                    </div>
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>
            )}
          </div>
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
