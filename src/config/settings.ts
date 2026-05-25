// Loads and validates provider-related configuration from environment variables.
import { z } from "zod";

const providerSchema = z.preprocess(
  normalizeProviderName,
  z.enum(["fake", "openai", "gemini"]).optional(),
);

const optionalStringSchema = z.preprocess(normalizeOptionalString, z.string().optional());
const rawEnvironmentSchema = z.object({
  TEXT_PROVIDER: providerSchema,
  REVIEWER_PROVIDER: providerSchema,
  OPENAI_API_KEY: optionalStringSchema,
  OPENAI_MODEL: optionalStringSchema,
  OPENAI_BASE_URL: optionalStringSchema,
  GEMINI_API_KEY: optionalStringSchema,
  GEMINI_MODEL: optionalStringSchema,
});

export type ProviderName = "fake" | "openai" | "gemini";

export interface OpenAISettings {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface GeminiSettings {
  apiKey: string;
  model: string;
}

export interface AppSettings {
  textProvider: ProviderName;
  reviewerProvider: ProviderName;
  openai?: OpenAISettings;
  gemini?: GeminiSettings;
}

export function loadSettings(environment: NodeJS.ProcessEnv = process.env): AppSettings {
  const parsedEnvironment = parseRawEnvironment(environment);
  const textProvider = parsedEnvironment.TEXT_PROVIDER ?? inferTextProvider(parsedEnvironment);
  const reviewerProvider = parsedEnvironment.REVIEWER_PROVIDER ?? inferReviewerProvider(parsedEnvironment);
  const selectedProviders = new Set<ProviderName>([textProvider, reviewerProvider]);

  return {
    textProvider,
    reviewerProvider,
    openai: selectedProviders.has("openai") ? buildOpenAISettings(parsedEnvironment) : undefined,
    gemini: selectedProviders.has("gemini") ? buildGeminiSettings(parsedEnvironment) : undefined,
  };
}

function parseRawEnvironment(environment: NodeJS.ProcessEnv): z.infer<typeof rawEnvironmentSchema> {
  const result = rawEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    throw new Error("Invalid provider configuration: " + formatZodIssues(result.error));
  }

  return result.data;
}

function buildOpenAISettings(environment: z.infer<typeof rawEnvironmentSchema>): OpenAISettings {
  const result = z
    .object({
      OPENAI_API_KEY: z.string({ required_error: "OPENAI_API_KEY is required when OpenAI is selected." }).min(1, "OPENAI_API_KEY is required when OpenAI is selected."),
      OPENAI_MODEL: z.string().min(1).default("gpt-5"),
      OPENAI_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
    })
    .safeParse(environment);

  if (!result.success) {
    throw new Error("Invalid OpenAI configuration: " + formatZodIssues(result.error));
  }

  return {
    apiKey: result.data.OPENAI_API_KEY,
    model: result.data.OPENAI_MODEL,
    baseUrl: result.data.OPENAI_BASE_URL,
  };
}

function buildGeminiSettings(environment: z.infer<typeof rawEnvironmentSchema>): GeminiSettings {
  const result = z
    .object({
      GEMINI_API_KEY: z.string({ required_error: "GEMINI_API_KEY is required when Gemini is selected." }).min(1, "GEMINI_API_KEY is required when Gemini is selected."),
      GEMINI_MODEL: z.string().min(1).default("gemini-2.5-pro"),
    })
    .safeParse(environment);

  if (!result.success) {
    throw new Error("Invalid Gemini configuration: " + formatZodIssues(result.error));
  }

  return {
    apiKey: result.data.GEMINI_API_KEY,
    model: result.data.GEMINI_MODEL,
  };
}

function normalizeOptionalString(value: unknown): unknown {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length === 0 ? undefined : trimmedValue;
}

function normalizeProviderName(value: unknown): unknown {
  const normalizedValue = normalizeOptionalString(value);

  return typeof normalizedValue === "string" ? normalizedValue.toLowerCase() : normalizedValue;
}

// Codespace secrets should enable live runs without requiring provider selector env vars.
function inferTextProvider(environment: z.infer<typeof rawEnvironmentSchema>): ProviderName {
  return environment.OPENAI_API_KEY === undefined ? "fake" : "openai";
}

function inferReviewerProvider(environment: z.infer<typeof rawEnvironmentSchema>): ProviderName {
  return environment.GEMINI_API_KEY === undefined ? "fake" : "gemini";
}

function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const fieldName = issue.path.join(".") || "environment";

      return `${fieldName}: ${issue.message}`;
    })
    .join("; ");
}
