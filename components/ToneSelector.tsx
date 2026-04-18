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
      <label className="block text-base font-semibold mb-2.5" style={{ color: "var(--text-primary)" }}>
        Tone
      </label>

      <div className="grid grid-cols-3 gap-2.5">
        {TONE_OPTIONS.map((tone) => {
          const Icon = ICONS[tone.icon];
          const selected = value === tone.id;
          return (
            <motion.button
              key={tone.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(tone.id)}
              whileTap={disabled ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className={clsx(
                "relative text-left px-3.5 py-3.5 rounded-xl border cursor-pointer",
                "transition-all duration-150 focus-visible:outline-none",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              style={{
                background: selected ? "var(--accent-light)" : "var(--bg-surface)",
                borderColor: selected ? "var(--accent)" : "var(--border)",
              }}
              aria-pressed={selected}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: selected ? tone.color : "var(--bg-muted)",
                    color: selected ? "#fff" : "var(--text-tertiary)",
                  }}
                >
                  {Icon && <Icon size={14} strokeWidth={1.75} />}
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: selected ? "var(--accent)" : "var(--text-primary)" }}
                >
                  {tone.label}
                </span>
              </div>
              <p className="text-xs leading-snug" style={{ color: "var(--text-muted)" }}>
                {tone.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
