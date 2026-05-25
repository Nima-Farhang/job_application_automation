// Selects configured text generation providers for CLI workflows.
import type { AppSettings, ProviderName } from "../config/settings.js";
import { FakeTextGenerationProvider } from "./fake-provider.js";
import { GeminiTextGenerationProvider } from "./gemini-provider.js";
import { OpenAITextGenerationProvider } from "./openai-provider.js";
import type { TextGenerationProvider } from "./text-generation-provider.js";

export function createTextGenerationProvider(settings: AppSettings): TextGenerationProvider {
  return createProvider(settings.textProvider, settings);
}

export function createReviewerProvider(settings: AppSettings): TextGenerationProvider {
  return createProvider(settings.reviewerProvider, settings);
}

function createProvider(providerName: ProviderName, settings: AppSettings): TextGenerationProvider {
  if (providerName === "fake") {
    return new FakeTextGenerationProvider();
  }

  if (providerName === "openai") {
    if (settings.openai === undefined) {
      throw new Error("OpenAI provider selected, but OpenAI settings were not loaded.");
    }

    return new OpenAITextGenerationProvider(settings.openai);
  }

  if (providerName === "gemini") {
    if (settings.gemini === undefined) {
      throw new Error("Gemini provider selected, but Gemini settings were not loaded.");
    }

    return new GeminiTextGenerationProvider(settings.gemini);
  }

  throw new Error("Unsupported provider selected: " + providerName);
}
