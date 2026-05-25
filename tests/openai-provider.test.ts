import { describe, expect, it, vi } from "vitest";
import { OpenAITextGenerationProvider } from "../src/providers/openai-provider.js";
import type { TextGenerationProvider } from "../src/providers/text-generation-provider.js";

const settings = {
  apiKey: "test-openai-key",
  model: "gpt-test",
  baseUrl: "https://api.openai.test/v1",
};

describe("OpenAITextGenerationProvider", () => {
  it("implements the text generation provider interface", async () => {
    const create = vi.fn().mockResolvedValue({ output_text: "Generated response" });
    const provider: TextGenerationProvider = new OpenAITextGenerationProvider(settings, {
      responses: { create },
    });

    await expect(provider.generate("Tailor this CV")).resolves.toBe("Generated response");
  });

  it("sends the configured model and prompt to the Responses API client", async () => {
    const create = vi.fn().mockResolvedValue({ output_text: "Draft output" });
    const provider = new OpenAITextGenerationProvider(settings, {
      responses: { create },
    });

    await provider.generate("Stage 1 prompt");

    expect(create).toHaveBeenCalledWith({
      model: "gpt-test",
      input: "Stage 1 prompt",
    });
  });

  it("fails clearly when OpenAI returns no output text", async () => {
    const provider = new OpenAITextGenerationProvider(settings, {
      responses: { create: vi.fn().mockResolvedValue({ output_text: "" }) },
    });

    await expect(provider.generate("Prompt")).rejects.toThrow(
      "OpenAI provider failed while generating text: OpenAI returned an empty text response.",
    );
  });

  it("does not expose API keys in provider errors", async () => {
    const secretSettings = { ...settings, apiKey: "sk-secret-test-key" };
    const provider = new OpenAITextGenerationProvider(secretSettings, {
      responses: {
        create: vi.fn().mockRejectedValue(new Error("Request failed with sk-secret-test-key")),
      },
    });

    await expect(provider.generate("Prompt")).rejects.toThrow("Request failed with [redacted]");
  });
});
