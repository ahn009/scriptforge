"use client";

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
      <label
        className="block text-[0.6875rem] font-medium uppercase tracking-widest mb-3"
        style={{ color: "#e5e2e3" }}
      >
        Target Duration
      </label>

      <div
        className="flex p-1 w-full"
        style={{ background: "#201f20", borderRadius: "0.125rem" }}
      >
        {LENGTH_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className="flex-1 py-2 text-xs font-medium transition-all duration-150"
              style={{
                background: selected ? "#353436" : "transparent",
                color: selected ? "#ffc174" : "#a08e7a",
                borderRadius: "0.125rem",
                boxShadow: selected ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
              aria-pressed={selected}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
