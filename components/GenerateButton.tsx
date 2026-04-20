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
  const active = !disabled;

  return (
    <div className="space-y-3">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={active ? { scale: 1.01, filter: "brightness(1.1)" } : undefined}
        whileTap={active ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.12 }}
        className={clsx(
          "relative w-full py-4 px-6 rounded-2xl overflow-hidden",
          "font-semibold text-base tracking-wide",
          "flex items-center justify-center gap-2.5",
          "focus-visible:outline-none",
          disabled && !isGenerating ? "cursor-not-allowed" : "cursor-pointer",
        )}
        style={
          active
            ? {
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 60%, #b45309 100%)",
                color: "#0a0a0a",
                border: "none",
                boxShadow: "0 0 0 1px rgba(245,158,11,0.3), 0 4px 28px rgba(245,158,11,0.35), 0 1px 4px rgba(0,0,0,0.2)",
              }
            : {
                background: "var(--bg-surface)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                boxShadow: "none",
              }
        }
      >
        {/* Shimmer sweep during generation */}
        {isGenerating && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {isGenerating ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5 relative z-10"
            >
              <Loader2 className="animate-spin" size={17} strokeWidth={2} />
              Generating…
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5"
            >
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
