# Project Workflow

## Purpose

This file defines step-by-step development prompts for building the TypeScript rewrite. Use one step at a time. Each prompt is intended to produce a small, reviewable change before moving to the next step.

## Source Of Truth

Read Below documents:

`README.md`
`docs/*`

Get yourself familiarize with the project and its architecture

If project documents conflict, follow `docs/workflow-specification.md` for runtime behavior, CLI commands, stage order, and output filenames. Follow this file, `docs/project-workflow.md`, for implementation order and phase boundaries.

Do not produce any code yet

## How To Use This File

For each step:

1. read the referenced docs
2. give the development prompt to Codex or another coding agent
3. review the changed files
4. run the verification commands
5. commit only when the step is complete

Do not skip ahead to provider integration or DOCX export before the markdown workflow works with a fake provider.

## Global Development Rules

- Keep changes small and phase-aligned.
- Preserve the output filenames defined in `docs/workflow-specification.md`.
- Keep prompts as markdown files outside TypeScript source.
- Keep provider calls behind a provider interface.
- Use a fake provider for tests and early manual runs.
- Do not create or commit `.env`.
- Do not add a UI, database, scraper, or application tracker.
- Do not treat generated output as factual source data.
- Every TypeScript source file and executable script must start with a brief comment explaining the file's responsibility.
- Add concise internal comments for non-obvious workflow, validation, provider, or file ownership logic.
- Avoid comments that merely repeat obvious code.

## Standard Definition Of Done

Every development step must satisfy this standard definition of done in addition to the step-specific criteria:

- `npm run typecheck` passes when `package.json` exists.
- `npm test` passes when tests exist.
- New code files have top-of-file responsibility comments.
- Non-obvious logic has brief internal comments.
- No live provider calls are added unless the current step explicitly requires them.
- No secrets or local `.env` files are committed.
- Expected outputs match `docs/workflow-specification.md`.
- Naming conventions match the project contracts: `data/current_cv.txt`, `prompts/`, `src/workflows/`, and hyphenated CLI flags.

## Step 1 - Create The TypeScript Skeleton

### Goal

Create the basic TypeScript project structure without implementing workflow behavior.

### Development Prompt

```text
Read README.md, docs/architecture.md, docs/requirements.md, and docs/development-roadmap.md.

Implement Phase 1 only.

Create a TypeScript CLI project skeleton with package.json, tsconfig.json, src/, tests/, prompts/, jobs/, and outputs/.gitkeep.

Use the recommended stack from the docs: TypeScript, tsx, commander, vitest, yaml, and zod.

Do not add OpenAI, Gemini, DOCX export, or workflow logic yet.

Add minimal npm scripts for typecheck, test, and start.
```

### Expected Files

```text
package.json
tsconfig.json
src/
tests/
prompts/
jobs/
outputs/.gitkeep
```

### Verification

```bash
npm install
npm run typecheck
npm test
```

### Done When

- TypeScript compiles.
- Test command runs.
- No provider calls exist.

## Step 2 - Add File Loading And Slug Utilities

### Goal

Implement the first reusable file and naming utilities.

### Development Prompt

```text
Read docs/data-and-output-contracts.md, docs/testing-strategy.md, docs/fixture-strategy.md, and docs/workflow-specification.md.

Implement file loading and slug generation only.

Create utilities for reading UTF-8 text files, reading data/base_profile.yaml as stable prompt text, deriving a job slug from a job advert path, creating output directories, and writing markdown output files.

Add focused unit tests for these utilities.

Do not implement CLI workflows yet.
```

### Expected Files

```text
src/files/file-reader.ts
src/files/output-writer.ts
src/files/slugify.ts
tests/file-reader.test.ts
tests/output-writer.test.ts
tests/slugify.test.ts
```

### Verification

```bash
npm run typecheck
npm test
```

### Done When

- Text files can be read.
- Base profile can be loaded for prompt use.
- Job slug generation is deterministic.
- Output directory and file writing are tested.

## Step 3 - Add Prompt Templates

### Goal

Create initial editable markdown prompt templates.

### Development Prompt

```text
Read docs/prompt-template-specification.md and docs/workflow-specification.md.

Create the initial prompt markdown files under prompts/.

Include clear placeholders for each stage using the double-curly format from the prompt template specification.

Keep the prompts concise, factual, and grounded in base_profile.yaml. Do not implement rendering logic in this step.
```

### Expected Files

```text
prompts/stage-minus-1.md
prompts/stage-0.md
prompts/stage-1.md
prompts/stage-2-reviewer.md
prompts/stage-4-finalize.md
prompts/cv-format-rules.md
```

### Verification

```bash
npm test
```

### Done When

- All required prompt files exist.
- Prompt placeholders match `docs/prompt-template-specification.md`.
- No TypeScript workflow code is added.

## Step 4 - Implement Prompt Rendering

### Goal

