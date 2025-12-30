import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Map, Zap, Play } from "lucide-react";

export const WelcomeOverlay = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "INTEL ACQUISITION", // Changed from "Navigate"
      desc: "Convert raw movement into actionable data. Every street is a coordinate; every path is a calculated trajectory.",
      icon: <Map className="text-[#BFFF04]" size={40} />,
      label: "OPERATIONAL AWARENESS",
    },
    {
      title: "ZERO FAIL PROTOCOL", // Changed from "Uninterrupted"
      desc: "System override active. The interface remains engaged until extraction is complete. No blackouts. No interruptions.",
      icon: <ShieldCheck className="text-[#BFFF04]" size={40} />,
      label: "SYSTEM STABILITY",
    },
    {
      title: "KINETIC FEEDBACK", // Changed from "Feel Momentum"
      desc: "Neural-link simulation via haptic sync. Internalize mission progress through physical pulses. Stay eyes-up, always.",
      icon: <Zap className="text-[#BFFF04]" size={40} />,
      label: "SENSORY LINK",
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Save to localStorage so they don't see it again
      localStorage.setItem("has_onboarded", "true");
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-9999 bg-[#0A0A0A] flex flex-col items-center justify-between p-8 pb-12 overflow-hidden">
      {/* 1. Tactical Background Decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#BFFF04_1px,transparent_1px)] bg-size-[24px_24px]" />
      </div>

      {/* 2. Top Label */}
      <div className="relative pt-10">
        <span className="text-[10px] font-black tracking-[0.5em] text-[#BFFF04]/50 uppercase italic">
          System Briefing // 0{step + 1}
        </span>
      </div>

      {/* 3. Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex flex-col items-center text-center max-w-sm relative z-10"
        >
          <div className="mb-10 relative">
            {/* Glow effect behind icon */}
            <div className="absolute inset-0 blur-3xl bg-[#BFFF04]/20 rounded-full" />
            <div className="relative p-8 bg-white/5 rounded-4xl border border-white/10 backdrop-blur-sm">
              {steps[step].icon}
            </div>
          </div>

          <h2 className="text-4xl font-black italic tracking-tighter text-white mb-6 leading-tight">
            {steps[step].title}
          </h2>

          <p className="text-white/60 text-base leading-relaxed font-medium">
            {steps[step].desc}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* 4. Footer Section */}
      <div className="w-full flex flex-col items-center gap-10 relative z-10">
        {/* Progress Indicators */}
        <div className="flex gap-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                i === step ? "w-10 bg-[#BFFF04]" : "w-2 bg-white/10"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-5 bg-[#BFFF04] text-black font-black rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_10px_30px_rgba(191,255,4,0.3)]"
        >
          <span className="tracking-widest uppercase text-sm">
            {step === steps.length - 1 ? "Begin Mission" : "Next Protocol"}
          </span>
          <Play size={14} fill="black" />
        </button>
      </div>
    </div>
  );
};
