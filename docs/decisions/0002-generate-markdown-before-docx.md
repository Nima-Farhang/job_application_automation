# ADR 0002 - Generate Markdown Before DOCX

## Status

Accepted.

## Context

The staged workflow needs clear intermediate outputs for review and debugging. DOCX export adds formatting complexity that can distract from validating the core generation flow.

## Decision

Implement the complete markdown pipeline before adding DOCX export.

## Consequences

- Stage outputs remain easy to inspect and diff.
- Prompt and workflow issues can be fixed before document formatting is introduced.
- DOCX export can be developed as a separate module later.

