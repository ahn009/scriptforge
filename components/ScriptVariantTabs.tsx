"use client";

import { motion } from "framer-motion";
import type { ScriptVariation, VariantId } from "@/lib/types";

interface ScriptVariantTabsProps {
  scripts: ScriptVariation[];
  activeId: VariantId;
  onSelect: (id: VariantId) => void;
}

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return "#22c55e";
  if (score >= 65) return "var(--accent)";
  return "var(--text-muted)";
};

const VARIANT_LABELS: Record<VariantId, string> = { A: "A", B: "B", C: "C" };

export default function ScriptVariantTabs({ scripts, activeId, onSelect }: ScriptVariantTabsProps) {
  return (
    <div className="mb-6">
      {/* Tab strip */}
      <div className="flex gap-2 mb-4">
        {scripts.map((s, i) => {
          const active = s.id === activeId;
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150 focus-visible:outline-none"
              style={
                active
                  ? {
                      background: "var(--accent-light)",
                      border: "1px solid var(--accent-border)",
                      color: "var(--text-primary)",
                    }
                  : {
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text-tertiary)",
                    }
              }
            >
              {/* Variant badge */}
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{
                  background: active ? "var(--accent)" : "var(--bg-muted)",
                  color: active ? "#0a0a0a" : "var(--text-muted)",
                }}
              >
                {VARIANT_LABELS[s.id]}
              </span>

              {/* Score */}
              <span className="text-xs font-semibold tabular-nums" style={{ color: SCORE_COLOR(s.viral_score) }}>
                {s.viral_score}
              </span>

              {/* Score bar */}
              <div
                className="w-12 h-1 rounded-full overflow-hidden hidden sm:block"
                style={{ background: "var(--bg-muted)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${s.viral_score}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                  style={{ background: SCORE_COLOR(s.viral_score) }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Active variant metadata */}
      {scripts.map((s) =>
        s.id === activeId ? (
          <motion.div
            key={s.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap items-center gap-3 px-1"
          >
            <MetaPill label="Hook" value={s.hook_type} />
            <MetaPill label="Structure" value={s.structure} />
            <ScoreBreakdown breakdown={s.score_breakdown} total={s.viral_score} />
          </motion.div>
        ) : null
      )}
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-tertiary)" }}
    >
      <span className="font-semibold uppercase tracking-wide text-[9px]" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      {value.replace(/-/g, " ")}
    </span>
  );
}

function ScoreBreakdown({ breakdown, total }: { breakdown: ScriptVariation["score_breakdown"]; total: number }) {
  const items = [
    { label: "Hook", value: breakdown.hook_strength, max: 30 },
    { label: "Curiosity", value: breakdown.curiosity_gap, max: 20 },
    { label: "Retention", value: breakdown.retention_flow, max: 20 },
    { label: "Emotion", value: breakdown.emotional_trigger, max: 15 },
    { label: "CTA", value: breakdown.cta_strength, max: 15 },
  ];

  return (
    <div
      className="ml-auto flex items-center gap-1 cursor-default"
      title={items.map((i) => `${i.label}: ${i.value}/${i.max}`).join(" · ")}
    >
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-0.5">
          <div
            className="w-1.5 rounded-full"
            style={{
              height: `${Math.round((item.value / item.max) * 20) + 4}px`,
              background: `color-mix(in srgb, var(--accent) ${Math.round((item.value / item.max) * 100)}%, var(--bg-muted))`,
              opacity: 0.85,
            }}
          />
        </div>
      ))}
      <span className="ml-2 text-xs font-bold tabular-nums" style={{ color: SCORE_COLOR(total) }}>
        {total}/100
      </span>
    </div>
  );
}
