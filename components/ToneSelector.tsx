"use client";

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
      <label className="block text-sm font-medium mb-2 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        Tone
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TONE_OPTIONS.map((tone) => {
          const Icon = ICONS[tone.icon];
          const selected = value === tone.id;
          return (
            <button
              key={tone.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(tone.id)}
              className={clsx(
                "text-left p-4 rounded-xl border cursor-pointer",
                "transition-all duration-150 focus-visible:outline-none",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              style={{
                background: selected
                  ? "color-mix(in srgb, var(--accent) 8%, var(--bg-surface))"
                  : "var(--bg-surface)",
                borderColor: selected ? "var(--accent-border)" : "var(--border)",
                boxShadow: selected ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
              }}
              aria-pressed={selected}
            >
              {Icon && (
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className="mb-3"
                  style={{ color: selected ? "var(--accent)" : "var(--text-tertiary)" }}
                />
              )}
              <span
                className="block text-sm font-medium"
                style={{ color: selected ? "var(--text-primary)" : "var(--text-secondary)" }}
              >
                {tone.label}
              </span>
              <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--text-muted)" }}>
                {tone.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
