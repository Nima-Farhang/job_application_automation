import { describe, expect, it } from "vitest";
import { loadSettings } from "../src/config/settings.js";

describe("loadSettings", () => {
  it("defaults text and reviewer providers to fake without requiring credentials", () => {
    const settings = loadSettings({});

    expect(settings).toEqual({
      textProvider: "fake",
      reviewerProvider: "fake",
      openai: undefined,
      gemini: undefined,
    });
  });

  it("infers live providers from configured credentials", () => {
    const settings = loadSettings({
      OPENAI_API_KEY: "openai-key",
      GEMINI_API_KEY: "gemini-key",
    });

    expect(settings.textProvider).toBe("openai");
    expect(settings.reviewerProvider).toBe("gemini");
    expect(settings.openai?.apiKey).toBe("openai-key");
    expect(settings.gemini?.apiKey).toBe("gemini-key");
  });

  it("allows explicit fake providers to override configured credentials", () => {
    const settings = loadSettings({
      TEXT_PROVIDER: "fake",
      REVIEWER_PROVIDER: "fake",
      OPENAI_API_KEY: "openai-key",
      GEMINI_API_KEY: "gemini-key",
    });

    expect(settings).toEqual({
      textProvider: "fake",
      reviewerProvider: "fake",
      openai: undefined,
      gemini: undefined,
    });
  });

  it("normalizes selected provider names", () => {
    const settings = loadSettings({
      TEXT_PROVIDER: " OpenAI ",
      REVIEWER_PROVIDER: " GEMINI ",
      OPENAI_API_KEY: "openai-key",
      GEMINI_API_KEY: "gemini-key",
    });

    expect(settings.textProvider).toBe("openai");
    expect(settings.reviewerProvider).toBe("gemini");
  });

  it("validates OpenAI settings only when OpenAI is selected", () => {
    expect(() =>
      loadSettings({
        TEXT_PROVIDER: "fake",
        REVIEWER_PROVIDER: "fake",
        OPENAI_BASE_URL: "not-a-url",
      }),
    ).not.toThrow();

    expect(() =>
      loadSettings({
        TEXT_PROVIDER: "openai",
      }),
    ).toThrow("OPENAI_API_KEY is required when OpenAI is selected.");
  });

  it("provides OpenAI defaults when OpenAI is selected", () => {
    const settings = loadSettings({
      TEXT_PROVIDER: "openai",
      OPENAI_API_KEY: "openai-key",
    });

    expect(settings.openai).toEqual({
      apiKey: "openai-key",
      model: "gpt-5",
      baseUrl: "https://api.openai.com/v1",
    });
  });

  it("validates Gemini settings only when Gemini is selected", () => {
    expect(() =>
      loadSettings({
        TEXT_PROVIDER: "fake",
        REVIEWER_PROVIDER: "fake",
      }),
    ).not.toThrow();

    expect(() =>
      loadSettings({
        REVIEWER_PROVIDER: "gemini",
      }),
    ).toThrow("GEMINI_API_KEY is required when Gemini is selected.");
  });

  it("provides Gemini defaults when Gemini is selected", () => {
    const settings = loadSettings({
      REVIEWER_PROVIDER: "gemini",
      GEMINI_API_KEY: "gemini-key",
    });

    expect(settings.gemini).toEqual({
      apiKey: "gemini-key",
      model: "gemini-2.5-pro",
    });
  });

  it("rejects unknown providers clearly", () => {
    expect(() => loadSettings({ TEXT_PROVIDER: "anthropic" })).toThrow("TEXT_PROVIDER");
  });

  it("does not expose secret values in validation messages", () => {
    expect(() =>
      loadSettings({
        TEXT_PROVIDER: "openai",
        OPENAI_API_KEY: "super-secret-key",
        OPENAI_BASE_URL: "not-a-url",
      }),
    ).toThrow(/Invalid OpenAI configuration: OPENAI_BASE_URL/);
  });
});
