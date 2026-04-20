"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  disabled: boolean;
  ready: boolean;
  missingField?: string | null;
}

export default function GenerateButton({ onClick, isGenerating, disabled, ready, missingField }: GenerateButtonProps) {
  const active = !disabled;

  return (
    <div className="space-y-3">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={active ? { filter: "brightness(1.08)" } : undefined}
        whileTap={active ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.1 }}
        className="relative w-full py-4 px-6 overflow-hidden font-bold uppercase tracking-[0.1em] text-xs flex items-center justify-center gap-3 transition-shadow duration-200"
        style={
          active
            ? {
                background: "linear-gradient(to bottom, #f59e0b, #ffc174)",
                color: "#613b00",
                borderRadius: "0.125rem",
                boxShadow: isGenerating
                  ? "0 12px 30px rgba(245,158,11,0.35)"
                  : "0 8px 20px rgba(245,158,11,0.25)",
                cursor: isGenerating ? "wait" : "pointer",
              }
            : {
                background: "#1c1b1c",
                color: "#534434",
                borderRadius: "0.125rem",
                cursor: "not-allowed",
              }
        }
      >
        {/* Shimmer sweep during generation */}
        {isGenerating && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
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
              <Loader2 className="animate-spin" size={16} strokeWidth={2} />
              Forging Manuscript…
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
              <Sparkles size={15} strokeWidth={1.75} />
              Forge Manuscript
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.p
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-[11px] uppercase tracking-[0.06em]"
            style={{ color: "#534434" }}
          >
            ~15 seconds · 3 distinct variations
          </motion.p>
        ) : missingField ? (
          <motion.p
            key={missingField}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-center text-[11px]"
            style={{ color: "#f59e0b" }}
          >
            {missingField}
          </motion.p>
        ) : ready ? (
          <motion.p
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-[11px] uppercase tracking-[0.06em]"
            style={{ color: "#534434" }}
          >
            ~15 seconds · 3 distinct variations
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
