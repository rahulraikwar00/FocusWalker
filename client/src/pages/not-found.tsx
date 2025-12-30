import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function NotFound() {
  // Simple function to go back or home without a router
  const goHome = () => {
    window.location.href = "/"; // Force a reload to the base URL
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A] relative overflow-hidden font-sans">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#BFFF04 1px, transparent 1px), linear-gradient(90deg, #BFFF04 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md mx-4"
      >
        <div className="bg-[#141414]/90 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center text-center">
            {/* Error Icon with Glow */}
            <div className="mb-6 p-4 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="h-10 w-10 text-red-500 animate-pulse" />
            </div>

            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white mb-1">
              Link Severed
            </h1>

            <p className="text-[10px] font-black text-[#BFFF04] uppercase tracking-[0.3em] mb-8">
              Error Code: 0x404_NULL_SECTOR
            </p>

            <p className="text-sm text-white/40 leading-relaxed mb-8 px-4">
              The mission coordinates you requested are outside the operational
              theatre. System is unable to establish a stable data link.
            </p>

            {/* Action Buttons */}
            <div className="flex w-full gap-3">
              <Button
                onClick={reloadPage}
                className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black tracking-widest uppercase text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Retry
              </Button>

              <Button
                onClick={goHome}
                className="flex-2 h-14 rounded-2xl bg-[#BFFF04] text-black hover:bg-[#BFFF04]/90 text-[10px] font-black tracking-widest uppercase"
              >
                <Home className="mr-2 h-4 w-4" /> Return to Base
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CRT Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-size-[100%_4px] bg-[linear-gradient(to_bottom,transparent,transparent_2px,#BFFF04_2px,#BFFF04_4px)]" />
    </div>
  );
}
