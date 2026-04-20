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
      <label
        className="block text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        Video length
      </label>

      <div className="flex flex-wrap gap-2">
        {LENGTH_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.id)}
              whileHover={disabled ? undefined : { scale: 1.04, y: -1 }}
              whileTap={disabled ? undefined : { scale: 0.96 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium cursor-pointer",
                "focus-visible:outline-none border",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              style={
                selected
                  ? {
                      background: "var(--accent)",
                      color: "#0a0a0a",
                      borderColor: "var(--accent)",
                      boxShadow: "0 0 14px rgba(245,158,11,0.30)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--text-tertiary)",
                      borderColor: "var(--border)",
                      transition: "background 0.12s, color 0.12s, border-color 0.12s",
                    }
              }
              aria-pressed={selected}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
