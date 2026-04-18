"use client";

import clsx from "clsx";
import { LENGTH_OPTIONS } from "@/lib/constants";
import type { VideoLength } from "@/lib/types";

interface LengthSelectorProps {
  value: VideoLength | null;
  onChange: (length: VideoLength) => void;
  disabled?: boolean;
}

export default function LengthSelector({ value, onChange, disabled = false }: LengthSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
        Video length
      </label>

      <div className="flex gap-2">
        {LENGTH_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={clsx(
                "flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border cursor-pointer",
                "transition-all duration-200 focus-visible:outline-none flex-1",
                disabled && "opacity-60 cursor-not-allowed",
              )}
              style={{
                background: selected ? "var(--bg-muted)" : "var(--bg-surface)",
                borderColor: selected ? "var(--accent-border)" : "var(--border)",
              }}
              aria-pressed={selected}
            >
              <span
                className="text-sm font-semibold font-display leading-tight"
                style={{ color: selected ? "var(--accent)" : "var(--text-primary)" }}
              >
                {option.label}
              </span>
              <span className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                ~{option.wordTarget}w
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
