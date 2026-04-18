export type Tone = "dramatic" | "neutral" | "uplifting";
export type VideoLength = "1min" | "3min" | "5min" | "10min";

export interface GenerateRequest {
  prompt: string;
  tone: Tone;
  length: VideoLength;
}

export interface ToneOption {
  id: Tone;
  label: string;
  description: string;
  icon: string;
  color: string;
  colorDim: string;
}

export interface LengthOption {
  id: VideoLength;
  label: string;
  wordTarget: number;
  wordRange: string;
  sections: string;
}
