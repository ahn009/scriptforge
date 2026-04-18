"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <>
      {/* Floating sticky header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="header-blur fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3"
      >
        <span
          className="font-display text-lg font-normal tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          ScriptForge
        </span>

        <div className="flex items-center gap-2">
          <span
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text-tertiary)", background: "var(--bg-surface)" }}
          >
            <Sparkles size={11} style={{ color: "var(--accent)" }} />
            Blue Foxes AI
          </span>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* Hero section below header */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center pt-24 pb-10 md:pt-28 md:pb-12"
      >
        <h1
          className="font-display text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.1]"
          style={{ color: "var(--text-primary)" }}
        >
          ScriptForge
        </h1>

        <p className="mt-4 text-base max-w-sm mx-auto leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          Turn your ideas into compelling video scripts — in seconds.
        </p>
      </motion.header>
    </>
  );
}
