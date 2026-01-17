export const ToggleButton = () => {
  const { toggle } = useDrawer();

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      className="w-11 h-11 rounded-xl bg-(--hud-bg) border border-(--hud-border) hover:bg-(--accent-glow) group transition-all shadow-lg"
    >
      <MapPin
        size={20}
        className="text-(--accent-primary) group-hover:scale-110 transition-transform"
      />
    </Button>
  );
};

import { useDrawer } from "@/features/mission/contexts/DrawerContext";
import { LayoutList, MapPin, Target, X } from "lucide-react";
import { MissionDetailView } from "@/features/mission/MissionDetailView";
import { Button } from "@/components/ui/button";
import { DestinationSelector } from "@/components/shared/DestinationSelector";
import { useState } from "react";
import { useRouteLogic } from "../mission/useRouteLogic";
import { AnimatePresence, motion } from "framer-motion";
import { useGlobal } from "../mission/contexts/GlobalContext";

export const GlobalSideSheet = () => {
  const { isOpen, toggle } = useDrawer();
  const { handleDestinationSelect } = useRouteLogic();
  const { user } = useGlobal();

  const [activeTab, setActiveTab] = useState<"destinations" | "Logs">("Logs");

  const TABS = [
    { id: "destinations", label: "Waypoints", icon: Target },
    { id: "Logs", label: "logs", icon: LayoutList },
  ] as const;

  return (
    <>
      {/* Overlay - Deepened for focus and blur */}
      <div
        onClick={toggle}
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-9998 transition-opacity duration-700 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Side Sheet Container */}
      <div
        className={`fixed top-0 left-0 h-full w-full md:w-112.5 
        bg-(--hud-bg) backdrop-blur-2xl border-r border-(--hud-border) 
        z-[9999] transition-transform duration-500 ease-in-out shadow-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Decorative HUD Grid - Subtle texture for depth */}
          <div className="absolute inset-0 opacity-[0.03] paper-ruled pointer-events-none" />

          {/* Header Section */}
          <div className="pt-12 px-8 pb-6 relative z-10 bg-gradient-to-b from-(--hud-bg) to-transparent">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-(--text-primary)">
                  Archives
                </h2>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-(--text-secondary) opacity-70">
                  Telemetry & Logistics
                </p>
              </div>
              <button
                onClick={toggle}
                className="p-2 rounded-full hover:bg-(--text-primary)/10 text-(--text-secondary) hover:text-(--text-primary) transition-all active:scale-90 border border-transparent hover:border-(--hud-border)"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* TACTICAL TABS - Improved Visual Weight */}
            <div className="flex gap-8 mt-10 border-b border-(--hud-border) relative">
              {TABS.map((tab) => {
                const IsActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative pb-4 text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                      IsActive
                        ? "text-(--color-tactical)"
                        : "text-(--text-secondary) hover:text-(--text-primary)"
                    }`}
                  >
                    {tab.label}
                    {IsActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--color-tactical) shadow-[0_0_12px_var(--accent-glow)]"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SCROLLABLE CONTENT AREA */}
          <div className="flex-1 overflow-y-auto px-4 no-scrollbar relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 10, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="p-2"
              >
                {activeTab === "destinations" ? (
                  <DestinationSelector
                    userLocation={user.location}
                    onSelectDestination={handleDestinationSelect}
                  />
                ) : (
                  <MissionDetailView />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* TACTICAL FOOTER */}
          <div className="p-6 border-t border-(--hud-border) bg-(--text-primary)/5 flex items-center justify-between relative z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {/* Pulsing Status Indicator */}
              <div className="relative">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "destinations"
                      ? "bg-emerald-500"
                      : "bg-(--color-tactical)"
                  }`}
                />
                <div
                  className={`absolute inset-0 w-2 h-2 rounded-full animate-ping ${
                    activeTab === "destinations"
                      ? "bg-emerald-500"
                      : "bg-(--color-tactical)"
                  } opacity-40`}
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-(--text-primary) tracking-tight">
                  System Link
                </span>
                <span className="text-[8px] font-mono text-(--text-secondary) uppercase opacity-60">
                  {activeTab === "destinations"
                    ? "GPS: Tracking"
                    : "Local: Secured"}
                </span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] font-mono text-(--text-secondary) opacity-40 uppercase tracking-tighter">
                Archive_V2.6
              </span>
              <span className="text-[8px] font-mono text-(--color-tactical) opacity-80 uppercase">
                Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
