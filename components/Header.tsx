"use client";

import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 border-b backdrop-blur-md shadow-sm dark:shadow-none"
      style={{
        background: "color-mix(in srgb, var(--bg-base) 85%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="w-2 h-2 rounded-full"
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

      <div className="flex items-center gap-3">
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
