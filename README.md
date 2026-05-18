# Job Application Automation — TypeScript Rewrite

A local TypeScript command-line tool for producing tailored CVs and cover letters from a job advert, a current CV, formatting rules, and a factual base profile.

This repository is a TypeScript redevelopment of the existing Python `job_application_automation` project. The goal is not to build a large package in one attempt. The goal is to rebuild the workflow step by step, with clear boundaries between input files, prompt rendering, LLM provider calls, intermediate outputs, manual review, and final document export.

## Purpose

The tool supports a repeatable job-application workflow:

1. Read a job advert.
2. Read the current CV and factual base profile.
3. Analyse the role before writing anything.
4. Generate a first-pass tailored CV and cover letter.
5. Create a reviewer bundle for Gemini or another reviewer.
6. Accept reviewer feedback.
7. Generate the final CV and cover letter.
8. Export the final documents.

The project is intended to reduce repetitive copy/paste work while keeping the human review points visible and controlled.

## What The Original Repository Does

The original Python repository runs a staged workflow:

| Stage | Purpose | Automated? |
|---|---|---|
| Stage -1 | Analyse the job advert and identify the real hiring signal | Yes |
| Stage 0 | Load and acknowledge CV formatting rules | Yes |
| Stage 1 | Generate first-pass tailored CV and cover letter | Yes |
| Stage 2 | Create a reviewer prompt bundle for Gemini | Yes |
| Stage 3 | Get the reviwer prompt from Gemini | Yes |
| Stage 4 | Refine the draft using reviewer feedback | Yes |
| Export | Create final CV and cover letter documents | Yes |

The workflow writes all intermediate and final files into a job-specific output folder such as:

```text
outputs/<job_slug>/
outputs/<CV_cover_letter>/
```

Typical outputs are:

```text
outputs/<job_slug>/stage_minus1_analysis.md
outputs/<job_slug>/stage0_acknowledgement.md
outputs/<job_slug>/stage1_draft.md
outputs/<job_slug>/stage2_reviewer_input.md
outputs/<job_slug>/stage3_reviewer_output.md
outputs/<job_slug>/stage4_final.md
outputs/<CV_cover_letter>/cv_final_job_slug.docx
outputs/<CV_cover_letter>/cover_letter_job_slug.docx
```

## TypeScript Rewrite Goals

Primary goals:

- Build the project incrementally.
- Keep prompts as version-controlled markdown files.
- Keep factual data separate from generated text.
- Keep every intermediate output for audit and debugging.
- Keep provider integration behind an interface.
- Keep the CLI thin.
- Avoid building a UI, database, or application tracker in the first version.

## Proposed Project Structure

```text
job-application-automation-ts/
├── README.md
├── docs/
│   └── architecture.md
├── prompts/
│   ├── stage-minus-1.md
│   ├── stage-0.md
│   ├── stage-1.md
│   ├── stage-2-reviewer.md
│   └── stage-4-finalize.md
├── data/
│   ├── base_profile.yaml
│   └── current_cv.txt


├── jobs/
│   └── sample-job.txt
├── outputs/
│   └── .gitkeep
├── src/
│   ├── cli/
│   │   └── main.ts
│   ├── config/
│   │   └── settings.ts
│   ├── workflows/
│   │   ├── job-context.ts
│   │   ├── start-workflow.ts
│   │   ├── review-workflow.ts
│   │   └── finalize-workflow.ts
│   ├── files/
│   │   ├── file-reader.ts
│   │   ├── output-writer.ts
│   │   └── slugify.ts
│   ├── prompts/
│   │   └── prompt-renderer.ts
│   ├── providers/
│   │   ├── text-generation-provider.ts
│   │   └── openai-provider.ts
│   └── export/
│       └── document-exporter.ts
├── tests/
│   ├── prompt-renderer.test.ts
│   ├── slugify.test.ts
│   └── orchestrator.test.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## Suggested Technology Choices

Recommended first-version stack:

- TypeScript
- Node.js LTS
- `tsx` for local execution during development
- `commander` for CLI parsing
- `dotenv` for environment loading
- `zod` for configuration validation
- `yaml` for reading `base_profile.yaml`
- OpenAI SDK for model calls
- `docx` package for later DOCX export
- `vitest` for tests

## CLI Commands

The first version should support the same two-command workflow as the Python project.

### Start Workflow

```bash
npm run start -- start --job jobs/job_slug.txt --current-cv data/current_cv.txt
```

Expected output:

```text
outputs/<job_slug>/stage_minus1_analysis.md
outputs/<job_slug>/stage0_acknowledgement.md
outputs/<job_slug>/stage1_draft.md
outputs/<job_slug>/stage2_reviewer_input.md
```

### Review Workflow

```bash
npm run start -- review \
    --job jobs/<job_slug>.txt \
    --reviewer-input outputs/<job_slug>/stage2_reviewer_input.md
