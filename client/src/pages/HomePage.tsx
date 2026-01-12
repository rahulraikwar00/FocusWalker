import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Wind,
  Moon,
  Sun,
  PenTool,
  ArrowRight,
  Compass,
  MailOpen,
  Book,
} from "lucide-react";
import { Link } from "wouter";
import { useGlobal } from "@/features/mission/contexts/GlobalContext";
import { Button } from "@/components/ui/button";

export const HomePage = () => {
  const { settings, toggleTheme } = useGlobal();

  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const, // [!code ++]
      },
    },
  };
  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  return (
    <div className="min-h-screen selection:bg-tactical/30 font-sans transition-colors duration-500 bg-background text-foreground">
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center p-6 md:px-12 md:py-8 backdrop-blur-sm bg-background/5">
        <div className="flex items-center gap-3">
          <Compass className="w-5 h-5 text-tactical" />
          <div className="text-[10px] tracking-[0.5em] uppercase font-bold text-tactical">
            Focus Walker
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Theme Toggle Button */}
          <button
            onClick={() => toggleTheme()} // Added parentheses
            className="group flex items-center gap-2 hover:opacity-70 transition-all"
          >
            <span className="text-[9px] tracking-[0.2em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">
              {settings.isDark ? "Light Mode" : "Dark Mode"}
            </span>
            {settings.isDark ? (
              <Sun size={14} className="text-tactical" />
            ) : (
              <Moon size={14} className="text-tactical" />
            )}
          </button>

          <div className="hidden md:flex items-center gap-6">
            <div className="h-px w-8 bg-hud-border"></div>
            <div className="text-[10px] tracking-[0.2em] uppercase opacity-40">
              Expedition Protocol v1.0
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen mt-12 flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background Geometric Line */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "80%", opacity: 0.15 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-[1px] bg-linear-to-r from-transparent via-tactical to-transparent"
          />
        </div>

        <motion.div
          className="z-10 text-center max-w-5xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            variants={item}
            className="text-6xl md:text-8xl lg:text-9xl mb-10 font-medium leading-[0.9] tracking-tight"
          >
            Your discipline is a <br />
            <span className="italic font-light opacity-70 text-secondary serif">
              quiet pilgrimage.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-xs md:text-sm tracking-[0.4em] uppercase text-secondary mb-14 max-w-lg mx-auto leading-relaxed opacity-80"
          >
            Stop measuring productivity in ticks. <br />
            Measure it in <span className="text-foreground">horizons</span>.
          </motion.p>

          <motion.div variants={item}>
            <Link href="/app">
              <motion.button
                whileHover={{ scale: 1.05, letterSpacing: "0.3em" }}
                whileTap={{ scale: 0.95 }}
                className="bg-tactical text-tactical-foreground px-10 py-4 rounded-full flex items-center gap-4 mx-auto uppercase text-[14px] tracking-[0.2em] cursor-pointer transition-all shadow-xl shadow-tactical/10"
              >
                Begin the Trek <ArrowRight size={14} />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 2, duration: 2 }}
          className="absolute bottom-12 text-[9px] tracking-[0.5em] uppercase animate-pulse"
        >
          Scroll to breathe
        </motion.div>
      </section>

      {/* --- PHILOSOPHY SECTION --- */}
      <section className="py-40 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-24 items-center">
          <motion.div
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-16 tracking-tight">
              Why walk a real map?
            </h2>
            <div className="space-y-16">
              {/* Feature 1: The Endowment Effect (Making progress feel real) */}
              <div className="relative pl-8 border-l border-tactical/20 group">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-tactical scale-0 group-hover:scale-100 transition-transform" />
                <div className="flex items-center gap-3 mb-4">
                  <Wind className="w-4 h-4 text-tactical" />
                  <h4 className="text-[10px] tracking-widest uppercase font-bold text-tactical">
                    Progress you can feel
                  </h4>
                </div>
                <p className="text-secondary text-sm leading-relaxed font-normal opacity-80">
                  Most apps use numbers that feel empty. We use distance. When
                  you see you’ve walked{" "}
                  <span className="text-foreground">
                    12km through a mountain pass
                  </span>{" "}
                  just by doing your deep work, your brain treats that effort as
                  a physical achievement.
                </p>
              </div>

              {/* Feature 2: Peak-End Rule (Ending on a high note) */}
              <div className="relative pl-8 border-l border-tactical/20 group">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-tactical scale-0 group-hover:scale-100 transition-transform" />
                <div className="flex items-center gap-3 mb-4">
                  <PenTool className="w-4 h-4 text-tactical" />
                  <h4 className="text-[10px] tracking-widest uppercase font-bold text-tactical">
                    The Ritual of the Camp
                  </h4>
                </div>
                <p className="text-secondary text-sm leading-relaxed font-normal opacity-80">
                  Don't just close your laptop and vanish. "Set up camp" at the
                  end of your session. Document how you feel. This small ritual
                  signals to your brain that the work is safe to put down,
                  reducing stress and mental clutter.
                </p>
              </div>

              {/* Feature 3: Narrative Identity (Mapping your story) */}
              <div className="relative pl-8 border-l border-tactical/20 group">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-tactical scale-0 group-hover:scale-100 transition-transform" />
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-4 h-4 text-tactical" />
                  <h4 className="text-[10px] tracking-widest uppercase font-bold text-tactical">
                    Your Story on a Map
                  </h4>
                </div>
                <p className="text-secondary text-sm leading-relaxed font-normal opacity-80">
                  Every day is a page in your logbook. Look back and see exactly
                  where you were—mentally and geographically—when you hit your
                  biggest milestones. It’s not a list; it’s a map of your
                  growth.
                </p>
              </div>

              {/* Feature 4: Belongingness (Shared Solitude) */}
              <div className="relative pl-8 border-l border-tactical/20 group">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-tactical scale-0 group-hover:scale-100 transition-transform" />
                <div className="flex items-center gap-3 mb-4">
                  <Moon className="w-4 h-4 text-tactical" />
                  <h4 className="text-[10px] tracking-widest uppercase font-bold text-tactical">
                    Letters from the Trail
                  </h4>
                </div>
                <p className="text-secondary text-sm leading-relaxed font-normal opacity-80">
                  You are walking your own path, but you aren't alone. Find
                  notes left by others at the same difficult hill or beautiful
                  sunset. Their encouragement reminds you that the struggle is
                  shared and the destination is real.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="glass-card aspect-square rounded-2xl flex flex-col items-center justify-center p-12 text-center border border-white/5 shadow-2xl backdrop-blur-md bg-white/5">
              <MapPin className="w-8 h-8 mb-8 text-tactical animate-bounce" />
              <span className="text-[9px] tracking-[0.5em] text-tactical uppercase block mb-3 font-bold">
                Active Expedition
              </span>
              <h3 className="text-3xl font-medium mb-4">Everest Base Camp</h3>
              <div className="h-[1px] w-16 bg-tactical/30 my-6" />
              <div className="space-y-1">
                <p className="text-[11px] text-foreground font-mono tracking-widest uppercase">
                  142.8 KM REMAINING
                </p>
                <p className="text-[9px] text-secondary tracking-[0.2em] uppercase opacity-50">
                  Current Pace: 4.2km/day
                </p>
              </div>
            </div>
            {/* Decorative HUD corners */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-tactical/30" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-tactical/30" />
          </motion.div>
        </div>
      </section>

      {/* --- QUOTE --- */}
      <section className="py-48 border-y border-hud-border/50 bg-tactical/[0.02]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeIn}>
            <Moon className="w-6 h-6 mx-auto mb-12 text-tactical opacity-30" />
            <h2 className="text-4xl md:text-5xl font-light italic leading-snug text-secondary/90 serif">
              "When I look back, I don't see hours. I see the mountains I
              climbed while writing my book."
            </h2>
            <div className="mt-12 flex items-center justify-center gap-4">
              <div className="h-px w-6 bg-tactical/30" />
              <p className="text-[10px] tracking-[0.5em] uppercase opacity-50">
                The Wayfarer's Journal
              </p>
              <div className="h-px w-6 bg-tactical/30" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-60 text-center relative overflow-hidden">
        <motion.div {...fadeIn} className="px-6 relative z-10">
          <h2 className="text-5xl md:text-6xl font-medium mb-16 tracking-tighter">
            Leave the noise behind.
          </h2>
          <Link href="/app">
            <button className="text-[11px] tracking-[0.5em] uppercase border-b border-tactical/50 pb-4 hover:border-tactical hover:text-tactical transition-all font-bold cursor-pointer">
              Start Your Journey
            </button>
          </Link>
        </motion.div>

        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-tactical/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-t from-tactical to-transparent opacity-30" />
      </footer>
    </div>
  );
};
