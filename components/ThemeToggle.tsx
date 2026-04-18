"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  function cycle() {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  }

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label = theme === "dark" ? "Switch to light" : theme === "light" ? "Switch to system" : "Switch to dark";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150"
      style={{
        color: "var(--text-tertiary)",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  );
}
