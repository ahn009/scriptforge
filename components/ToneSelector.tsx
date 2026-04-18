"use client";

import { motion } from "framer-motion";
import { Flame, Scale, Sparkles, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { TONE_OPTIONS } from "@/lib/constants";
import type { Tone } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  Flame,
  Scale,
  Sparkles,
};

interface ToneSelectorProps {
  value: Tone | null;
  onChange: (tone: Tone) => void;
  disabled?: boolean;
}

export default function ToneSelector({
  value,
  onChange,
  disabled = false,
}: ToneSelectorProps) {
  return (
    <div className="w-full">
      <label className="block font-display text-sm tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-3 flex items-center gap-2">
        <Flame size={14} className="text-[var(--accent-dramatic)]" />
        Choose Tone
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TONE_OPTIONS.map((tone) => {
          const Icon = ICONS[tone.icon];
          const selected = value === tone.id;
          return (
            <motion.button
              key={tone.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(tone.id)}
              whileHover={disabled ? undefined : { y: -1 }}
              whileTap={disabled ? undefined : { scale: 0.985 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={clsx(
                "relative text-left overflow-hidden",
                "glass-card px-4 py-4 rounded-2xl cursor-pointer",
                "transition-colors duration-200",
                "border-l-[3px]",
                "focus-visible:outline-none",
                !selected && "border-l-transparent hover:bg-[var(--bg-card-hover)]",
                selected && "shadow-lg",
                disabled && "opacity-60 cursor-not-allowed",
              )}
              style={{
                background: selected ? tone.colorDim : undefined,
                borderLeftColor: selected ? tone.color : undefined,
                transform: selected ? "scale(1.015)" : undefined,
              }}
              aria-pressed={selected}
            >
              {selected && (
                <motion.div
                  layoutId="tone-glow"
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    boxShadow: `0 0 30px ${tone.colorDim} inset`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}

              <div className="relative flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: selected ? tone.color : "rgba(255,255,255,0.04)",
                    color: selected ? "#0A0A0B" : "var(--text-secondary)",
                    transition: "all 200ms ease",
                  }}
                >
                  {Icon && <Icon size={18} strokeWidth={2} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={clsx(
                      "font-body font-semibold text-base leading-tight",
                      selected ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]",
                    )}
                  >
                    {tone.label}
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)] leading-snug">
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
