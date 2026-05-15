# ADR 0001 - Use Fake Provider First

## Status

Accepted.

## Context

The workflow depends on generated text, but early development needs deterministic tests and should not require API keys or network access.

## Decision

Build and test the markdown workflow with a fake provider before adding OpenAI or Gemini integration.

## Consequences

- Unit and workflow tests can run in Codespaces without secrets.
- Workflow behavior can be verified before model behavior is introduced.
- Live provider integration remains isolated behind the provider interface.

