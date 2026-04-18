"use client";

import PromptInput from "@/components/PromptInput";
import ToneSelector from "@/components/ToneSelector";
import LengthSelector from "@/components/LengthSelector";
import GenerateButton from "@/components/GenerateButton";
import type { Tone, VideoLength } from "@/lib/types";

interface ScriptFormProps {
  prompt: string;
  tone: Tone | null;
  length: VideoLength | null;
  isGenerating: boolean;
  onPromptChange: (value: string) => void;
  onToneChange: (tone: Tone) => void;
  onLengthChange: (length: VideoLength) => void;
  onGenerate: () => void;
}

export default function ScriptForm({
  prompt,
  tone,
  length,
  isGenerating,
  onPromptChange,
  onToneChange,
  onLengthChange,
  onGenerate,
}: ScriptFormProps) {
  const ready = Boolean(prompt.trim() && tone && length);

  return (
    <div className="space-y-7 md:space-y-8">
      <PromptInput value={prompt} onChange={onPromptChange} disabled={isGenerating} />
      <ToneSelector value={tone} onChange={onToneChange} disabled={isGenerating} />
      <LengthSelector value={length} onChange={onLengthChange} disabled={isGenerating} />
      <GenerateButton
        onClick={onGenerate}
        isGenerating={isGenerating}
        disabled={!ready || isGenerating}
        ready={ready}
      />
    </div>
  );
}
