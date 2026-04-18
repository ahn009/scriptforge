import { describe, it, expect } from "vitest";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompts";

describe("buildSystemPrompt", () => {
  it("should include dramatic tone directives", () => {
    const prompt = buildSystemPrompt("dramatic", "3min");
    expect(prompt).toContain("DRAMATIC");
    expect(prompt).toContain("[PAUSE]");
  });

  it("should include neutral tone directives", () => {
    const prompt = buildSystemPrompt("neutral", "3min");
    expect(prompt).toContain("NEUTRAL");
    expect(prompt).toContain("factual");
  });

  it("should include uplifting tone directives", () => {
    const prompt = buildSystemPrompt("uplifting", "3min");
    expect(prompt).toContain("UPLIFTING");
    expect(prompt).toContain("inspiring");
  });

  it("should include correct word target for 1min", () => {
    const prompt = buildSystemPrompt("neutral", "1min");
    expect(prompt).toContain("150");
  });

  it("should include correct word target for 10min", () => {
    const prompt = buildSystemPrompt("neutral", "10min");
    expect(prompt).toContain("1500");
  });

  it("should have more sections for longer videos", () => {
    const short = buildSystemPrompt("neutral", "1min");
    const long = buildSystemPrompt("neutral", "10min");
    const shortSections = (short.match(/SECTION/g) || []).length;
    const longSections = (long.match(/SECTION/g) || []).length;
    expect(longSections).toBeGreaterThan(shortSections);
  });
});

describe("buildUserMessage", () => {
  it("should include the prompt text", () => {
    const msg = buildUserMessage("Cleopatra");
    expect(msg).toContain("Cleopatra");
  });
});
