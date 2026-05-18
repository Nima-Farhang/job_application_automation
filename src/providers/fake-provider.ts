import { createHash } from "node:crypto";
import type { TextGenerationProvider } from "./text-generation-provider.js";

export class FakeTextGenerationProvider implements TextGenerationProvider {
  async generate(prompt: string): Promise<string> {
    const fingerprint = createHash("sha256").update(prompt).digest("hex").slice(0, 16);
    const preview = buildPromptPreview(prompt);

    return [
      "# Fake Provider Output",
      "",
      "Provider: fake",
      `Prompt SHA256: ${fingerprint}`,
      `Prompt characters: ${prompt.length}`,
      `Prompt preview: ${preview}`,
    ].join("\n");
  }
}

function buildPromptPreview(prompt: string): string {
  const normalized = prompt.replace(/\s+/g, " ").trim();

  if (normalized.length === 0) {
    return "(empty prompt)";
  }

  return normalized.slice(0, 120);
}
