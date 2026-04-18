"use client";

import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <>
      {/* Top-right icon strip — minimal, no full-width bar */}
      <div className="fixed top-0 right-0 z-50 flex items-center gap-1 p-4">
        <ThemeToggle />
      </div>

      {/* Centered hero */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="text-center pt-16 pb-10"
      >
        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[1.08]"
          style={{ color: "var(--text-primary)" }}
        >
          ScriptForge AI
        </h1>

        <p
          className="mt-4 text-lg sm:text-xl leading-relaxed"
          style={{ color: "var(--text-tertiary)" }}
        >
          Turn your ideas into compelling video scripts
        </p>
        <p
          className="mt-1 text-lg sm:text-xl italic font-display"
          style={{ color: "var(--text-tertiary)" }}
        >
          — in seconds.
        </p>
      </motion.header>
    </>
  );
}
