"use client";

import { motion } from "framer-motion";
import type { ScriptVariation, VariantId } from "@/lib/types";

interface ScriptVariantTabsProps {
  scripts: ScriptVariation[];
  activeId: VariantId;
  onSelect: (id: VariantId) => void;
}

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return "#34d399";
  if (score >= 65) return "#f59e0b";
  return "#a08e7a";
};

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
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium cursor-pointer transition-all duration-150"
              style={{
                background: active ? "#1c1b1c" : "#0e0e0f",
                borderBottom: `2px solid ${active ? "#f59e0b" : "transparent"}`,
                color: active ? "#e5e2e3" : "#534434",
              }}
            >
              {/* Variant badge */}
              <span
                className="w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{
                  background: active ? "#f59e0b" : "#201f20",
                  color: active ? "#472a00" : "#a08e7a",
                  borderRadius: "0.125rem",
                }}
              >
                {s.id}
              </span>

              <span className="font-semibold tabular-nums" style={{ color: SCORE_COLOR(s.viral_score) }}>
                {s.viral_score}
              </span>

              <div
                className="w-10 h-0.5 overflow-hidden hidden sm:block"
                style={{ background: "#201f20" }}
              >
                <motion.div
                  className="h-full"
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
            className="flex flex-wrap items-center gap-3 px-1 mb-6"
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
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs"
      style={{
        background: "#1c1b1c",
        color: "#a08e7a",
        borderRadius: "0.75rem",
      }}
    >
      <span className="font-semibold uppercase tracking-wide text-[9px]" style={{ color: "#534434" }}>
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
              background: `color-mix(in srgb, #f59e0b ${Math.round((item.value / item.max) * 100)}%, #201f20)`,
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
