# Workflow Specification

## Purpose

This document defines the expected behavior of each workflow command. It is the contract the implementation should follow.

## Source Of Truth

This file is the binding source of truth for runtime behavior, CLI commands, stage order, and output filenames.

If project documents conflict, follow this file for behavior and `docs/project-workflow.md` for implementation order.

## Shared Concepts

### Job Slug

The job slug is derived from the job advert filename without its extension.

Example:

```text
jobs/senior-platform-engineer.txt -> senior-platform-engineer
```

The slug is used as the output folder name:

```text
outputs/senior-platform-engineer/
```

### Output Rule

Every generated or assembled stage artifact must be written to disk. Later stages should read prior stage artifacts from disk instead of relying only on in-memory state.

### Provider Rule

Any LLM call must go through the provider interface. Workflows must not import OpenAI, Gemini, or another SDK directly.

### Stage Summary

| Stage | Purpose | Main Inputs | Provider Call | Output |
|---|---|---|---|---|
| Stage -1 | Analyze the job advert and identify the hiring signal | job advert, base profile | Yes | `stage_minus1_analysis.md` |
| Stage 0 | Establish and acknowledge CV formatting rules from `stage-0.md` | Stage 0 prompt instructions | Yes | `stage0_acknowledgement.md` |
| Stage 1 | Generate the first-pass tailored CV and cover letter draft | job advert, current CV, base profile, Stage -1 analysis, Stage 0 acknowledgement | Yes | `stage1_draft.md` |
| Stage 2 | Assemble the reviewer input bundle | job advert, base profile, Stage -1 analysis, Stage 0 acknowledgement, Stage 1 draft | No | `stage2_reviewer_input.md` |
| Stage 3 | Generate or capture reviewer feedback | Stage 2 reviewer input bundle | Yes, or manual later | `stage3_reviewer_output.md` |
| Stage 4 | Refine the draft into final markdown using reviewer feedback | job advert, current CV, base profile, Stage 1 draft, Stage 3 reviewer output | Yes | `stage4_final.md` |

## Start Workflow

### Command

```bash
npm run start -- start --job jobs/<job_slug>.txt --current-cv data/current_cv.txt
```

### Inputs

- job advert file
- current CV file
- `data/base_profile.yaml`
- prompt templates
- Stage 0 prompt instructions

### Outputs

```text
outputs/<job_slug>/stage_minus1_analysis.md
outputs/<job_slug>/stage0_acknowledgement.md
outputs/<job_slug>/stage1_draft.md
outputs/<job_slug>/stage2_reviewer_input.md
```

### Stage Sequence

1. Build job context.
2. Render Stage -1 prompt with job advert and base profile.
3. Generate Stage -1 analysis through provider.
4. Save `stage_minus1_analysis.md`.
5. Render Stage 0 prompt.
6. Generate Stage 0 acknowledgement through provider.
7. Save `stage0_acknowledgement.md`.
8. Render Stage 1 prompt with job advert, current CV, base profile, Stage -1 analysis, and Stage 0 acknowledgement.
9. Generate Stage 1 draft through provider.
10. Save `stage1_draft.md`.
11. Render Stage 2 reviewer bundle from the job advert, base profile, Stage -1 analysis, Stage 0 acknowledgement, and Stage 1 draft.
12. Save `stage2_reviewer_input.md`.

Stage 2 does not need a provider call in the first implementation.

## Review Workflow

### Command

```bash
npm run start -- review --job jobs/<job_slug>.txt --reviewer-input outputs/<job_slug>/stage2_reviewer_input.md
```

### Inputs

- job advert file
- Stage 2 reviewer input bundle

### Output

```text
outputs/<job_slug>/stage3_reviewer_output.md
```

### Stage Sequence

1. Load job advert.
2. Load Stage 2 reviewer input bundle.
3. Generate reviewer feedback through the configured reviewer provider or fake provider.
4. Save `stage3_reviewer_output.md`.

Manual reviewer feedback may be added later by placing content at the expected Stage 3 path.

## Finalize Workflow

### Command

```bash
npm run start -- finalize --job jobs/<job_slug>.txt --current-cv data/current_cv.txt --reviewer-output outputs/<job_slug>/stage3_reviewer_output.md
```

### Inputs

- job advert file
- current CV file
- base profile
- Stage 1 draft
- Stage 3 reviewer output
- final refinement prompt

### Outputs

```text
outputs/<job_slug>/stage4_final.md
```

Later DOCX export will add:

```text
outputs/CV_cover_letter/cv_final_<job_slug>.docx
outputs/CV_cover_letter/cover_letter_<job_slug>.docx
```

### Stage Sequence

1. Load job advert.
2. Load current CV.
3. Load base profile.
4. Load `outputs/<job_slug>/stage1_draft.md`.
5. Load Stage 3 reviewer output.
6. Render final refinement prompt.
7. Generate final markdown through provider.
8. Save `stage4_final.md`.

## Error Behavior

The CLI should fail early with a clear message when:

- a required input path does not exist
- a prompt template is missing
- a required placeholder has no value
- an output path cannot be created
- provider configuration is invalid
