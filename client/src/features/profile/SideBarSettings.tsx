import { PositionLock } from "../navigation/PositionLock";
import { SettingsButton } from "../navigation/SettingsButton";
import { ThemeToggle } from "../navigation/ThemeToggleButton";
import { ToggleButton } from "@/features/profile/GlobalSideSheet";

export const SettingsSideBar = () => {
  return (
    <div className="fixed right-2 top-2/5 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-auto z-3000 group">
      {/* 1. Visual Rail: Uses your --accent-primary for the glow line */}
      <div className="absolute inset-y-0 w-px bg-linear-to-b from-transparent via-tactical/40 to-transparent -z-10 shadow-[0_0_12px_var(--accent-glow)]" />

      {/* 2. Main Container: Uses your 'glass-card' utility */}
      <div className="glass-card flex flex-col p-2 gap-3 rounded-full! py-4 hover:border-tactical/50 shadow-2xl transition-all duration-500">
        {/* These components should now inherit the theme colors */}
        <SettingsButton />
        <ThemeToggle />
        <PositionLock />
        <ToggleButton />
      </div>
    </div>
  );
};

// ################################################################
// slid open version
// ########################################3

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Settings, X } from "lucide-react";
// import { PositionLock } from "../navigation/PositionLock";
// import { SettingsButton } from "../navigation/SettingsButton";
// import { ThemeToggle } from "../navigation/ThemeToggleButton";
// import { ToggleButton } from "@/features/profile/GlobalSideSheet";

// export const SettingsSideBar = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const menuItems = [
//     { id: 1, component: <SettingsButton /> },
//     { id: 2, component: <ThemeToggle /> },
//     { id: 3, component: <PositionLock /> },
//     { id: 4, component: <ToggleButton /> },
//   ];

//   return (
//     <div className="fixed right-0 top-1/2 -translate-y-1/2 flex items-center justify-end pointer-events-auto z-3000 group">
//       <div className="relative flex items-center">
//         {/* Compact Horizontal Ribbon */}
//         <AnimatePresence>
//           {isOpen && (
//             <motion.div
//               initial={{ opacity: 0, x: 50, scaleX: 0.8 }}
//               animate={{ opacity: 1, x: -8, scaleX: 1 }}
//               exit={{ opacity: 0, x: 50, scaleX: 0.8 }}
//               transition={{ duration: 0.2, ease: "circOut" }}
//               className="glass-card flex items-center gap-1.5 p-1.5 pr-10 rounded-l-2xl border-r-0 shadow-2xl origin-right"
//             >
//               {menuItems.map((item, index) => (
//                 <motion.div
//                   key={item.id}
//                   initial={{ opacity: 0, scale: 0.5, x: 10 }}
//                   animate={{ opacity: 1, scale: 0.85, x: 0 }}
//                   transition={{ delay: index * 0.03, duration: 0.15 }} // Very fast stagger
//                   className="hover:bg-white/10 rounded-full transition-colors"
//                 >
//                   {item.component}
//                 </motion.div>
//               ))}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Trigger Button - Anchored to Edge */}
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className={`
//             absolute right-0 z-10
//             glass-card p-2  border-r-0
//             transition-all duration-200 active:scale-95
//             ${isOpen ? "bg-tactical/30 w-10" : "w-8 hover:w-10"}
//           `}
//         >
//           <motion.div
//             // animate={{ scale: isOpen ? 3 :  }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//           >
//             {isOpen ? (
//               <X className="w-4 h-4 text-(--text-primary)" />
//             ) : (
//               <Settings className="w-4 h-4 text-(--text-primary) opacity-80" />
//             )}
//           </motion.div>
//         </button>
//       </div>
//     </div>
//   );
// };
