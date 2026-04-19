"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8" />;

  function cycle() {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label = theme === "light" ? "Switch to dark" : theme === "dark" ? "Switch to system" : "Switch to light";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 cursor-pointer"
      style={{
        color: "var(--text-tertiary)",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <Icon size={15} strokeWidth={1.75} />
    </button>
  );
}
