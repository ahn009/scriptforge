"use client";

import { motion } from "framer-motion";
import { Flame, Scale, Sparkles, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { TONE_OPTIONS } from "@/lib/constants";
import type { Tone } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = { Flame, Scale, Sparkles };

interface ToneSelectorProps {
  value: Tone | null;
  onChange: (tone: Tone) => void;
  disabled?: boolean;
}

export default function ToneSelector({ value, onChange, disabled = false }: ToneSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
        Tone
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {TONE_OPTIONS.map((tone) => {
          const Icon = ICONS[tone.icon];
          const selected = value === tone.id;
          return (
            <motion.button
              key={tone.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(tone.id)}
              whileTap={disabled ? undefined : { scale: 0.985 }}
              transition={{ duration: 0.15 }}
              className={clsx(
                "relative text-left px-4 py-3.5 rounded-xl border cursor-pointer",
                "transition-all duration-150",
                "focus-visible:outline-none",
                disabled && "opacity-60 cursor-not-allowed",
              )}
              style={{
                background: selected ? "var(--accent-light)" : "var(--bg-surface)",
                borderColor: selected ? "var(--accent-border)" : "var(--border)",
                boxShadow: selected ? "0 0 0 1.5px var(--accent-border)" : "none",
              }}
              aria-pressed={selected}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: selected ? tone.color : "var(--bg-muted)",
                    color: selected ? "#fff" : "var(--text-tertiary)",
                  }}
                >
                  {Icon && <Icon size={14} strokeWidth={1.75} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {tone.label}
                  </div>
                  <div className="mt-0.5 text-xs leading-snug" style={{ color: "var(--text-tertiary)" }}>
                    {tone.description}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
