import { describe, expect, it, vi } from "vitest";
import { GeminiTextGenerationProvider } from "../src/providers/gemini-provider.js";
import type { TextGenerationProvider } from "../src/providers/text-generation-provider.js";

const settings = {
  apiKey: "test-gemini-key",
  model: "gemini-test",
};

describe("GeminiTextGenerationProvider", () => {
  it("implements the text generation provider interface", async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: "Reviewer feedback" });
    const provider: TextGenerationProvider = new GeminiTextGenerationProvider(settings, {
      models: { generateContent },
    });

    await expect(provider.generate("Review this bundle")).resolves.toBe("Reviewer feedback");
  });

  it("sends the configured model and prompt to the Gemini client", async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: "Stage 3 output" });
    const provider = new GeminiTextGenerationProvider(settings, {
      models: { generateContent },
    });

    await provider.generate("Stage 2 reviewer input");

    expect(generateContent).toHaveBeenCalledWith({
      model: "gemini-test",
      contents: "Stage 2 reviewer input",
    });
  });

  it("fails clearly when Gemini returns no output text", async () => {
    const provider = new GeminiTextGenerationProvider(settings, {
      models: { generateContent: vi.fn().mockResolvedValue({ text: "" }) },
    });

    await expect(provider.generate("Prompt")).rejects.toThrow(
      "Gemini provider failed while generating text: Gemini returned an empty text response.",
    );
  });

  it("does not expose API keys in provider errors", async () => {
    const secretSettings = { ...settings, apiKey: "gemini-secret-test-key" };
    const provider = new GeminiTextGenerationProvider(secretSettings, {
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error("Request failed with gemini-secret-test-key")),
      },
    });

    await expect(provider.generate("Prompt")).rejects.toThrow("Request failed with [redacted]");
  });
});
