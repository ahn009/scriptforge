"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <>
      {/* Floating sticky navbar — full viewport width */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="header-blur fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5"
      >
        <span
          className="font-display text-2xl font-normal tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          ScriptForge
        </span>

        <div className="flex items-center gap-3">
          <span
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text-tertiary)", background: "var(--bg-surface)" }}
          >
            <Sparkles size={13} style={{ color: "var(--accent)" }} />
            Blue Foxes AI
          </span>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* Hero — offset below the fixed navbar (navbar height ~72px so pt-28) */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center pt-32 pb-12"
      >
        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[1.1]"
          style={{ color: "var(--text-primary)" }}
        >
          ScriptForge
        </h1>

        <p
          className="mt-5 text-lg sm:text-xl max-w-md mx-auto leading-relaxed"
          style={{ color: "var(--text-tertiary)" }}
        >
          Turn your ideas into compelling video scripts — in seconds.
        </p>
      </motion.header>
    </>
  );
}
