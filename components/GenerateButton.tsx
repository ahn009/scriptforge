"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import clsx from "clsx";

interface GenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  disabled: boolean;
  ready: boolean;
}

export default function GenerateButton({ onClick, isGenerating, disabled, ready }: GenerateButtonProps) {
  return (
    <div className="space-y-3 mt-8">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? undefined : { opacity: 0.88 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.1 }}
        className={clsx(
          "relative w-full py-4 px-6 rounded-2xl",
          "font-medium text-base",
          "flex items-center justify-center gap-2.5",
          "transition-all duration-150 focus-visible:outline-none",
          disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer",
        )}
        style={
          disabled
            ? {
                background: "var(--bg-surface)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }
            : {
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#111111",
                border: "none",
                boxShadow: "0 4px 24px rgba(245,158,11,0.30), 0 1px 4px rgba(0,0,0,0.12)",
              }
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {isGenerating ? (
            <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={17} />
              Generating…
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2">
              <Sparkles size={16} strokeWidth={1.75} />
              Generate script
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
        {ready && !isGenerating ? "~12 seconds · free to use" : "Fill in all fields above to continue"}
      </p>
    </div>
  );
}
