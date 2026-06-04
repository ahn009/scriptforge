import { describe, expect, it } from "vitest";
import {
  addResponseBudgetOverride,
  affordableMaxTokensFromError,
} from "@/app/api/generate/route";

describe("affordableMaxTokensFromError", () => {
  it("extracts a retry budget from OpenRouter credit errors", () => {
    const message =
      "This request requires more credits, or fewer max_tokens. You requested up to 3000 tokens, but can only afford 899.";

    expect(affordableMaxTokensFromError(message)).toBe(867);
  });

  it("ignores unrelated provider errors", () => {
    expect(affordableMaxTokensFromError("OpenRouter request failed with status 500")).toBeNull();
  });
});

describe("addResponseBudgetOverride", () => {
  it("adds compact-output instructions when the retry budget is lower than recommended", () => {
    const prompt = addResponseBudgetOverride("base prompt", 867, 3000);

    expect(prompt).toContain("base prompt");
    expect(prompt).toContain("Complete valid JSON is more important than exact word targets");
    expect(prompt).toContain("65 words or fewer");
  });

  it("leaves the prompt unchanged when the recommended budget is available", () => {
    expect(addResponseBudgetOverride("base prompt", 3000, 3000)).toBe("base prompt");
  });
});
