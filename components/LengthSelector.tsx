"use client";

import { motion } from "framer-motion";
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
      <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
        Video length
      </label>

      <div className="grid grid-cols-4 gap-2.5">
        {LENGTH_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.id)}
              whileTap={disabled ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={clsx(
                "flex flex-col items-center justify-center py-3 px-2 rounded-xl border cursor-pointer",
                "transition-all duration-150 focus-visible:outline-none",
                disabled && "opacity-60 cursor-not-allowed",
              )}
              style={{
                background: selected ? "var(--accent-light)" : "var(--bg-surface)",
                borderColor: selected ? "var(--accent-border)" : "var(--border)",
                boxShadow: selected ? "0 0 0 2px var(--accent-border)" : "none",
              }}
              aria-pressed={selected}
            >
              <span
                className="text-base font-semibold font-display leading-tight"
                style={{ color: selected ? "var(--accent)" : "var(--text-primary)" }}
              >
                {option.label}
              </span>
              <span
                className="mt-0.5 text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                ~{option.wordTarget}w
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
