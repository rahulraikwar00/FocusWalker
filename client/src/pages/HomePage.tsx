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
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Animation Variants
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const fadeIn = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <div className="min-h-screen selection:bg-tactical/30 font-sans transition-colors duration-700 bg-background text-foreground overflow-x-hidden">
      {/* --- BACKGROUND MESH GRID --- */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center p-6 md:px-12 md:py-8 backdrop-blur-md border-b border-hud-border/10 bg-background/20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <Compass className="w-5 h-5 text-tactical relative z-10" />
            <div className="absolute inset-0 bg-tactical/20 blur-lg animate-pulse" />
          </div>
          <div className="text-[10px] tracking-[0.5em] uppercase font-bold text-tactical">
            Focus Walker
          </div>
        </motion.div>

        <div className="flex items-center gap-8">
          <button
            onClick={() => toggleTheme()}
            className="group flex items-center gap-3 px-4 py-2 rounded-full border border-hud-border/20 hover:border-tactical/40 transition-all duration-500"
          >
            <span className="text-[9px] tracking-[0.2em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">
              {settings.isDark ? "Light Mode" : "Dark Mode"}
            </span>
            {settings.isDark ? (
              <Sun
                size={14}
                className="text-tactical group-hover:rotate-90 transition-transform duration-500"
              />
            ) : (
              <Moon
                size={14}
                className="text-tactical group-hover:-rotate-12 transition-transform duration-500"
              />
            )}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <motion.section
        style={{ opacity, scale }}
        className="relative h-screen flex flex-col items-center justify-center px-6"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 0.1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
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
            className="text-6xl md:text-8xl lg:text-[10rem] mb-12 font-medium leading-[0.85] tracking-tighter"
          >
            Your discipline is a <br />
            <span className="italic font-light opacity-60 text-secondary serif block mt-2">
              quiet pilgrimage.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-xs md:text-sm tracking-[0.4em] uppercase text-secondary mb-16 max-w-lg mx-auto leading-relaxed opacity-60"
          >
            Stop measuring productivity in ticks. <br />
            Measure it in{" "}
            <span className="text-foreground font-bold border-b border-tactical/30">
              horizons
            </span>
            .
          </motion.p>

          <motion.div variants={item}>
            <Link href="/app">
              <motion.button
                whileHover={{ scale: 1.02, letterSpacing: "0.25em" }}
                whileTap={{ scale: 0.98 }}
                className="bg-tactical text-(--bg-page) px-12 py-5 rounded-full flex items-center gap-4 mx-auto uppercase text-[14px] font-bold tracking-[0.2em] shadow-2xl shadow-tactical/20 hover:shadow-tactical/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                Begin the Trek <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2.5, duration: 2 }}
          className="absolute bottom-12 flex flex-col items-center gap-4"
        >
          <span className="text-[8px] tracking-[0.8em] uppercase">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-tactical to-transparent" />
        </motion.div>
      </motion.section>

      {/* --- THE CONCEPT / HOW IT WORKS --- */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-24">
            <span className="text-[10px] tracking-[0.5em] text-tactical uppercase font-black">
              01 // The Protocol
            </span>
            <h2 className="text-4xl md:text-6xl font-medium mt-6 tracking-tight max-w-2xl mx-auto">
              Focus is a journey, not a task.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16 lg:gap-24">
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="w-10 h-10 rounded-sm border border-tactical/20 flex items-center justify-center mb-8 group-hover:bg-tactical group-hover:text-white transition-colors duration-500 font-mono text-xs">
                  {step.id}
                </div>
                <h3 className="text-sm uppercase tracking-[0.2em] font-bold mb-4">
                  {step.title}
                </h3>
                <p className="text-secondary text-sm leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PHILOSOPHY SECTION --- */}
      <section className="py-48 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 lg:gap-32 items-center">
          {/* Left Column: Text Content */}
          <motion.div {...fadeIn}>
            <h2 className="text-5xl md:text-6xl font-medium mb-16 tracking-tighter leading-[1.1]">
              Why walk a <br />
              <span className="text-tactical italic serif opacity-80">
                real map?
              </span>
            </h2>

            <div className="space-y-12">
              {[
                {
                  icon: <Wind size={20} />,
                  label: "Progress you can feel",
                  desc: "Most apps use numbers that feel empty. We use distance. When you see you’ve walked 12km through a mountain pass just by doing your deep work, your brain treats that effort as a physical achievement.",
                },
                {
                  icon: <PenTool size={20} />,
                  label: "The Ritual of the Camp",
                  desc: "Don't just close your laptop and vanish. 'Set up camp' at the end of your session. Document your state of mind. This ritual signals to your brain that the work is safe to put down.",
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
                <div key={i} className="relative pl-12 group">
                  {/* Vertical Accent Line */}
                  <div className="absolute left-0 top-2 w-[2px] h-full bg-tactical/10 group-hover:bg-tactical/60 transition-all duration-500" />

                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-tactical group-hover:scale-110 transition-transform duration-300">
                      {feat.icon}
                    </span>
                    <h4 className="text-[12px] tracking-[0.25em] uppercase font-black text-tactical">
                      {feat.label}
                    </h4>
                  </div>

                  {/* Paragraph: Increased size to 16px (text-base) and opacity to 80% */}
                  <p className="text-foreground/80 text-base leading-relaxed group-hover:text-foreground transition-colors duration-300 max-w-md">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Visual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="glass-card relative aspect-[4/5] rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center p-10 text-center border border-foreground/10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] backdrop-blur-2xl bg-background/20 group"
            >
              {/* Background Image Layer */}
              <div className="absolute inset-0 z-0">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Lit_Tents_of_Seven_Summit_Treks_seen_at_Everest_Basecamp%2C_background_Nuptse_mountain..jpg/1024px-Lit_Tents_of_Seven_Summit_Treks_seen_at_Everest_Basecamp%2C_background_Nuptse_mountain..jpg"
                  alt="Everest Base Camp"
                  className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90" />
              </div>

              {/* Content Layer */}
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="relative mb-8">
                  <MapPin className="w-12 h-12 text-tactical relative z-10 drop-shadow-[0_0_15px_rgba(var(--tactical-rgb),0.5)]" />
                  <div className="absolute inset-0 bg-tactical blur-3xl opacity-30 animate-pulse" />
                </div>

                <span className="text-[11px] tracking-[0.5em] text-tactical uppercase block mb-3 font-black">
                  Active Expedition
                </span>

                <h3 className="text-4xl md:text-5xl font-medium mb-6 tracking-tight text-foreground">
                  Everest <br /> Base Camp
                </h3>

                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-tactical to-transparent my-6 opacity-30" />

                <div className="space-y-3">
                  <p className="text-sm text-foreground font-mono tracking-[0.2em] uppercase font-bold">
                    142.8 KM REMAINING
                  </p>
                  {/* Increased text size for pace */}
                  <p className="text-xs text-muted-foreground tracking-widest uppercase font-semibold">
                    Current Pace:{" "}
                    <span className="text-foreground">4.2km/h</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Modern HUD Corner Accents */}
            <div className="absolute -top-4 -left-4 w-16 h-16 border-t-[1px] border-l-[1px] border-tactical/30 rounded-tl-3xl" />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b-[1px] border-r-[1px] border-tactical/30 rounded-br-3xl" />
          </motion.div>
        </div>
      </section>

      {/* --- QUOTE --- */}
      <section className="py-60 relative overflow-hidden bg-tactical/[0.01]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeIn}>
            <div className="w-12 h-[1px] bg-tactical/40 mx-auto mb-16" />
            <h2 className="text-4xl md:text-6xl font-light italic leading-snug text-secondary/90 serif">
              "When I look back, I don't see hours. I see the mountains I
              climbed while writing my book."
            </h2>
            <div className="mt-16 flex items-center justify-center gap-6">
              <span className="text-[10px] tracking-[0.8em] uppercase opacity-30 font-bold">
                The Wayfarer's Journal
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-40 text-center relative">
        <motion.div {...fadeIn} className="px-6 relative z-10">
          <h2 className="text-6xl md:text-8xl font-medium tracking-tighter">
            Every step is <br /> a{" "}
            <span className="italic opacity-60 serif">return</span>.
          </h2>
          <Link href="/app">
            <button className="group relative text-[11px] tracking-[0.6em] uppercase font-black cursor-pointer overflow-hidden pb-2 mt-20">
              <span className="relative z-10">Start Your Journey</span>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-tactical scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </button>
          </Link>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tactical/5 rounded-full blur-[160px] pointer-events-none" />
        <div className="mt-40 opacity-20 text-[9px] tracking-[1em] uppercase">
          Focus Walker © 2026
        </div>
      </footer>
    </div>
  );
};
