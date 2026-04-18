"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Wand2, ArrowRight } from "lucide-react";
import clsx from "clsx";

interface GenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  disabled: boolean;
  ready: boolean;
}

export default function GenerateButton({
  onClick,
  isGenerating,
  disabled,
  ready,
}: GenerateButtonProps) {
  return (
    <div className="space-y-2">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.005 }}
        whileTap={disabled ? undefined : { scale: 0.995 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={clsx(
          "relative w-full py-3 px-5 rounded-xl",
          "font-body font-medium text-sm",
          "transition-all duration-200",
          "flex items-center justify-center gap-2",
          "focus-visible:outline-none",
          disabled
            ? "bg-[var(--bg-card-hover)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
            : "bg-[var(--accent-amber)] text-white border-none",
          !disabled && ready && !isGenerating && "shadow-md",
        )}
        style={
          disabled
            ? undefined
            : {
                boxShadow: "0 2px 8px rgba(217, 119, 6, 0.25)",
              }
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {isGenerating ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="animate-spin" size={16} />
              Generating...
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Wand2 size={16} />
              Generate Script
              <ArrowRight size={14} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {!disabled && ready && !isGenerating && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[10px] text-[var(--text-muted)]"
        >
          ~12 seconds · No credit card required
        </motion.p>
      )}

      {disabled && !ready && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[10px] text-[var(--text-muted)]"
        >
          Fill in all fields to generate
        </motion.p>
      )}
    </div>
  );
}
