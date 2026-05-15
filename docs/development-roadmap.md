# Development Roadmap

## Purpose

This roadmap turns the README and architecture documents into an implementation sequence. It is intentionally incremental so the project can become useful before all provider and export features exist.

## Phase 1 - Project Skeleton

Create:

- `package.json`
- `tsconfig.json`
- `src/`
- `tests/`
- `prompts/`
- `jobs/`
- `outputs/.gitkeep`

Install initial dependencies:

- TypeScript
- tsx
- commander
- vitest
- yaml
- zod

Do not add live provider calls in this phase.

## Phase 2 - File Loading And Slug Generation

Implement:

- text file reader
- YAML profile reader
- job slug utility
- output directory creation
- output writer

Add tests for each utility.

## Phase 3 - Prompt Rendering

Implement:

- prompt template loading
- simple placeholder replacement
- unresolved placeholder validation
- stage-specific render inputs

Add prompt renderer tests before wiring workflows.

## Phase 4 - Fake Provider

Implement:

- `TextGenerationProvider` interface
- fake provider
- provider factory or simple provider selection

The fake provider should make all workflow tests deterministic.

## Phase 5 - Start Workflow

Implement:

- CLI `start` command
- job context builder
- Stage -1 generation
- Stage 0 generation
- Stage 1 generation
- Stage 2 reviewer bundle rendering

Acceptance criteria:

- command writes all expected start workflow markdown files
- unit and workflow tests pass

## Phase 6 - Review Workflow

Implement:

- CLI `review` command
- reviewer input loading
- fake reviewer provider support
- Stage 3 output writing

Automated Gemini review can wait until the core local flow is stable.

## Phase 7 - Finalize Workflow

Implement:

- CLI `finalize` command
- Stage 1 draft loading
- reviewer feedback loading
- Stage 4 prompt rendering
- Stage 4 final markdown generation

Acceptance criteria:

- full markdown pipeline can run from start to final output

## Phase 8 - OpenAI Provider

Implement:

- OpenAI provider
- environment configuration validation
- model/base URL settings
- provider error handling

Acceptance criteria:

- fake provider remains the default for tests
- OpenAI provider can be selected for manual runs

## Phase 9 - DOCX Export

Implement only after markdown output is stable.

Start with:

- plain CV DOCX
- plain cover letter DOCX
- predictable filenames

Improve styling later.

## Development Guardrails

- Keep each phase small.
- Preserve stage output filenames.
- Do not hide manual review points.
- Do not add a database.
- Do not add a UI.
- Do not commit secrets.
- Do not make generated content the factual source of truth.
