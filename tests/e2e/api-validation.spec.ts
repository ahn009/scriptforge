import { test, expect } from "@playwright/test";

test.describe("API Route Validation", () => {
  const API_URL = "http://localhost:3000/api/generate";

  test("should reject empty prompt", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { prompt: "", tone: "dramatic", length: "3min" },
    });
    expect(response.status()).toBe(400);
  });

  test("should reject invalid tone", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { prompt: "test prompt here", tone: "invalid", length: "3min" },
    });
    expect(response.status()).toBe(400);
  });

  test("should reject invalid length", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { prompt: "test prompt here", tone: "dramatic", length: "99min" },
    });
    expect(response.status()).toBe(400);
  });

  test("should reject too-short prompt", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { prompt: "ab", tone: "dramatic", length: "3min" },
    });
    expect(response.status()).toBe(400);
  });

  test("should reject too-long prompt", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { prompt: "A".repeat(501), tone: "dramatic", length: "3min" },
    });
    expect(response.status()).toBe(400);
  });

  test("should reject missing fields", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { prompt: "test" },
    });
    expect(response.status()).toBe(400);
  });
});
