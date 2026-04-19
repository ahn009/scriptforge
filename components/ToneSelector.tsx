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
      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
        Tone
      </label>

      <div className="grid grid-cols-3 gap-2">
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
                "text-left px-4 py-3 rounded-xl border cursor-pointer",
                "transition-all duration-150 focus-visible:outline-none",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              style={{
                background: selected ? "var(--bg-base)" : "var(--bg-surface)",
                borderColor: selected ? "var(--accent-border)" : "transparent",
                boxShadow: selected ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
              }}
              aria-pressed={selected}
            >
              <div className="flex items-center gap-2 mb-1">
                {Icon && (
                  <Icon
                    size={15}
                    strokeWidth={1.5}
                    style={{ color: selected ? "var(--accent)" : "var(--text-tertiary)" }}
                  />
                )}
                <span
                  className="text-sm font-medium"
                  style={{ color: selected ? "var(--text-primary)" : "var(--text-secondary)" }}
                >
                  {tone.label}
                </span>
              </div>
              <p className="text-xs leading-snug" style={{ color: "var(--text-muted)" }}>
                {tone.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
