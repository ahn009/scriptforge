"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import clsx from "clsx";

interface GenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  disabled: boolean;
  ready: boolean;
}

export default function GenerateButton({ onClick, isGenerating, disabled, ready }: GenerateButtonProps) {
  return (
    <div className="space-y-2">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? undefined : { opacity: 0.9 }}
        whileTap={disabled ? undefined : { scale: 0.995 }}
        transition={{ duration: 0.1 }}
        className={clsx(
          "relative w-full py-3.5 px-5 rounded-2xl",
          "font-medium text-[15px]",
          "flex items-center justify-center gap-2",
          "transition-all duration-150 focus-visible:outline-none",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
        style={
          disabled
            ? { background: "var(--bg-muted)", color: "var(--text-muted)", border: "1px solid var(--border)" }
            : {
                background: "var(--accent)",
                color: "#ffffff",
                border: "none",
                boxShadow: ready ? "0 4px 14px rgba(217,119,6,0.25)" : "none",
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
              Generating…
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              Generate script
              {ready && <ArrowRight size={15} />}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
        {ready && !isGenerating
          ? "~12 seconds · free to use"
          : "Fill in all fields above to continue"}
      </p>
    </div>
  );
}
