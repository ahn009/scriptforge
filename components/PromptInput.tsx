"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export default function PromptInput({
  value,
  onChange,
  disabled = false,
  maxLength = 500,
}: PromptInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const count = value.length;
  const nearLimit = count > 400;

  return (
    <div className="w-full">
      <label
        htmlFor="prompt"
        className="block text-sm font-medium mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        Your content idea
      </label>

      <div className="relative">
        <textarea
          ref={ref}
          id="prompt"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder="What's your video about? e.g., The rise and fall of the Roman Empire, for a history-loving audience…"
          className={clsx(
            "w-full min-h-[140px] px-4 py-4 rounded-2xl",
            "text-base leading-relaxed",
            "border shadow-sm transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:shadow-md",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          style={{
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            borderColor: "var(--border)",
            "--tw-ring-color": "var(--border-focus)",
          } as React.CSSProperties}
          maxLength={maxLength}
          rows={5}
        />

        <span
          className="absolute bottom-3.5 right-4 text-xs tabular-nums pointer-events-none"
          style={{ color: nearLimit ? "var(--accent)" : "var(--text-muted)" }}
        >
          {count}/{maxLength}
        </span>
      </div>

      <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
        Tip: mention your target audience for better results
      </p>
    </div>
  );
}
