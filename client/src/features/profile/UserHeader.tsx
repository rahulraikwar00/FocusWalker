import { motion } from "framer-motion";

import { Avatar } from "../../components/shared/Avatar";
import { useGlobal } from "@/features/mission/contexts/GlobalContext";

export const UserHeader = () => {
  const { user, setUI } = useGlobal();

  return (
    <div className="absolute top-0 left-0 w-full z-3000 px-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pointer-events-none flex justify-between items-start">
      {/* OPERATOR PROFILE stays on left */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => setUI({ isDossierOpen: true })}
        className="group flex items-center gap-3 bg-hud/80 backdrop-blur-xl border-l-2 border-(--accent-primary) p-1.5 pr-5 rounded-r-xl pointer-events-auto shadow-2xl transition-all active:scale-95"
      >
        <div className="relative">
          <div className="w-11 h-11 bg-(--accent-primary) rounded-lg flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)] overflow-hidden">
            <Avatar seed={user?.name || "Ghost"} size={64} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-(--accent-primary) border-2 border-(--bg-page) rounded-full animate-pulse" />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black text-(--accent-primary) tracking-widest uppercase">
            {user?.rank || "RECRUIT"}
          </span>
          <h1 className="text-sm font-black text-(--text-primary) uppercase tracking-wider italic">
            {user?.name || "IDENTIFYING..."}
          </h1>
        </div>
      </motion.button>

      {/* Connection Status stays on right, but floating standalone */}
      <div className="hidden xs:flex flex-col items-end gap-1 opacity-60">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-(--accent-primary) rounded-full animate-[bounce_2s_infinite_0ms]" />
          <div className="w-1 h-3 bg-(--accent-primary) rounded-full animate-[bounce_2s_infinite_200ms]" />
          <div className="w-1 h-2 bg-(--text-secondary) opacity-20 rounded-full" />
        </div>
        <span className="text-[7px] font-black text-(--accent-primary) uppercase tracking-tighter">
          Uplink: Active
        </span>
      </div>
    </div>
  );
};
