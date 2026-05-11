# Architecture

This document explains the main components of the job application automation tool and how they work together.

## High-Level Shape

The application is a command-line pipeline. The CLI accepts a job advert and current CV, the orchestrator loads supporting data, prompt templates are rendered into full prompts, a provider sends selected prompts to OpenAI, and outputs are written into a job-specific folder.

The current system keeps one manual boundary: Stage 2 prepares reviewer input for Gemini or another external reviewer, but does not call that reviewer automatically.

## Runtime Flow

```text
User command
  |
  v
run.py
  |
  v
src/jobtailor/cli.py
  |
  v
load settings + create provider
  |
  v
JobApplicationOrchestrator
  |
  v
prompt templates + data files
  |
  v
OpenAI provider calls
  |
  v
outputs/<job_slug>/
  |
  v
manual reviewer handoff
  |
  v
Stage 3 refinement + DOCX export
```

## Components

### `run.py`

The smallest entry point. It imports `main` from `src.jobtailor.cli` and runs it when the file is executed directly.

### `src/jobtailor/cli.py`

Owns command-line parsing and top-level application wiring.

It defines two commands:

- `start`: runs Stage -1, Stage 0, Stage 1, and creates Stage 2 reviewer input.
- `finalize`: reads reviewer output, runs Stage 3, and exports final documents.

It also resolves the project root, loads settings, creates the OpenAI provider, builds a `JobContext`, and prints generated file paths.

### `src/jobtailor/config.py`

Loads runtime configuration from environment variables and optionally a local `.env` file.

Important settings:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_BASE_URL`

In Codespaces, these can come from secrets exposed as environment variables.

### `src/jobtailor/orchestrator.py`

Coordinates the actual workflow.

Responsibilities:

- Create the output directory for each job.
- Load job text, current CV, base profile, and formatting rules.
- Render prompts for each stage.
- Call the provider for model-backed stages.
- Save intermediate markdown output.
- Export final DOCX files during finalization.

This is the core workflow module.

### `src/jobtailor/prompt_builder.py`

Provides simple template rendering. Prompt files use placeholders such as:

```text
{{ job_description }}
{{ current_cv }}
{{ base_profile }}
```

The renderer performs direct string replacement.

### `src/jobtailor/providers/`

Contains provider abstractions.

- `base.py` defines the `BaseProvider` interface.
- `openai_provider.py` implements `BaseProvider` with the OpenAI Responses API.

The orchestrator only depends on `BaseProvider.generate(prompt)`, which makes it possible to add another provider later.

### `src/jobtailor/docx_writer.py`

Converts final Stage 3 text into DOCX files.

It expects Stage 3 output to include recognizable final-section headers:

- `Final CV`
- `Final Cover Letter`
- `Brief Strategic Evaluation`

The exporter extracts the CV and cover letter sections and writes:

- `cv_final.docx`
- `cover_letter_final.docx`

### `src/jobtailor/models.py`

Defines shared data structures. Currently the main structure is `JobContext`, which carries loaded input text and output paths through the workflow.

### `src/jobtailor/files.py`

Small helper module for reading files, converting YAML into prompt-friendly text, and creating safe output folder names.

## Boundaries

The application has three useful boundaries:

- **CLI boundary:** user commands and printed summaries.
- **Provider boundary:** model calls behind `BaseProvider`.
- **Output boundary:** every generated artifact is written to `outputs/<job_slug>/`.

These boundaries make it easier to add a UI, another provider, or richer output formats without rewriting the whole tool.
