import { useDrawer } from "@/features/mission/contexts/DrawerContext";
import { Button } from "../ui/button";
import { MapPin, TentTree, X, History } from "lucide-react";
import { HistoryCard } from "@/features/navigation/HistoryCard";
import { useState, useEffect } from "react";

export const GlobalSideSheet = () => {
  const { isOpen, toggle } = useDrawer();
  const [history, setHistory] = useState([]);

  // Load history from local storage on mount/open
  useEffect(() => {
    if (isOpen) {
      const saved = JSON.parse(localStorage.getItem("walk_history") || "[]");
      setHistory(saved);
    }
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={toggle}
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[9998] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-80 md:w-96 bg-(--bg-page)/95 border-r border-(--hud-border) shadow-2xl z-[9999] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-(--hud-border) flex items-center justify-between bg-hud/50">
            <div className="flex items-center gap-3">
              <History className="text-(--accent-primary)" size={20} />
              <h2 className="text-sm font-black uppercase tracking-widest text-(--text-primary)">
                Mission Logs
              </h2>
            </div>
            <button
              onClick={toggle}
              className="p-2 hover:bg-(--accent-primary)/10 rounded-lg text-(--text-secondary) transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {history.length > 0 ? (
              history.map((log: any, index: number) => (
                <HistoryCard key={index} data={log} />
              ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-(--text-secondary) opacity-40">
                <MapPin size={32} className="mb-2" />
                <p className="text-[10px] uppercase font-bold">
                  No Records Found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const OpenSheetButton = () => {
  const { toggle } = useDrawer();

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      className="w-11 h-11 rounded-xl bg-hud/50 hover:bg-(--accent-primary)/10 group transition-all"
    >
      <TentTree
        size={20}
        className="text-(--text-secondary) group-hover:rotate-90 group-hover:text-(--accent-primary) transition-all duration-500"
      />
    </Button>
  );
};
