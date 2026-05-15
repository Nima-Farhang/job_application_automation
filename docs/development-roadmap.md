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

Definition of done:

- TypeScript project files exist.
- `npm run typecheck` can run.
- `npm test` can run.
- New code or script files include top-of-file responsibility comments.
- No live provider calls or secrets are introduced.

## Phase 2 - File Loading And Slug Generation

Implement:

- text file reader
- YAML profile reader
- job slug utility
- output directory creation
- output writer

Add tests for each utility.

Definition of done:

- File loading, slugging, output directory creation, and output writing are tested.
- Tests use fixtures or temporary directories.
- `npm run typecheck` and `npm test` pass.
- New code files include top-of-file responsibility comments.

## Phase 3 - Prompt Rendering

Implement:

- prompt template loading
- simple placeholder replacement
- unresolved placeholder validation
- stage-specific render inputs

Add prompt renderer tests before wiring workflows.

Definition of done:

- Prompt templates render with explicit variables.
- Missing or unresolved placeholders fail clearly.
- `npm run typecheck` and `npm test` pass.
- New code files include top-of-file responsibility comments.

## Phase 4 - Fake Provider

Implement:

- `TextGenerationProvider` interface
- fake provider
- provider factory or simple provider selection

The fake provider should make all workflow tests deterministic.

Definition of done:

- Provider interface exists.
- Fake provider is deterministic and tested.
- No network calls are made in tests.
- `npm run typecheck` and `npm test` pass.

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

Definition of done:

- `stage_minus1_analysis.md`, `stage0_acknowledgement.md`, `stage1_draft.md`, and `stage2_reviewer_input.md` are written to the expected output path.
- Stage 2 is rendered without a provider call.
- `npm run typecheck` and `npm test` pass.
- New workflow code includes top-of-file responsibility comments.

## Phase 6 - Review Workflow

Implement:

- CLI `review` command
- reviewer input loading
- fake reviewer provider support
- Stage 3 output writing

Automated Gemini review can wait until the core local flow is stable.

Definition of done:

- Review workflow writes `stage3_reviewer_output.md`.
- CLI flag is `--reviewer-input`.
- Fake provider remains the default for tests.
- `npm run typecheck` and `npm test` pass.

## Phase 7 - Finalize Workflow

Implement:

- CLI `finalize` command
- Stage 1 draft loading
- reviewer feedback loading
- Stage 4 prompt rendering
- Stage 4 final markdown generation

Acceptance criteria:

- full markdown pipeline can run from start to final output

Definition of done:

- Finalize workflow writes `stage4_final.md`.
- CLI flag is `--reviewer-output`.
- Full markdown pipeline runs with the fake provider.
- `npm run typecheck` and `npm test` pass.

## Phase 8 - OpenAI Provider

Implement:

- OpenAI provider
- environment configuration validation
- model/base URL settings
- provider error handling

Acceptance criteria:

- fake provider remains the default for tests
- OpenAI provider can be selected for manual runs

Definition of done:

- OpenAI provider is behind the provider interface.
- Tests use mocked client behavior only.
- Missing secrets fail clearly when OpenAI is selected.
- No secrets or `.env` files are committed.
- `npm run typecheck` and `npm test` pass.

## Phase 9 - DOCX Export

Implement only after markdown output is stable.

Start with:

- plain CV DOCX
- plain cover letter DOCX
- predictable filenames

Improve styling later.

Definition of done:

- Plain DOCX files are created at the expected paths.
- Export logic is isolated from prompt rendering and provider code.
- Markdown workflow still runs without relying on DOCX export.
- `npm run typecheck` and `npm test` pass.

## Development Guardrails

- Keep each phase small.
- Preserve stage output filenames.
- Do not hide manual review points.
- Do not add a database.
- Do not add a UI.
- Do not commit secrets.
- Do not make generated content the factual source of truth.
