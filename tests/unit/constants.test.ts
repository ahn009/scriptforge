import { describe, it, expect } from "vitest";
import { TONE_OPTIONS, LENGTH_OPTIONS, WORD_TARGETS } from "@/lib/constants";

describe("TONE_OPTIONS", () => {
  it("should have exactly 3 tones", () => {
    expect(TONE_OPTIONS).toHaveLength(3);
  });

  it("should include dramatic, neutral, uplifting", () => {
    const ids = TONE_OPTIONS.map((t) => t.id);
    expect(ids).toContain("dramatic");
    expect(ids).toContain("neutral");
    expect(ids).toContain("uplifting");
  });
});

describe("LENGTH_OPTIONS", () => {
  it("should have exactly 4 lengths", () => {
    expect(LENGTH_OPTIONS).toHaveLength(4);
  });

  it("word targets should increase with length", () => {
    const targets = LENGTH_OPTIONS.map((l) => l.wordTarget);
    for (let i = 1; i < targets.length; i++) {
      expect(targets[i]).toBeGreaterThan(targets[i - 1]);
    }
  });
});

describe("WORD_TARGETS", () => {
  it("should have min < target < max for each length", () => {
    Object.values(WORD_TARGETS).forEach(({ min, target, max }) => {
      expect(min).toBeLessThan(target);
      expect(target).toBeLessThan(max);
    });
  });
});
