"use client";

import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-5 sm:px-8 border-b backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--bg-base) 85%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <span
        className="font-display text-xl font-medium tracking-tight select-none"
        style={{ color: "var(--text-primary)" }}
      >
        ScriptForge
      </span>

      <div className="flex items-center gap-3">
        <span
          className="hidden sm:block text-xs font-medium px-2 py-0.5 rounded-full"
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
