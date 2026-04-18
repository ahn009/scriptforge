"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative text-center pt-8 pb-8 md:pt-10 md:pb-10"
    >
      <div className="relative">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-amber)] opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent-amber)]" />
          </span>
          <span className="text-[10px] tracking-wider uppercase text-[var(--text-secondary)] font-medium">
            Blue Foxes AI
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-[1.05] text-[var(--text-primary)]">
          ScriptForge
        </h1>

        <p className="mt-3 text-sm text-[var(--text-secondary)] font-body max-w-md mx-auto leading-relaxed">
          AI-powered video script generator. Shape a story, pick a tone, hit the length.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-5 flex items-center justify-center gap-3 text-[11px] text-[var(--text-muted)] font-medium"
        >
          <span>12,847+ scripts</span>
          <span className="w-1 h-1 rounded-full bg-[var(--border-medium)]" />
          <span>98% success</span>
          <span className="w-1 h-1 rounded-full bg-[var(--border-medium)]" />
          <span>Free to start</span>
        </motion.div>
      </div>
    </motion.header>
  );
}
