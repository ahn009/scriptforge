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
      <label className="block text-sm font-medium mb-2 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        Video length
      </label>

      <div className="flex flex-wrap gap-2">
        {LENGTH_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium cursor-pointer",
                "transition-all duration-150 focus-visible:outline-none border",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              style={
                selected
                  ? {
                      background: "var(--btn-primary-bg)",
                      color: "var(--btn-primary-text)",
                      borderColor: "var(--btn-primary-bg)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--text-tertiary)",
                      borderColor: "var(--border)",
                    }
              }
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
