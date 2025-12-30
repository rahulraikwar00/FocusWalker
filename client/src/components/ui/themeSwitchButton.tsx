import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export const ThemeToggleButton = ({
  isDark,
  toggleTheme,
}: {
  isDark: boolean;
  toggleTheme: () => void;
}) => {
  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-20 h-10 p-1 rounded-full bg-(--text-secondary)/10 transition-colors cursor-pointer"
    >
      {/* 1. Labels Layer (Inside the button, behind the circle) */}
      <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-tight text-(--text-secondary) pointer-events-none">
        <span
          className={`transition-opacity duration-300 ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
        >
          Light
        </span>
        <span
          className={`transition-opacity duration-300 ${
            !isDark ? "opacity-100" : "opacity-0"
          }`}
        >
          Dark
        </span>
      </div>

      {/* 2. The Sliding Circle */}
      <motion.div
        animate={{ x: isDark ? 40 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="z-10 flex items-center justify-center w-8 h-8 rounded-full bg-(--accent-primary) shadow-sm"
      >
        {isDark ? (
          <Moon size={14} className="text-(--bg-page)" fill="currentColor" />
        ) : (
          <Sun size={14} className="text-(--bg-page)" fill="currentColor" />
        )}
      </motion.div>
    </button>
  );
};