Load prompt templates and replace placeholders with workflow context.

### Development Prompt

```text
Read docs/prompt-template-specification.md and docs/testing-strategy.md.

Implement prompt template loading and rendering.

Use simple exact replacement for placeholders like {{ job_description }}.

Fail clearly when a required variable is missing or a rendered prompt still contains unresolved placeholders.

Add focused tests for successful rendering, markdown preservation, missing variables, and unresolved placeholders.

Do not call any provider in this step.
```

### Expected Files

```text
src/prompts/prompt-renderer.ts
tests/prompt-renderer.test.ts
```

### Verification

```bash
npm run typecheck
npm test
```

### Done When

- Templates render deterministically.
- Missing data fails with a useful error.
- Renderer has no file writing or provider logic mixed into it.

## Step 5 - Add Provider Interface And Fake Provider

### Goal

Create the provider abstraction and deterministic fake provider.

### Development Prompt

```text
Read docs/provider-and-configuration.md, docs/testing-strategy.md, and docs/workflow-specification.md.

Create the TextGenerationProvider interface and a fake provider implementation.

The fake provider must be deterministic, must not make network calls, and should return enough information to identify which prompt was processed during tests.

Add tests for the fake provider.

Do not add OpenAI or Gemini yet.
```

### Expected Files

```text
src/providers/text-generation-provider.ts
src/providers/fake-provider.ts
tests/fake-provider.test.ts
```

### Verification

```bash
npm run typecheck
npm test
```

### Done When

- Workflow code can depend on `TextGenerationProvider`.
- Fake provider is tested and deterministic.
- No live network provider exists.

## Step 6 - Add Job Context Builder

### Goal

Build the shared context object used by workflows.

### Development Prompt

```text
Read docs/data-and-output-contracts.md and docs/workflow-specification.md.

Implement a job context builder that accepts a job path and current CV path, derives the job slug, loads the job description, current CV, base profile, and CV format rules, and returns a typed context object.

Keep this separate from CLI parsing and provider calls.

Add tests using small fixture files.
```

### Expected Files

```text
src/workflows/job-context.ts
tests/job-context.test.ts
```

### Verification

```bash
npm run typecheck
npm test
```

### Done When

- Context building is tested.
- Missing inputs produce clear errors.
- Context builder does not call providers.

## Step 7 - Implement The Start Workflow

### Goal

Create the first useful end-to-end markdown workflow using the fake provider.

### Development Prompt

```text
Read docs/workflow-specification.md, docs/requirements.md, and docs/testing-strategy.md.

Implement the start workflow only.

The workflow must load context, render Stage -1, call the provider, save stage_minus1_analysis.md, render Stage 0, call the provider, save stage0_acknowledgement.md, render Stage 1, call the provider, save stage1_draft.md, render Stage 2 reviewer input without a provider call, and save stage2_reviewer_input.md.

Use the TextGenerationProvider interface and fake provider in tests.

Add workflow tests that assert all expected files are written.

Do not implement review, finalize, OpenAI, Gemini, or DOCX export yet.
```

### Expected Files

```text
src/workflows/start-workflow.ts
tests/start-workflow.test.ts
```

### Verification

```bash
npm run typecheck
npm test
```

### Done When

- Start workflow writes all four expected markdown files.
- Stage 2 is rendered without a provider call.
- Tests pass with the fake provider.

## Step 8 - Add CLI Start Command

### Goal

Expose the start workflow through the command line.

### Development Prompt

```text
Read docs/workflow-specification.md and docs/requirements.md.

Implement the CLI entry point with commander and add the start command.

The command must support:
npm run start -- start --job jobs/<job_slug>.txt --current-cv data/current_cv.txt

Wire it to the start workflow using the fake provider by default.

Keep CLI parsing thin. Do not put workflow logic directly in the CLI file.
```

### Expected Files

```text
src/cli/main.ts
```

### Verification

```bash
npm run typecheck
npm test
npm run start -- start --job jobs/sample-job.txt --current-cv data/current_cv.txt
```

### Done When

- CLI command runs locally.
- Expected `outputs/<job_slug>/` files are created.
- CLI remains a thin wrapper.

## Step 9 - Implement The Review Workflow

### Goal

Generate or capture Stage 3 reviewer output.

### Development Prompt

```text
Read docs/workflow-specification.md and docs/requirements.md.

Implement the review workflow and CLI command.

The command must support:
npm run start -- review --job jobs/<job_slug>.txt --reviewer-input outputs/<job_slug>/stage2_reviewer_input.md

Use the configured TextGenerationProvider, with the fake provider as the test/default provider.

Save the result to outputs/<job_slug>/stage3_reviewer_output.md.

Do not add Gemini integration yet.
```

### Expected Files

```text
src/workflows/review-workflow.ts
tests/review-workflow.test.ts
src/cli/main.ts
```

### Verification

