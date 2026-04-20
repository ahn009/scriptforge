"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onReset?: () => void;
}

export default function Header({ onReset }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 border-b backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--bg-base) 88%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }}
          aria-hidden
        />
        <span
          className="font-display text-xl font-normal tracking-tight select-none"
          style={{ color: "var(--text-primary)" }}
        >
          ScriptForge
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {onReset && (
            <motion.button
              key="reset"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150"
              style={{
                color: "var(--text-secondary)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              <RotateCcw size={13} strokeWidth={1.75} />
              <span className="hidden sm:inline">Reset</span>
            </motion.button>
          )}
        </AnimatePresence>

        <span
          className="hidden sm:block text-xs font-medium px-2.5 py-1 rounded-full"
          style={{
            color: "var(--text-muted)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          Blue Foxes AI
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
