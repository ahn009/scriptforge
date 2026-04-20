"use client";

import { Flame, Scale, Sparkles, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
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
      <label
        className="block text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        Tone
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {TONE_OPTIONS.map((tone) => {
          const Icon = ICONS[tone.icon];
          const selected = value === tone.id;
          return (
            <motion.button
              key={tone.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(tone.id)}
              whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
              whileTap={disabled ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={clsx(
                "text-left p-4 rounded-xl border cursor-pointer",
                "focus-visible:outline-none",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              style={{
                background: selected ? tone.colorDim : "var(--bg-surface)",
                borderColor: selected ? tone.color : "var(--border)",
                borderLeftWidth: selected ? "3px" : "1px",
                boxShadow: selected
                  ? `0 0 20px -4px ${tone.color}35, 0 2px 8px rgba(0,0,0,0.1)`
                  : "0 1px 3px rgba(0,0,0,0.06)",
                transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
              }}
              aria-pressed={selected}
            >
              {Icon && (
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className="mb-3"
                  style={{ color: selected ? tone.color : "var(--text-tertiary)" }}
                />
              )}
              <span
                className="block text-sm font-semibold leading-tight"
                style={{ color: selected ? "var(--text-primary)" : "var(--text-secondary)" }}
              >
                {tone.label}
              </span>
              <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--text-muted)" }}>
                {tone.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
