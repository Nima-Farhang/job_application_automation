# Job Application Automation

`job_application_automation` is a local Python workflow tool for producing tailored CVs and cover letters from a job advert, your current CV, and a factual base profile.

The project intentionally keeps your existing multi-stage process visible. It automates the repetitive prompt building, OpenAI calls, file saving, and final DOCX export, while preserving one manual reviewer handoff to Gemini or another external reviewer.

## What It Does

The workflow has five stages:

- **Stage -1:** Analyze the job advert and identify the strongest signals to respond to.
- **Stage 0:** Load and acknowledge your CV formatting rules.
- **Stage 1:** Generate a first-pass tailored CV and cover letter.
- **Stage 2:** Create a reviewer bundle that you paste into Gemini or another reviewer.
- **Stage 3:** Refine the draft using reviewer feedback and export final documents.

The main output is a job-specific folder under `outputs/<job_slug>/` containing intermediate markdown files and final `.docx` documents.

## Current Project Structure

```text
job_application_automation/
|-- data/
|   |-- base_profile.yaml
|   |-- current_cv.txt
|   |-- cv_format_rules.md
|   `-- step1_prompt.md
|-- docs/
|   |-- architecture.md
|   |-- data-flow.md
|   `-- extension-guide.md
|-- outputs/
|   `-- <job_slug>/
|-- prompts/
|   |-- stage_minus1.md
|   |-- stage0.md
|   |-- stage1.md
|   |-- stage2_reviewer.md
|   `-- stage3_refine.md
|-- src/jobtailor/
|   |-- __init__.py
|   |-- api_test.py
|   |-- cli.py
|   |-- config.py
|   |-- docx_writer.py
|   |-- files.py
|   |-- models.py
|   |-- orchestrator.py
|   |-- prompt_builder.py
|   `-- providers/
|       |-- __init__.py
|       |-- base.py
|       `-- openai_provider.py
|-- Workflow.md
|-- LICENSE
`-- run.py
```

## Setup

This repository is designed to run in GitHub Codespaces using the `.devcontainer` setup and repository/Codespaces secrets.

Required environment variables:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5
OPENAI_BASE_URL=https://api.openai.com/v1
```

`OPENAI_MODEL` and `OPENAI_BASE_URL` have defaults in code, but `OPENAI_API_KEY` is required.

You can quickly verify OpenAI access with:

```bash
python src/jobtailor/api_test.py
```

## Base Data

Keep these files current:

- `data/base_profile.yaml`: factual source of truth for dates, titles, technologies, achievements, and experience.
- `data/current_cv.txt`: current CV content used as source material.
- `data/cv_format_rules.md`: formatting rules used during Stage 0.
- `data/step1_prompt.md`: detailed drafting instructions injected into Stage 1.

The generated writing should come from these maintained facts rather than inventing new claims.

## Usage

Place a job advert in any text file. The examples below use `jobs/job.txt`, but the file can live anywhere as long as you pass the path.

Run the initial workflow:

```bash
python run.py start --job jobs/job.txt --current-cv data/current_cv.txt
```

This creates:

- `outputs/<job_slug>/stage_minus1_analysis.md`
- `outputs/<job_slug>/stage0_acknowledgement.md`
- `outputs/<job_slug>/stage1_draft.md`
- `outputs/<job_slug>/stage2_reviewer_input.md`

Paste `outputs/<job_slug>/stage2_reviewer_input.md` into Gemini or another reviewer, then save the reviewer response as:

```text
outputs/<job_slug>/stage2_reviewer_output.md
```

Run final refinement:

```bash
python run.py finalize --job jobs/job.txt --current-cv data/current_cv.txt --reviewer-output outputs/<job_slug>/stage2_reviewer_output.md
```

This creates:

- `outputs/<job_slug>/stage3_final.md`
- `outputs/<job_slug>/cv_final.docx`
- `outputs/<job_slug>/cover_letter_final.docx`

## How The Code Is Organized

- `run.py` is the small command entry point.
- `src/jobtailor/cli.py` parses commands and wires settings, provider, and orchestrator together.
- `src/jobtailor/config.py` loads OpenAI settings from environment variables or a local `.env`.
- `src/jobtailor/orchestrator.py` coordinates the staged workflow.
- `src/jobtailor/prompt_builder.py` loads prompt templates and replaces placeholders.
- `src/jobtailor/files.py` contains file and slug helper functions.
- `src/jobtailor/models.py` contains shared workflow data structures.
- `src/jobtailor/docx_writer.py` extracts final sections and writes DOCX files.
- `src/jobtailor/providers/` contains the provider abstraction and OpenAI implementation.

## Documentation

Additional architecture notes live in `docs/`:

- `docs/architecture.md`: component responsibilities and runtime flow.
- `docs/data-flow.md`: how source data moves through prompts, model calls, reviewer output, and final documents.
- `docs/extension-guide.md`: where to add providers, stages, UI, scoring, or richer document export.

`Workflow.md` remains the quick operational checklist.

## Design Principles

- Keep prompts as versioned markdown files.
- Keep factual data separate from generated writing.
- Preserve intermediate outputs for review and debugging.
- Keep the Gemini handoff explicit until a second provider is added.
- Keep the core workflow independent from any future UI.

## Known Limitations

- Stage 2 is currently manual.
- DOCX export is intentionally simple and depends on recognizable Stage 3 section headers.
- Prompt rendering uses simple placeholder replacement rather than a full template engine.
- The workflow assumes the model output follows the requested markdown structure.

## Useful Commands

Run the start workflow:

```bash
python run.py start --job jobs/job.txt --current-cv data/current_cv.txt
```

Run final refinement:

```bash
python run.py finalize --job jobs/job.txt --current-cv data/current_cv.txt --reviewer-output outputs/job/stage2_reviewer_output.md
```

Run a syntax check:

```bash
python -m compileall run.py src/jobtailor
```
