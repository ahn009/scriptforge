"use client";

import { TONE_OPTIONS } from "@/lib/constants";
import type { Tone } from "@/lib/types";

interface ToneSelectorProps {
  value: Tone | null;
  onChange: (tone: Tone) => void;
  disabled?: boolean;
}

export default function ToneSelector({ value, onChange, disabled = false }: ToneSelectorProps) {
  return (
    <div className="w-full">
      <label
        className="block text-[0.6875rem] font-medium uppercase tracking-widest mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        Thematic Tone
      </label>

      <div
        className="flex p-1 w-full"
        style={{ background: "var(--bg-muted)", borderRadius: "0.125rem" }}
      >
        {TONE_OPTIONS.map((tone) => {
          const selected = value === tone.id;
          return (
            <button
              key={tone.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(tone.id)}
              className="flex-1 py-2 text-xs font-medium transition-all duration-150 cursor-pointer hover:text-[var(--text-primary)]"
              style={{
                background: selected ? "var(--sf-raised)" : "transparent",
                color: selected ? "var(--color-primary)" : "var(--text-tertiary)",
                borderRadius: "0.125rem",
                boxShadow: selected ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
              aria-pressed={selected}
            >
              {tone.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
