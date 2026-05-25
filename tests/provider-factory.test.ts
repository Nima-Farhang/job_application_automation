import { describe, expect, it } from "vitest";
import type { AppSettings } from "../src/config/settings.js";
import { FakeTextGenerationProvider } from "../src/providers/fake-provider.js";
import { GeminiTextGenerationProvider } from "../src/providers/gemini-provider.js";
import { OpenAITextGenerationProvider } from "../src/providers/openai-provider.js";
import { createReviewerProvider, createTextGenerationProvider } from "../src/providers/provider-factory.js";

describe("provider factory", () => {
  it("keeps fake as the default text and reviewer provider", () => {
    const settings: AppSettings = {
      textProvider: "fake",
      reviewerProvider: "fake",
    };

    expect(createTextGenerationProvider(settings)).toBeInstanceOf(FakeTextGenerationProvider);
    expect(createReviewerProvider(settings)).toBeInstanceOf(FakeTextGenerationProvider);
  });

  it("creates an OpenAI text provider when selected", () => {
    const settings: AppSettings = {
      textProvider: "openai",
      reviewerProvider: "fake",
      openai: {
        apiKey: "openai-key",
        model: "gpt-test",
        baseUrl: "https://api.openai.test/v1",
      },
    };

    expect(createTextGenerationProvider(settings)).toBeInstanceOf(OpenAITextGenerationProvider);
  });

  it("creates a Gemini reviewer provider when selected", () => {
    const settings: AppSettings = {
      textProvider: "fake",
      reviewerProvider: "gemini",
      gemini: {
        apiKey: "gemini-key",
        model: "gemini-test",
      },
    };

    expect(createReviewerProvider(settings)).toBeInstanceOf(GeminiTextGenerationProvider);
  });
});
