# Architecture — Job Application Automation TypeScript Rewrite

## 1. Purpose Of The System

This TypeScript Project is a local command-line workflow for creating tailored CVs and cover letters. It takes:

- a job advert
- a current CV
- a factual base profile
- formatting rules
- prompt templates

It then generates staged outputs using an LLM provider and saves all intermediate and final results into job-specific output folders.

The system is intentionally designed as:

- a local developer workflow
- a deterministic staged pipeline
- a manually reviewable process
- a prompt-driven automation tool

The system is NOT:

- a recruitment platform
- an ATS
- a job board scraper
- a web application
- a multi-user SaaS platform

The first version should remain focused and operationally simple.

---

# 2. What The Current Repository Does

The current Python repository performs the following workflow:

| Stage    | Purpose                                                    | Automated? |
| -------- | ---------------------------------------------------------- | ---------- |
| Stage -1 | Analyse the job advert and identify the real hiring signal | Yes        |
| Stage 0  | Load and acknowledge CV formatting rules                   | Yes        |
| Stage 1  | Generate first-pass tailored CV and cover letter           | Yes        |
| Stage 2  | Create a reviewer prompt bundle for Gemini                 | Yes        |
| Stage 3  | Get reviewer feedback from Gemini                          | Yes        |
| Stage 4  | Refine the draft using reviewer feedback                   | Yes        |
| Export   | Create final CV and cover letter documents                 | Yes        |

The workflow writes all intermediate and final outputs into structured folders.

Example:

```text
outputs/<job_slug>/
outputs/<CV_cover_letter>/
```

Typical generated files:

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

---

# 3. TypeScript Goals

Primary goals:

1. Build the workflow incrementally.
2. Keep prompt stages isolated and testable.
3. Separate orchestration from providers.
4. Preserve manual review boundaries.
5. Keep outputs deterministic and reproducible.
6. Avoid large monolithic implementations.
7. Support multiple LLM providers later.
8. Make prompt engineering explicit and maintainable.

---

# 4. High-Level Architecture

```text
┌─────────────────────┐
│ CLI Entry Point     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Workflow Controller │
└──────────┬──────────┘
           │
           ├──────────────┐
           │              │
           ▼              ▼
┌────────────────┐  ┌────────────────┐
│ Prompt Loader  │  │ File Loader    │
└────────────────┘  └────────────────┘
           │
           ▼
┌─────────────────────┐
│ Prompt Renderer     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ LLM Provider Layer  │
│ OpenAI / Gemini     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Output Writer       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ DOCX Export Layer   │
└─────────────────────┘
```

---

# 5. Repository Structure

```text
job-application-automation-ts/
├── src/
│   ├── cli/
│   ├── workflows/
│   ├── prompts/
│   ├── providers/
│   ├── exporters/
│   ├── utils/
│   └── types/
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
├── package.json
├── tsconfig.json
└── README.md
```

---

# 6. Workflow Design

## 6.1 Start Workflow

The `start` workflow generates:

- Stage -1 analysis
- Stage 0 acknowledgement
- Stage 1 tailored draft
- Stage 2 reviewer input bundle

### Command

```bash
npm run start -- start \
  --job jobs/<job_slug>.txt \
  --current-cv data/current_cv.txt
```

### Output

```text
outputs/<job_slug>/stage_minus1_analysis.md
outputs/<job_slug>/stage0_acknowledgement.md
outputs/<job_slug>/stage1_draft.md
outputs/<job_slug>/stage2_reviewer_input.md
```

### Internal Steps

1. Load job description.
2. Load current CV.
3. Load base profile.
4. Render Stage -1 prompt.
5. Call provider.
6. Save Stage -1 output.
7. Render Stage 0 prompt.
8. Call provider.
9. Save Stage 0 output.
10. Render Stage 1 prompt.
11. Call provider.
12. Save Stage 1 draft.
13. Render Stage 2 reviewer input.
14. Save Stage 2 reviewer input.

---

## 6.2 Review Workflow

The `review` workflow submits the reviewer bundle to Gemini and captures structured feedback.

