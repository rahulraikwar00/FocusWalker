import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Zap, Play, Tent, Compass } from "lucide-react";

export const WelcomeOverlay = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "STOP STICKING TO CLOCKS",
      desc: "Why count minutes when you can count miles? Every second of focus pulls you across a real-world map. You’re not just working; you’re finally moving.",
      icon: <Map className="text-[#BFFF04]" size={40} />,
      label: "THE VIBE",
    },
    {
      title: "EARN YOUR REST",
      desc: "Stay focused and you'll earn a 'Tent'—a peaceful resting spot on the map. It's your space to capture a photo or a thought before the next leg of your journey.",
      icon: <Tent className="text-[#BFFF04]" size={40} />,
      label: "THE MOMENTUM",
    },
    {
      title: "SEE THE DISTANCE",
      desc: "By the end of the day, you'll have more than a to-do list. You'll have a map of a real adventure. It's time to see how far your mind can actually take you.",
      icon: <Compass className="text-[#BFFF04]" size={40} />,
      label: "THE REWARD",
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem("has_onboarded", "true");
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-between p-8 pb-12 overflow-hidden font-sans">
      {/* 1. Subtle Map Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#BFFF04_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {/* 2. Top Status */}
      <div className="relative pt-10 flex flex-col items-center gap-1">
        <span className="text-[10px] font-black tracking-[0.5em] text-[#BFFF04] uppercase">
          {steps[step].label}
        </span>
      </div>

      {/* 3. Narrative Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center max-w-sm relative z-10"
        >
          <div className="mb-14 relative">
            {/* Soft Glow behind icon */}
            <div className="absolute inset-0 blur-[60px] bg-[#BFFF04]/20 rounded-full" />

            <div className="relative p-10 bg-white/[0.02] rounded-[3rem] border border-white/10 backdrop-blur-sm">
              {steps[step].icon}
            </div>
          </div>

          <h2 className="text-3xl font-black italic tracking-tighter text-white mb-6 uppercase leading-none">
            {steps[step].title}
          </h2>

          <p className="text-white/40 text-lg leading-snug font-medium">
            {steps[step].desc}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* 4. The Action */}
      <div className="w-full flex flex-col items-center gap-10 relative z-10 max-w-xs">
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 transition-all duration-700 rounded-full ${
                i === step ? "w-12 bg-[#BFFF04]" : "w-2 bg-white/10"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-6 bg-[#BFFF04] text-black font-black rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <span className="tracking-widest uppercase text-sm">
            {step === steps.length - 1 ? "Step into the Map" : "Next Milestone"}
          </span>
          <Play size={14} fill="black" />
        </button>
      </div>
    </div>
  );
};
