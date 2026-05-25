// Calls OpenAI through the shared text generation provider interface.
import OpenAI from "openai";
import type { OpenAISettings } from "../config/settings.js";
import type { TextGenerationProvider } from "./text-generation-provider.js";

interface OpenAIResponsesClient {
  responses: {
    create: (request: { model: string; input: string }) => Promise<{ output_text?: string | null }>;
  };
}

export class OpenAITextGenerationProvider implements TextGenerationProvider {
  private readonly client: OpenAIResponsesClient;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(settings: OpenAISettings, client?: OpenAIResponsesClient) {
    this.apiKey = settings.apiKey;
    this.model = settings.model;
    this.client =
      client ??
      new OpenAI({
        apiKey: settings.apiKey,
        baseURL: settings.baseUrl,
      });
  }

  async generate(prompt: string): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: this.model,
        input: prompt,
      });

      if (typeof response.output_text !== "string" || response.output_text.length === 0) {
        throw new Error("OpenAI returned an empty text response.");
      }

      return response.output_text;
    } catch (error) {
      throw new Error(
        "OpenAI provider failed while generating text: " + getPublicErrorMessage(error, [this.apiKey]),
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