### Command

```bash
npm run start -- review \
  --job jobs/<job_slug>.txt \
  --reviewer-input outputs/<job_slug>/stage2_reviewer_input.md
```

### Output

```text
outputs/<job_slug>/stage3_reviewer_output.md
```

### Internal Steps

1. Load job description.
2. Load reviewer input.
3. Call Gemini provider.
4. Receive reviewer feedback.
5. Save Stage 3 reviewer output.

---

## 6.3 Finalize Workflow

The `finalize` workflow generates the final CV and cover letter using reviewer feedback.

### Command

```bash
npm run start -- finalize \
  --job jobs/<job_slug>.txt \
  --current-cv data/current_cv.txt \
  --reviewer-output outputs/<job_slug>/stage3_reviewer_output.md
```

### Output

```text
outputs/<job_slug>/stage4_final.md

outputs/<CV_cover_letter>/cv_final_job_slug.docx
outputs/<CV_cover_letter>/cover_letter_job_slug.docx
```

### Internal Steps

1. Load job description.
2. Load current CV.
3. Load Stage 1 draft.
4. Load reviewer output.
5. Render Stage 4 prompt.
6. Call provider.
7. Save Stage 4 final markdown.
8. Export DOCX files.

---

# 7. Provider Abstraction Layer

The provider layer isolates model-specific logic.

Example interface:

```typescript
export interface LLMProvider {
  generate(prompt: string): Promise<string>;
}
```

Providers may include:

- OpenAI
- Gemini
- Mock provider for testing

The system should allow providers to be swapped without changing workflow logic.

---

# 8. Prompt System

Prompt templates are external markdown files.

Benefits:

- easier iteration
- cleaner testing
- no embedded prompts in business logic
- simpler prompt versioning

Prompt rendering should support:

- variable injection
- stage-specific context
- reusable placeholders

---

# 9. Output Strategy

Every workflow stage writes artifacts to disk.

Benefits:

- debugging visibility
- reproducibility
- manual inspection
- auditability
- prompt iteration support

No stage should rely purely on in-memory state.

---

# 10. DOCX Export

DOCX export occurs after markdown generation is stable.

Responsibilities:

- convert final markdown into formatted DOCX
- generate separate CV and cover letter files
- preserve clean ATS-compatible formatting

Export should remain isolated from prompt orchestration.

---

# 11. Environment Variables

Secrets are expected to be provided through GitHub Codespaces secrets or local environment injection.

Example:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5
OPENAI_BASE_URL=https://api.openai.com/v1
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-pro
```

Rules:

- do not create `.env`
- do not commit secrets
- keep provider credentials external

---

# 12. Development Phases

## Phase 1 — Project Skeleton

Create:

- TypeScript project
- folder structure
- `package.json`
- `tsconfig.json`

Do not integrate providers yet.

---

## Phase 2 — File Loading And Slug Generation

Implement:

- job loading
- CV loading
- output folder creation
- slug generation

---

## Phase 3 — Prompt Rendering

Implement:

- markdown template loading
- variable replacement
- prompt composition

---

## Phase 4 — Provider Integration

Implement:

- provider abstraction
- OpenAI provider
- Gemini provider
- mock provider for testing

---

## Phase 5 — Start Workflow

Implement the complete `start` pipeline.

---

## Phase 6 — Review Workflow

Implement the complete `review` pipeline.

---

## Phase 7 — Finalize Workflow

Implement the complete `finalize` pipeline.

---

## Phase 8 — DOCX Export

Implement markdown-to-DOCX export.

---

# 13. Design Principles

The repository should prioritize:

- clarity over abstraction
- staged workflows over hidden orchestration
- explicit outputs over implicit state
- maintainability over framework complexity
- local reproducibility over cloud dependence

The project is intended as a professional engineering workflow rather than a rapid prototype.

---

# 14. Future Enhancements

Possible future improvements:

- lightweight local UI
- richer DOCX styling
- ATS keyword scoring
- PDF export
- prompt validation
- run metadata tracking
- prompt version history
- configurable provider routing
