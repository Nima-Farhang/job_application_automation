import { describe, expect, it, vi } from "vitest";
import { FakeTextGenerationProvider } from "../src/providers/fake-provider.js";
import type { TextGenerationProvider } from "../src/providers/text-generation-provider.js";

describe("FakeTextGenerationProvider", () => {
  it("implements the text generation provider interface", async () => {
    const provider: TextGenerationProvider = new FakeTextGenerationProvider();

    await expect(provider.generate("Stage 0 formatting acknowledgement")).resolves.toContain("Provider: fake");
  });

  it("returns deterministic output for the same prompt", async () => {
    const provider = new FakeTextGenerationProvider();
    const prompt = "Stage 1 draft prompt\nRole: Senior Platform Engineer";

    await expect(provider.generate(prompt)).resolves.toBe(await provider.generate(prompt));
  });

  it("includes enough prompt context to identify what was processed", async () => {
    const provider = new FakeTextGenerationProvider();

    const output = await provider.generate("Stage -1 analysis prompt\nJob: Senior Platform Engineer");

    expect(output).toContain("Prompt SHA256:");
    expect(output).toContain("Prompt characters: 54");
    expect(output).toContain("Prompt preview: Stage -1 analysis prompt Job: Senior Platform Engineer");
  });

  it("produces distinct output for distinct prompts", async () => {
    const provider = new FakeTextGenerationProvider();

    await expect(provider.generate("Stage 1 draft prompt")).resolves.not.toBe(
      await provider.generate("Stage 4 final prompt"),
    );
  });

  it("does not make network calls", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const provider = new FakeTextGenerationProvider();

    await provider.generate("Offline prompt");

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
