# Requirements - TypeScript Rewrite

## Purpose

This document defines what the first TypeScript version must do before implementation starts. It keeps the development phase focused on a local, staged CLI workflow for producing tailored CV and cover letter drafts.

## Product Scope

The system must:

- run locally as a command-line tool
- accept a job advert file as input
- load the current CV from a text file
- load the factual base profile from YAML
- load CV formatting rules from a markdown prompt file
- render prompt templates with explicit variables
- call a text generation provider through an interface
- write every stage output to disk
- preserve manual review points
- support a fake provider before real provider integration
- produce final markdown before DOCX export is added

The system must not:

- scrape job boards
- submit job applications
- track application status
- provide a web UI in version 1
- store data in a database
- treat generated content as factual source material
- commit secrets or local `.env` files

## Functional Requirements

### FR1 - Start Workflow

The CLI must support:

```bash
npm run start -- start --job jobs/<job_slug>.txt --current-cv data/current_cv.txt
```

The workflow must:

1. load the job advert
2. load the current CV
3. load the base profile
4. load CV formatting rules
5. render the Stage -1 prompt
6. generate and save Stage -1 analysis
7. render the Stage 0 prompt
8. generate and save Stage 0 acknowledgement
9. render the Stage 1 prompt
10. generate and save Stage 1 draft
11. render and save the Stage 2 reviewer input bundle

### FR2 - Review Workflow

The CLI must support:

```bash
npm run start -- review --job jobs/<job_slug>.txt --reviewer-input outputs/<job_slug>/stage2_reviewer_input.md
```

The workflow must:

1. load the job advert
2. load the reviewer input bundle
3. generate or accept reviewer feedback
4. save Stage 3 reviewer output

Version 1 may use a fake provider or manual reviewer output. Automated Gemini integration is not required for the first useful milestone.

### FR3 - Finalize Workflow

The CLI must support:

```bash
npm run start -- finalize --job jobs/<job_slug>.txt --current-cv data/current_cv.txt --reviewer-output outputs/<job_slug>/stage3_reviewer_output.md
```

The workflow must:

1. load the job advert
2. load the current CV
3. load the base profile
4. load the Stage 1 draft
5. load the reviewer output
6. render the final refinement prompt
7. generate and save Stage 4 final markdown

DOCX export is a later requirement after the markdown workflow is stable.

## Non-Functional Requirements

- Keep implementation modular and testable.
- Keep the CLI layer thin.
- Keep provider-specific logic out of workflow orchestration.
- Keep prompt templates outside TypeScript source files.
- Keep output paths predictable.
- Fail with clear messages when input files are missing.
- Do not hide intermediate files.
- Prefer deterministic behavior when using the fake provider.

## First Milestone Acceptance Criteria

The first development milestone is complete when:

1. project skeleton exists
2. inputs can be loaded from disk
3. job slug can be derived from the job filename
4. output directories are created
5. prompt templates can be rendered
6. fake provider can simulate generation
7. `start` writes the expected markdown outputs
8. unit tests cover slugging, file loading, prompt rendering, and the start workflow
