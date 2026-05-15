# Testing Strategy

## Purpose

This document defines the minimum test coverage needed before and during the first development milestone.

## Test Framework

Recommended framework:

```text
vitest
```

## Testing Principles

- Test deterministic logic directly.
- Use a fake provider for workflow tests.
- Avoid network calls in unit tests.
- Avoid testing OpenAI or Gemini behavior in the first milestone.
- Keep fixture files small and readable.

## Unit Tests

### Slug Generation

Cover:

- filename without extension becomes slug
- nested paths are ignored
- spaces become hyphens if supported
- uppercase input becomes lowercase if supported
- invalid or empty names fail clearly

### File Reader

Cover:

- reads UTF-8 text files
- fails clearly for missing files
- reads YAML profile as stable prompt text

### Output Writer

Cover:

- creates job output directory
- writes markdown files
- overwrites expected stage files when rerun

### Prompt Renderer

Cover:

- replaces known placeholders
- preserves markdown formatting
- fails on missing required variables
- fails or warns on unresolved placeholders

### Fake Provider

Cover:

- returns deterministic output
- includes enough context to identify which prompt was processed
- does not make network calls

## Workflow Tests

### Start Workflow

Use fixtures for:

- sample job advert
- sample current CV
- sample base profile
- sample prompt templates

Assert that these files are written:

```text
stage_minus1_analysis.md
stage0_acknowledgement.md
stage1_draft.md
stage2_reviewer_input.md
```

### Review Workflow

Assert that reviewer output is written to:

```text
stage3_reviewer_output.md
```

### Finalize Workflow

Assert that final markdown is written to:

```text
stage4_final.md
```

## Manual Verification

After automated tests pass, manually run:

```bash
npm run start -- start --job jobs/sample-job.txt --current-cv data/current_cv.txt
```

Then inspect:

```text
outputs/sample-job/
```

The generated files should be readable markdown and should preserve the stage sequence.

## Out Of Scope For First Milestone

- live OpenAI integration tests
- live Gemini integration tests
- DOCX visual regression tests
- PDF export tests
- ATS scoring tests

