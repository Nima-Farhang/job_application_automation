// Calls Google Gemini through the shared text generation provider interface.
import { GoogleGenAI } from "@google/genai";
import type { GeminiSettings } from "../config/settings.js";
import type { TextGenerationProvider } from "./text-generation-provider.js";

interface GeminiGenerateContentResponse {
  text?: string | null;
}

interface GeminiClient {
  models: {
    generateContent: (request: { model: string; contents: string }) => Promise<GeminiGenerateContentResponse>;
  };
}

export class GeminiTextGenerationProvider implements TextGenerationProvider {
  private readonly apiKey: string;
  private readonly client: GeminiClient;
  private readonly model: string;

  constructor(settings: GeminiSettings, client?: GeminiClient) {
    this.apiKey = settings.apiKey;
    this.model = settings.model;
    this.client =
      client ??
      new GoogleGenAI({
        apiKey: settings.apiKey,
      });
  }

  async generate(prompt: string): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      if (typeof response.text !== "string" || response.text.length === 0) {
        throw new Error("Gemini returned an empty text response.");
      }

      return response.text;
    } catch (error) {
      throw new Error(
        "Gemini provider failed while generating text: " + getPublicErrorMessage(error, [this.apiKey]),
      );
    }
  }
}

function getPublicErrorMessage(error: unknown, secretValues: string[]): string {
  if (!(error instanceof Error)) {
    return "Unknown error.";
  }

  // SDK errors may include request details; keep the surfaced message short and secret-free.
  return secretValues.reduce(
    (message, secretValue) => message.replaceAll(secretValue, "[redacted]"),
    error.message,
  );
}
