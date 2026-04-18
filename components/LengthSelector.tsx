"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import clsx from "clsx";
import { LENGTH_OPTIONS } from "@/lib/constants";
import type { VideoLength } from "@/lib/types";

interface LengthSelectorProps {
  value: VideoLength | null;
  onChange: (length: VideoLength) => void;
  disabled?: boolean;
}

export default function LengthSelector({
  value,
  onChange,
  disabled = false,
}: LengthSelectorProps) {
  return (
    <div className="w-full">
      <label className="block font-display text-sm tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-3 flex items-center gap-2">
        <Clock size={14} className="text-[var(--accent-neutral)]" />
        Video Duration
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LENGTH_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.id)}
              whileHover={disabled ? undefined : { y: -1 }}
              whileTap={disabled ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={clsx(
                "relative flex flex-col items-center justify-center",
                "px-4 py-3 rounded-2xl cursor-pointer transition-colors duration-200",
                "border focus-visible:outline-none",
                !selected &&
                  "border-[var(--border-subtle)] bg-transparent hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-medium)]",
                disabled && "opacity-60 cursor-not-allowed",
              )}
              style={
                selected
                  ? {
                      background: "var(--accent-amber)",
                      color: "#0A0A0B",
                      borderColor: "var(--accent-amber)",
                      boxShadow: "0 0 24px rgba(232,168,73,0.25)",
                    }
                  : undefined
              }
              aria-pressed={selected}
            >
              <span
                className={clsx(
                  "font-display text-lg font-semibold leading-tight",
                  !selected && "text-[var(--text-primary)]",
                )}
              >
                {option.label}
              </span>
              <span
                className={clsx(
                  "mt-0.5 text-[10px] tracking-wide",
                  selected
                    ? "text-[rgba(10,10,11,0.65)]"
                    : "text-[var(--text-tertiary)]",
                )}
              >
                ~{option.wordTarget} words
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
