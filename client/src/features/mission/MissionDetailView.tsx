import { StorageService } from "@/lib/utils";
import { CheckPointData, RouteData } from "@/types/types";
import { useDrawer } from "./contexts/DrawerContext";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Clock,
  Trash2,
  ShieldAlert,
  Image as ImageIcon,
} from "lucide-react";
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
    <div className="flex flex-col h-full max-h-screen overflow-hidden bg-[#0a0a0b]">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent">
        <h2 className="text-[11px] font-black text-tactical tracking-[0.4em] uppercase">
          Archive // Telemetry
        </h2>
        <p className="text-[9px] text-white/30 font-mono mt-1 italic">
          SECURE DATA ENCLAVE
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {missions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-20 grayscale">
            <ShieldAlert size={40} strokeWidth={1} className="mb-3" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
              No Data Records
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
    e.stopPropagation();
    if (confirm("PURGE DATA: Are you sure?")) {
      await StorageService.removeRouteSummary(route.id);
      onDelete();
    }
  };

  return (
    <div
      className={`group transition-all duration-500 rounded-xl border ${
        open
          ? "bg-white/[0.08] border-tactical/30 shadow-2xl"
          : "bg-white/[0.02] border-white/5 hover:border-white/10"
      }`}
    >
      <div
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              open ? "bg-tactical shadow-[0_0_10px_#4ade80]" : "bg-white/10"
            }`}
          />
          <div className="flex flex-col">
            <span className="text-[12px] font-black text-white/90 uppercase tracking-wider">
              {route.missionName || "UNNAMED_OP"}
            </span>
            <span className="text-[12px] font-black text-white/90 uppercase tracking-wider">
              {route.status || "UNNAMED_OP"}
            </span>
            <span className="text-[9px] text-tactical/50 font-mono uppercase tracking-tighter">
              ID: {route.id.slice(0, 12)} // {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-white/20 transition-transform ${
            open ? "rotate-180 text-tactical" : ""
          }`}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-5 pb-5 pt-2 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">
                  Waypoint Chronology
                </span>
                <button
                  onClick={removeRouteLogs}
                  className="text-white/20 hover:text-red-400 transition-colors"
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
      <div className="text-[9px] text-center py-6 font-mono text-tactical animate-pulse uppercase tracking-[0.3em]">
        Decoding logs...
      </div>
    );

  return (
    <div className="relative space-y-8 pl-4 border-l border-white/5 ml-1">
      {logs.map((log) => (
        <div key={log.id} className="relative group/log">
          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-sm rotate-45 bg-[#0a0a0b] border border-tactical/50 group-hover/log:bg-tactical transition-colors" />

          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="text-[11px] font-black text-white uppercase tracking-wide italic">
                {log.label}
              </h4>
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-white/20">
                <Clock size={10} />{" "}
                {log.timestamp
                  ? new Date(parseInt(log.timestamp)).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "00:00"}
              </div>
            </div>

            <p className="text-[12px] text-white/60 leading-relaxed font-medium">
              {log.note || "System: No analyst commentary provided."}
            </p>

            {/* FIX: Use log.picture instead of the empty photo state */}
            {log.picture && <ImageDisplay base64String={log.picture} />}
          </div>
        </div>
      ))}
    </div>
  );
};

interface ImageDisplayProps {
  base64String: string | null;
}

export const ImageDisplay = ({ base64String }: ImageDisplayProps) => {
  if (!base64String) return null;

  return (
    <div className="mt-3 group/img relative overflow-hidden rounded-lg border border-white/10 bg-black/40">
      <div className="absolute inset-0 bg-tactical/5 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none" />
      <img
        src={base64String}
        alt="Tactical Scan"
        className="w-full h-auto max-h-48 object-cover opacity-80 group-hover/img:opacity-100 transition-opacity"
      />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-md flex items-center justify-between">
        <span className="text-[8px] font-black text-tactical uppercase tracking-widest flex items-center gap-1">
          <ImageIcon size={10} /> Visual_Record.jpg
        </span>
        <span className="text-[8px] text-white/40 font-mono">B64_ENCODED</span>
      </div>
    </div>
  );
};