```

Expected output:

```text
outputs/<job_slug>/stage3_reviewer_output.md
```

### Finalize Workflow

```bash
npm run start -- finalize \
  --job jobs/<job_slug>.txt \
  --current-cv data/current_cv.txt \
  --reviewer-output outputs/<job_slug>/stage3_reviewer_output.md
```

Expected output:

```text
outputs/<job_slug>/stage4_final.md
outputs/<CV_cover_letter>/cv_final_job_slug.docx
outputs/<CV_cover_letter>/cover_letter_job_slug.docx
```

## Environment Variables

Provided through secrets of Github codespace

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5
OPENAI_BASE_URL=https://api.openai.com/v1
```

Do not create or commit `.env`.

## Development Approach

Build the TypeScript rewrite in small phases.

### Phase 1 — Project Skeleton

Create the TypeScript project, folder structure, `package.json`, `tsconfig.json`.

Do not call OpenAI or Gemini yet. 

### Phase 2 — File Loading And Slug Generation

Implement:

- read text file
- read YAML profile as stable text
- create job slug from job filename
- create output directory

Test these with small unit tests.

### Phase 3 — Prompt Rendering

Implement simple placeholder replacement:

```text
{{ job_description }}
{{ current_cv }}
{{ base_profile }}
```

Keep this simple at first. Add validation later.

### Phase 4 — Provider Interface

Create a provider interface:

```ts
export interface TextGenerationProvider {
  generate(prompt: string): Promise<string>;
}
```

Add a fake provider for local testing before adding OpenAI and Gemini.

### Phase 5 — Start Workflow

Implement the `start` command:

1. Build context.
2. Render Stage -1 prompt.
3. Call provider.
4. Save Stage -1 output.
5. Render Stage 0 prompt.
12. Save Stage 2 reviewer input without calling a provider.


### Phase 6 — Review Workflow

Implement the `review` command:

1. Load job description.
2. Load reviewer input.
3. Call provider.
5. Render Stage 3 prompt.
12. Save Stage 3 reviewer output without calling a provider.

### Phase 7 — Finalize Workflow

Implement the `finalize` command:

1. Load job description.
2. Load current CV.
3. Load Stage 1 draft.
4. Load reviewer output.
5. Render Stage 4 prompt.
6. Call provider.
7. Save Stage 4 final markdown.

### Phase 8 — DOCX Export

Add document export after markdown workflow is stable.

First export plain documents. Improve styling later.

## Design Rules

- Do not build all features at once.
- Do not automate Gemini review in version 1.
- Do not add a database in version 1.
- Do not add a UI in version 1.
- Do not hide intermediate files.
- Do not allow generated content to become the source of truth.
- Keep `base_profile.yaml` as the factual source.
- Keep prompts editable as markdown.

## First Milestone Definition Of Done

The first useful milestone is complete when the project can:

1. Accept a job advert file.
2. Load the current CV and base profile.
3. Render all prompts correctly.
4. Use a fake provider to simulate model responses.
5. Write all expected markdown outputs into `outputs/<job_slug>/`.

Only after that should the OpenAI provider be added.

## Later Improvements

Possible later improvements:

- Add ATS keyword scoring.
- Add PDF export.
- Add a lightweight local UI.
- Add richer DOCX styling.
- Add prompt validation.
- Add run metadata for each generated job application.

Keep these out of the first rewrite unless the core workflow is already stable.
