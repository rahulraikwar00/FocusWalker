import React from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  MapPin,
  Wind,
  Moon,
  Sun,
  PenTool,
  ArrowRight,
  Compass,
} from "lucide-react";
import { Link } from "wouter";
import { useGlobal } from "@/features/mission/contexts/GlobalContext";

export const HomePage = () => {
  const { settings, toggleTheme } = useGlobal();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  } as const;

  return (
    <div className="min-h-screen selection:bg-tactical/30 font-sans transition-colors duration-700 bg-(--bg-page) text-primary overflow-x-hidden">
      {/* --- BACKGROUND MESH GRID --- */}
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,var(--hud-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--hud-border)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-5 md:px-12 md:py-8 backdrop-blur-md border-b border-hud-border bg-(--bg-page)/40">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <Compass className="w-5 h-5 text-tactical relative z-10" />
            <div className="absolute inset-0 bg-tactical/20 blur-lg animate-pulse" />
          </div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-black text-tactical">
            Focus Walker
          </div>
        </motion.div>

        <button
          onClick={() => toggleTheme()}
          className="group flex items-center gap-3 px-4 py-2 rounded-full border border-hud-border hover:border-tactical transition-all duration-500 bg-hud/20"
        >
          <span className="text-[9px] tracking-[0.2em] uppercase text-secondary font-bold">
            {settings.isDark ? "Night" : "Day"}
          </span>
          {settings.isDark ? (
            <Sun
              size={14}
              className="text-tactical group-hover:rotate-90 transition-transform"
            />
          ) : (
            <Moon
              size={14}
              className="text-tactical group-hover:-rotate-12 transition-transform"
            />
          )}
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <motion.section
        style={{ opacity, scale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20"
      >
        <motion.div
          className="z-10 text-center w-full max-w-7xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            variants={item}
            className="text-[clamp(3rem,12vw,9rem)] mb-8 font-extrabold leading-[0.9] tracking-tighter"
          >
            Your discipline is a <br />
            <span className="italic font-light opacity-50 text-secondary serif block">
              quiet pilgrimage.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-secondary mb-12 max-w-md mx-auto leading-loose"
          >
            Stop measuring productivity in ticks. <br />
            Measure it in{" "}
            <span className="text-primary font-black border-b-2 border-tactical/30 pb-0.5">
              horizons
            </span>
          </motion.p>

          <motion.div variants={item}>
            <Link href="/app">
              <button className="btn-primary group flex items-center gap-4 mx-auto uppercase text-xs tracking-[0.2em] cursor-pointer">
                Begin the Trek{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 flex flex-col items-center gap-4"
        >
          <span className="text-[8px] tracking-[0.8em] uppercase font-bold">
            Scroll
          </span>
          <div className="w-[1px] h-12 bg-linear-to-b from-tactical to-transparent" />
        </motion.div>
      </motion.section>

      {/* --- THE CONCEPT --- */}
      <section className="py-24 md:py-40 px-6 relative border-t border-hud-border bg-hud/5">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-20 md:mb-32">
            <span className="text-[10px] tracking-[0.5em] text-tactical uppercase font-black">
              01 // The Protocol
            </span>
            <h2 className="text-4xl md:text-6xl font-bold mt-6 tracking-tight max-w-3xl mx-auto leading-tight">
              Focus is a journey, not a task.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
            {[
              {
                id: "01",
                title: "Choose Your Route",
                desc: "Pick a real-world trail, from the streets of Kyoto to the peaks of the Alps.",
              },
              {
                id: "02",
                title: "Commit to Focus",
                desc: "Start your work session. As the clock ticks, your walker moves forward on the map.",
              },
              {
                id: "03",
                title: "Reach the Horizon",
                desc: "When your work is done, you've gained real ground. Log your thoughts at the campfire.",
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="w-12 h-12 rounded-xl border border-hud-border flex items-center justify-center mb-8 group-hover:bg-tactical group-hover:text-black transition-all duration-500 font-black text-xs">
                  {step.id}
                </div>
                <h3 className="text-xs uppercase tracking-[0.25em] font-black mb-4 text-primary">
                  {step.title}
                </h3>
                <p className="text-secondary text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PHILOSOPHY --- */}
      <section className="py-24 md:py-48 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-32 items-center">
          <motion.div {...fadeIn}>
            <h2 className="text-5xl md:text-7xl font-bold mb-12 md:mb-20 tracking-tighter leading-none">
              Why walk a <br />
              <span className="text-tactical italic font-light serif opacity-80">
                real map?
              </span>
            </h2>

            <div className="space-y-10 md:space-y-16">
              {[
                {
                  icon: <Wind size={20} />,
                  label: "Progress you can feel",
                  desc: "Most apps use numbers that feel empty. We use distance. When you see you’ve walked 12km through a mountain pass, your brain treats that as a physical achievement.",
                },
                {
                  icon: <PenTool size={20} />,
                  label: "The Ritual of the Camp",
                  desc: "Don't just close your laptop and vanish. 'Set up camp' at the end of your session. This ritual signals to your brain that the work is safe to put down.",
                },
                {
                  icon: <MapPin size={20} />,
                  label: "Your Story on a Map",
                  desc: "Every day is a page in your logbook. Look back and see exactly where you were—mentally and geographically—when you hit your biggest milestones.",
                },
                {
                  icon: <Moon size={20} />,
                  label: "Letters from the Trail",
                  desc: "You are walking your own path, but you aren't alone. Find notes left by others at the same difficult hill. Their encouragement reminds you that the struggle is shared.",
                },
              ].map((feat, i) => (
                <div key={i} className="relative pl-10 md:pl-14 group">
                  <div className="absolute left-0 top-0 w-px h-full bg-hud-border group-hover:bg-tactical transition-colors" />
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-tactical shrink-0">{feat.icon}</span>
                    <h4 className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-black text-tactical">
                      {feat.label}
                    </h4>
                  </div>
                  <p className="text-secondary text-sm md:text-base leading-relaxed max-w-md group-hover:text-primary transition-colors">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeIn} className="relative">
            <div className="glass-card relative aspect-4/5 md:aspect-3/4 overflow-hidden flex flex-col items-center justify-center p-8 text-center group">
              <div className="absolute inset-0 z-0">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Lit_Tents_of_Seven_Summit_Treks_seen_at_Everest_Basecamp%2C_background_Nuptse_mountain..jpg/1024px-Lit_Tents_of_Seven_Summit_Treks_seen_at_Everest_Basecamp%2C_background_Nuptse_mountain..jpg"
                  className="w-full h-full object-cover grayscale opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-[2s]"
                />
                <div className="absolute inset-0 bg-linear-to-b from-(--bg-page) via-transparent to-(--bg-page)" />
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <MapPin className="w-10 h-10 text-tactical mb-6 animate-bounce" />
                <span className="text-[10px] tracking-[0.5em] text-tactical uppercase font-black mb-2">
                  Active Expedition
                </span>
                <h3 className="text-4xl md:text-5xl font-bold mb-4 tracking-tighter">
                  Everest <br /> Base Camp
                </h3>
                <div className="h-[1px] w-24 bg-tactical/30 my-6" />
                <p className="text-xs font-black tracking-[0.2em] mb-1">
                  142.8 KM REMAINING
                </p>
                <p className="text-[10px] text-secondary tracking-widest uppercase">
                  Pace: <span className="text-primary font-bold">4.2km/h</span>
                </p>
              </div>
            </div>
            {/* Corner Accents */}
            <div className="absolute -top-4 -left-4 w-12 h-12 border-t border-l border-tactical/40 rounded-tl-2xl" />
            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b border-r border-tactical/40 rounded-br-2xl" />
          </motion.div>
        </div>
      </section>

      {/* --- QUOTE --- */}
      <section className="py-40 md:py-64 bg-hud/5 border-y border-hud-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeIn}>
            <div className="w-12 h-px bg-tactical/40 mx-auto mb-12" />
            <h2 className="text-3xl md:text-5xl font-light italic leading-snug text-primary/80 serif">
              "When I look back, I don't see hours. I see the mountains I
              climbed while writing my book."
            </h2>
            <p className="mt-12 text-[9px] tracking-[0.8em] uppercase text-secondary font-black">
              The Wayfarer's Journal
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-32 md:py-48 text-center relative px-6">
        <motion.div {...fadeIn}>
          <h2 className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-tight">
            Every step is <br /> a{" "}
            <span className="italic font-light text-secondary serif">
              return
            </span>
            .
          </h2>
          <Link href="/app">
            <button className="mt-16 group relative text-[10px] tracking-[0.6em] uppercase font-black py-4">
              <span className="relative z-10">Start Your Journey</span>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-tactical scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </button>
          </Link>
        </motion.div>
        <div className="mt-32 opacity-30 text-[8px] tracking-[1em] uppercase font-bold">
          Focus Walker © 2026
        </div>
      </footer>
    </div>
  );
};
