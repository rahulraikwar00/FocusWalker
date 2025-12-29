import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Map, Zap, Play } from "lucide-react";

export const WelcomeOverlay = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "TACTICAL HUD",
      desc: "Real-time navigation and velocity tracking for urban operatives.",
      icon: <Map className="text-[#BFFF04]" size={48} />,
    },
    {
      title: "STAY AWAKE",
      desc: "System uses WakeLock API to keep your screen active during missions.",
      icon: <ShieldCheck className="text-[#BFFF04]" size={48} />,
    },
    {
      title: "HAPTIC SYNC",
      desc: "Tactile pulses signal mission milestones and progress updates.",
      icon: <Zap className="text-[#BFFF04]" size={48} />,
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
    <div className="fixed inset-0 z-9999 bg-[#0A0A0A] flex flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          <div className="mb-8 p-6 bg-white/5 rounded-full border border-white/10 shadow-[0_0_50px_rgba(191,255,4,0.1)]">
            {steps[step].icon}
          </div>

          <h2 className="text-3xl font-black italic tracking-tighter text-white mb-4">
            {steps[step].title}
          </h2>

          <p className="text-white/50 text-sm leading-relaxed mb-12">
            {steps[step].desc}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicators */}
      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 transition-all duration-300 rounded-full ${
              i === step ? "w-8 bg-[#BFFF04]" : "w-2 bg-white/10"
            }`}
          />
        ))}
      </div>

      <button
        onClick={handleNext}
        className="w-full max-w-xs py-5 bg-[#BFFF04] text-black font-black rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
      >
        {step === steps.length - 1 ? "INITIALIZE SYSTEM" : "CONTINUE"}
        <Play size={16} fill="black" />
      </button>
    </div>
  );
};