```bash
npm run typecheck
npm test
npm run start -- review --job jobs/sample-job.txt --reviewer-input outputs/sample-job/stage2_reviewer_input.md
```

### Done When

- Review workflow writes `stage3_reviewer_output.md`.
- CLI review command works.
- No Gemini SDK exists.

## Step 10 - Implement The Finalize Workflow

### Goal

Generate final markdown from the Stage 1 draft and Stage 3 reviewer feedback.

### Development Prompt

```text
Read docs/workflow-specification.md, docs/prompt-template-specification.md, and docs/requirements.md.

Implement the finalize workflow and CLI command.

The command must support:
npm run start -- finalize --job jobs/<job_slug>.txt --current-cv data/current_cv.txt --reviewer-output outputs/<job_slug>/stage3_reviewer_output.md

The workflow must load Stage 1 draft from outputs/<job_slug>/stage1_draft.md, load reviewer feedback, render the Stage 4 finalize prompt, call the provider, and save outputs/<job_slug>/stage4_final.md.

Do not add DOCX export yet.
```

### Expected Files

```text
src/workflows/finalize-workflow.ts
tests/finalize-workflow.test.ts
src/cli/main.ts
```

### Verification

```bash
npm run typecheck
npm test
npm run start -- finalize --job jobs/sample-job.txt --current-cv data/current_cv.txt --reviewer-output outputs/sample-job/stage3_reviewer_output.md
```

### Done When

- Finalize workflow writes `stage4_final.md`.
- Full markdown pipeline can run locally with fake provider.
- DOCX export is still absent.

## Step 11 - Add Configuration Module

### Goal

Prepare typed configuration before live provider integration.

### Development Prompt

```text
Read docs/provider-and-configuration.md.

Implement a configuration module using zod.

Support provider selection with a safe default of fake.

Validate OpenAI settings only when the OpenAI provider is selected.

Do not create a .env file and do not add live OpenAI calls in this step.
```

### Expected Files

```text
src/config/settings.ts
tests/settings.test.ts
```

### Verification

```bash
npm run typecheck
npm test
```

### Done When

- Fake provider remains the default.
- Missing OpenAI credentials do not break fake-provider tests.
- OpenAI configuration fails clearly when selected but incomplete.

## Step 12 - Add OpenAI Provider

### Goal

Add live OpenAI generation behind the existing provider interface.

### Development Prompt

```text
Read docs/provider-and-configuration.md and docs/workflow-specification.md.

Implement an OpenAI provider behind TextGenerationProvider.

Use settings from the configuration module.

Keep fake provider as the default for tests.

Do not print API keys or secrets in errors.

Add unit tests using mocked client behavior only. Do not make network calls in tests.
```

### Expected Files

```text
src/providers/openai-provider.ts
tests/openai-provider.test.ts
```

### Verification

```bash
npm run typecheck
npm test
```

### Done When

- OpenAI provider is selectable for manual runs.
- Tests do not require network or secrets.
- Workflow code still depends only on `TextGenerationProvider`.

## Step 13 - Add DOCX Export

### Goal

Export final markdown into plain DOCX files after the markdown pipeline is stable.

### Development Prompt

```text
Read docs/workflow-specification.md, docs/data-and-output-contracts.md, and docs/development-roadmap.md.

Implement DOCX export as a separate module.

Start with plain, ATS-compatible formatting.

The exporter should read or receive Stage 4 final markdown and create:
outputs/CV_cover_letter/cv_final_<job_slug>.docx
outputs/CV_cover_letter/cover_letter_<job_slug>.docx

Keep export logic separate from provider and prompt orchestration.
```

### Expected Files

```text
src/export/document-exporter.ts
tests/document-exporter.test.ts
```

### Verification

```bash
npm run typecheck
npm test
```

### Done When

- DOCX files are created from final markdown.
- Exporter is isolated from workflows except for an explicit call.
- Markdown pipeline still works without DOCX export when needed.

## Step 14 - Final Manual End-To-End Verification

### Goal

Confirm the project works as a local staged workflow.

### Development Prompt

```text
Run a full manual workflow with the fake provider.

Start with a sample job advert and data/current_cv.txt.

Verify that start, review, and finalize create every expected markdown file.

If DOCX export has been implemented, verify that the final DOCX files are created.

Fix only issues found during this verification. Do not add new features.
```

### Verification

```bash
npm run typecheck
npm test
npm run start -- start --job jobs/sample-job.txt --current-cv data/current_cv.txt
npm run start -- review --job jobs/sample-job.txt --reviewer-input outputs/sample-job/stage2_reviewer_input.md
npm run start -- finalize --job jobs/sample-job.txt --current-cv data/current_cv.txt --reviewer-output outputs/sample-job/stage3_reviewer_output.md
```

### Done When

- All tests pass.
- All expected markdown outputs exist.
- The project can be explained from README.md plus the docs in `docs/`.
