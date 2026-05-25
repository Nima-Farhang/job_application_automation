// Selects configured text generation providers for CLI workflows.
import type { AppSettings, ProviderName } from "../config/settings.js";
import { FakeTextGenerationProvider } from "./fake-provider.js";
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

  throw new Error("Gemini provider selection is configured, but Gemini provider is not implemented yet.");
}
