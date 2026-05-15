# Provider And Configuration

## Purpose

This document defines how model providers and configuration should be handled before implementation begins.

## Provider Interface

All model calls must go through a small provider interface:

```typescript
export interface TextGenerationProvider {
  generate(prompt: string): Promise<string>;
}
```

Workflow code should depend on this interface only.

## Provider Types

### Fake Provider

Required for the first milestone.

Responsibilities:

- return deterministic text for local development and tests
- avoid network calls
- make the workflow testable before OpenAI or Gemini integration

### OpenAI Provider

Required after the fake provider workflow is stable.

Responsibilities:

- read configuration from environment variables
- call the OpenAI API
- return generated text to the workflow

### Reviewer Provider

Gemini or another reviewer provider is a later enhancement. Version 1 may use fake provider output or manually saved reviewer feedback.

## Environment Variables

Expected variables:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5
OPENAI_BASE_URL=https://api.openai.com/v1
```

Rules:

- do not create `.env`
- do not commit secrets
- read secrets from the environment
- validate required values before provider calls

## Configuration Module

The TypeScript project should include a configuration module responsible for:

- loading environment variables
- validating provider settings
- providing defaults where safe
- returning typed settings to the rest of the application

Recommended dependency:

```text
zod
```

## Provider Selection

The first implementation can choose providers in code or through a simple environment variable.

Possible future variable:

```env
TEXT_PROVIDER=fake
```

Recommended early values:

- `fake`
- `openai`

## Error Handling

Provider errors should include:

- provider name
- operation being attempted
- clear configuration guidance when credentials are missing

Provider errors should not print API keys or secrets.

