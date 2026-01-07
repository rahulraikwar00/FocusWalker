import { StorageService } from "@/lib/utils";
import { CheckPointData, RouteData } from "@/types/types";
import { useDrawer } from "./contexts/DrawerContext";
import { useEffect, useState } from "react";
import { ChevronDown, Clock, Trash2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const MissionDetailView = () => {
  const [missions, setMissions] = useState<RouteData[]>([]);
  const { isOpen } = useDrawer();

  const loadMissions = async () => {
    const details = await StorageService.getAllSummaries();
    setMissions(details);
  };

  useEffect(() => {
    if (isOpen) loadMissions();
  }, [isOpen]);

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden bg-background">
      <div className="p-4 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-[10px] font-black text-tactical tracking-[0.3em] uppercase opacity-60">
          Telemetry Archives
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar custom-scrollbar">
        {missions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-20">
            <ShieldAlert size={32} className="mb-2" />
            <span className="text-[10px] uppercase tracking-widest">
              No Logs Found
            </span>
          </div>
        ) : (
          missions.map((route) => (
            <RouteDetailsCard
              key={route.id}
              route={route}
              onDelete={loadMissions}
            />
          ))
        )}
        <div className="h-24" />
      </div>
    </div>
  );
};

const RouteDetailsCard = ({
  route,
  onDelete,
}: {
  route: RouteData;
  onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const removeRouteLogs = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the accordion from toggling
    if (confirm("Permanently purge this mission log?")) {
      await StorageService.removeRouteSummary(route.id);
      onDelete();
    }
  };

  return (
    <div
      className={`transition-all duration-300 rounded-xl border ${
        open
          ? "bg-white/[0.07] border-tactical/40 shadow-xl"
          : "bg-white/[0.03] border-white/5 hover:border-white/10"
      }`}
    >
      <div
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              open ? "bg-tactical animate-pulse" : "bg-white/20"
            }`}
          />
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-bold text-white uppercase tracking-tight">
              {route.missionName || `LOG_${route.id.slice(0, 8)}`}
            </span>
            <span className="text-[9px] text-text-secondary font-mono opacity-40">
              {new Date().toLocaleDateString()} • {route.id.slice(0, 8)}
            </span>
          </div>
        </div>
        <ChevronDown
          size={14}
          className={`text-white/40 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                  Journey Logs
                </span>
                <button
                  onClick={removeRouteLogs}
                  className="p-1.5 rounded-md hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <CheckPointCard missionId={route.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckPointCard = ({ missionId }: { missionId: string }) => {
  const [logs, setLogs] = useState<CheckPointData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await StorageService.getFullRoute(missionId);
      setLogs(data?.logs ?? []);
      setLoading(false);
    };
    load();
  }, [missionId]);

  if (loading)
    return (
      <div className="text-[9px] text-center py-4 opacity-50 animate-pulse uppercase tracking-widest">
        Syncing...
      </div>
    );
  if (logs.length === 0)
    return (
      <div className="text-[10px] text-center py-4 opacity-40 italic">
        Log file empty.
      </div>
    );

  return (
    <div className="relative space-y-6 pt-2 ml-1">
      {/* Visual Timeline Line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-tactical/40 via-tactical/10 to-transparent" />

      {logs.map((log) => (
        <div key={log.id} className="relative pl-6 group/log">
          {/* Node Point */}
          <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-background border border-tactical/30 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-tactical shadow-[0_0_5px_rgba(var(--tactical),0.5)]" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-tactical/90 uppercase tracking-tighter">
                {log.label}
              </span>
              <span className="text-[9px] text-white/20 font-mono flex items-center gap-1">
                <Clock size={8} /> 12:45
              </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-snug font-medium">
              {log.note || "No additional data recorded."}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
