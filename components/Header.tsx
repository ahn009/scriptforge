"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="text-center pt-12 pb-10 md:pt-16 md:pb-12"
    >
      <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full border"
        style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
      >
        <Sparkles size={12} style={{ color: "var(--accent)" }} />
        <span className="text-[11px] font-medium tracking-wide" style={{ color: "var(--text-tertiary)" }}>
          Blue Foxes AI
        </span>
      </div>

      <h1
        className="font-display text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.1]"
        style={{ color: "var(--text-primary)" }}
      >
        ScriptForge
      </h1>

      <p className="mt-4 text-base font-body max-w-sm mx-auto leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
        Turn your ideas into compelling video scripts — in seconds.
      </p>
    </motion.header>
  );
}
