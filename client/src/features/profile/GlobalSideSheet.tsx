// import { useDrawer } from "@/features/mission/contexts/DrawerContext";
// import { LayoutList, MapPin, Target, X } from "lucide-react";
// import { MissionDetailView } from "@/features/mission/MissionDetailView";
// import { Button } from "@/components/ui/button";
// import { DestinationSelector } from "@/components/shared/DestinationSelector";
// import { useMissionContext } from "../mission/contexts/MissionContext";
// import { useEffect, useState } from "react";
// import { useUserLocation } from "../navigation/useUserLocation";
// import { useRouteLogic } from "../mission/useRouteLogic";
// import { AnimatePresence, motion } from "framer-motion";

// export const GlobalSideSheet = () => {
//   const { isOpen, toggle } = useDrawer();
//   const { position, getPosition } = useUserLocation();
//   const { handleDestinationSelect } = useRouteLogic();
//   const { setMissionStates } = useMissionContext();

//   // 1. Tab State: 'destinations' or 'Logs'
//   const [activeTab, setActiveTab] = useState<"destinations" | "Logs">(
//     "destinations"
//   );

//   useEffect(() => {
//     // 1. Only fetch position when the drawer opens
//     if (isOpen) {
//       getPosition();

//       // Fixed syntax for the timeout console log
//       const timer = setTimeout(() => {
//         console.log("HUD: Position sync initialized");
//       }, 200);

//       return () => clearTimeout(timer);
//     }
//   }, [isOpen]); // Triggers when the side sheet opens

//   useEffect(() => {
//     // 2. Separately watch for when the 'position' actually changes
//     if (position) {
//       setMissionStates((prev: any) => ({
//         ...prev,
//         position: {
//           ...prev.position,
//           start: [position.lat, position.lng],
//         },
//       }));
//     }
//   }, [position, setMissionStates]); // Triggers only when location data arrives

//   const TABS = [
//     { id: "destinations", label: "Waypoints", icon: Target },
//     { id: "Logs", label: "Mission Intel", icon: LayoutList },
//   ] as const;

//   return (
//     <>
//       {/* Overlay */}
//       <div
//         onClick={toggle}
//         className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[9998] transition-opacity duration-500 ${
//           isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
//         }`}
//       />

//       {/* Side Sheet */}
//       <div
//         className={`fixed top-0 left-0 h-full w-full sm:w-[450px]
//           bg-(--hud-bg) border-r border-(--hud-border)
//           shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-[9999]
//           transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
//           ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
//       >
//         <div className="flex flex-col h-full relative">
//           {/* Header */}
//           <div className="pt-8 px-8 pb-4 border-b border-(--hud-border)">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-2xl font-mono font-bold uppercase tracking-tighter text-(--accent-primary)">
//                 Traveler's Logs
//               </h2>
//               <button
//                 onClick={toggle}
//                 className="p-2 text-(--text-secondary) hover:text-(--accent-primary)"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {/* TACTICAL TABS */}
//             <div className="flex gap-1 mt-6 bg-black/20 p-1 rounded-xl border border-white/5 relative">
//               {TABS.map((tab) => {
//                 const IsActive = activeTab === tab.id;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300 z-10`}
//                   >
//                     <tab.icon
//                       size={14}
//                       className={
//                         IsActive ? "text-black" : "text-(--text-secondary)"
//                       }
//                     />
//                     <span
//                       className={`text-[10px] font-mono font-black uppercase tracking-widest ${
//                         IsActive ? "text-black" : "text-(--text-secondary)"
//                       }`}
//                     >
//                       {tab.label}
//                     </span>

//                     {IsActive && (
//                       <motion.div
//                         layoutId="activeTab"
//                         className="absolute inset-0 bg-(--accent-primary) rounded-lg -z-10"
//                         transition={{
//                           type: "spring",
//                           bounce: 0.2,
//                           duration: 0.6,
//                         }}
//                       />
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* CONTENT: Animated Tab Switcher */}
//           <div className="flex-1 overflow-y-auto custom-scrollbar relative">
//             <AnimatePresence mode="wait">
//               {activeTab === "destinations" ? (
//                 <motion.div
//                   key="destinations"
//                   initial={{ opacity: 0, x: -10 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 10 }}
//                   transition={{ duration: 0.2 }}
//                   className="p-4"
//                 >
//                   <DestinationSelector
//                     userLocation={position}
//                     onSelectDestination={handleDestinationSelect}
//                   />
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   key="Logs"
//                   initial={{ opacity: 0, x: 10 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -10 }}
//                   transition={{ duration: 0.2 }}
//                   className="p-4"
//                 >
//                   <MissionDetailView />
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Footer Status Bar */}
//           <div className="p-4 border-t border-(--hud-border) bg-black/20 flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <div className="w-1.5 h-1.5 rounded-full bg-(--accent-primary) animate-pulse" />
//               <span className="text-[8px] font-mono uppercase text-(--text-secondary) tracking-[0.2em]">
//                 Linked //{" "}
//                 {activeTab === "destinations"
//                   ? "Nav_Sat_Active"
//                   : "Core_Intel_Sync"}
//               </span>
//             </div>
//             <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
//               v2.0.4-Stable
//             </p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
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
import { useMissionContext } from "../mission/contexts/MissionContext";
import { useEffect, useState } from "react";
import { useUserLocation } from "../navigation/useUserLocation";
import { useRouteLogic } from "../mission/useRouteLogic";
import { AnimatePresence, motion } from "framer-motion";
import { useGlobal } from "../mission/contexts/GlobalContext";

export const GlobalSideSheet = () => {
  const { isOpen, toggle } = useDrawer();
  const { handleDestinationSelect } = useRouteLogic();
  const { setMissionStates } = useMissionContext();

  const { user } = useGlobal();

  const [activeTab, setActiveTab] = useState<"destinations" | "Logs">("Logs");

  const TABS = [
    { id: "destinations", label: "Waypoints", icon: Target },
    { id: "Logs", label: "logs", icon: LayoutList },
  ] as const;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={toggle}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity duration-700 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Side Sheet */}
      <div
        className={`fixed top-0 left-0 h-full w-full md:w-200 
          bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 
          z-9999 transition-transform duration-500 ease-in-out 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full relative">
          {/* Header */}
          <div className="pt-10 px-8 pb-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
                Explore
              </h2>
              <button
                onClick={toggle}
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <p className="text-sm text-zinc-500">Plan your next journey</p>

            {/* SIMPLE TABS */}
            <div className="flex gap-6 mt-8 border-b border-zinc-100 dark:border-zinc-800 relative">
              {TABS.map((tab) => {
                const IsActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative pb-3 text-sm transition-colors duration-300 ${
                      IsActive
                        ? "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    <span className="font-medium">{tab.label}</span>
                    {IsActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-100"
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

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-4"
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

          {/* Footer */}
          <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-500">
                {activeTab === "destinations"
                  ? "Location synced"
                  : "Details updated"}
              </span>
            </div>
            <span className="text-[10px] text-zinc-300 dark:text-zinc-600">
              Quiet Mode Active
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
