"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Menu, X, History, Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onReset?: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ onReset, sidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header
      className="h-14 shrink-0 flex items-center justify-between px-5 md:px-8 z-30 w-full"
      style={{
        background: "var(--sf-canvas)",
        boxShadow: "0px 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Left — hamburger toggle */}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
        className="flex items-center justify-center w-8 h-8 transition-colors duration-200 cursor-pointer hover:opacity-80"
        style={{ color: sidebarOpen ? "var(--color-primary)" : "var(--text-tertiary)" }}
      >
        {sidebarOpen ? (
          <X size={18} strokeWidth={1.75} />
        ) : (
          <Menu size={18} strokeWidth={1.75} />
        )}
      </button>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="transition-colors duration-200 cursor-pointer hover:opacity-80 hidden sm:flex"
          style={{ color: "var(--text-muted)" }}
          aria-label="History"
        >
          <History size={16} strokeWidth={1.5} />
        </button>

        <button
          type="button"
          className="transition-colors duration-200 cursor-pointer hover:opacity-80 hidden sm:flex"
          style={{ color: "var(--text-muted)" }}
          aria-label="Settings"
        >
          <Settings size={16} strokeWidth={1.5} />
        </button>

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
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-colors cursor-pointer hover:opacity-80"
              style={{
                color: "var(--text-tertiary)",
                background: "var(--sf-panel)",
                borderRadius: "0.125rem",
              }}
            >
              <RotateCcw size={11} strokeWidth={1.75} />
              <span className="hidden sm:inline">Reset</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Avatar */}
        <div
          className="w-8 h-8 flex items-center justify-center text-[11px] font-bold select-none shrink-0"
          style={{
            background: "var(--sf-interactive)",
            borderRadius: "50%",
            color: "var(--accent)",
          }}
        >
          BF
        </div>
      </div>
    </header>
  );
}
