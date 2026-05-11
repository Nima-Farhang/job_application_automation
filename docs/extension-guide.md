# Extension Guide

This document explains where to make common future changes.

## Add A New Provider

The provider boundary is defined by `src/jobtailor/providers/base.py`.

Any provider must implement:

```python
def generate(self, prompt: str) -> str:
    ...
```

To add a provider:

1. Create a new file under `src/jobtailor/providers/`.
2. Subclass `BaseProvider`.
3. Implement `generate`.
4. Update `src/jobtailor/cli.py` or configuration logic to select the provider.

This is the natural path for automating the current Gemini handoff.

## Automate Stage 2

Stage 2 is currently a saved reviewer prompt, not a model call.

The current behavior lives in:

```text
src/jobtailor/orchestrator.py
```

Look for the section that renders:

```text
prompts/stage2_reviewer.md
```

A future automated Stage 2 could:

- render the reviewer prompt
- send it to a second provider
- save the provider response as `stage2_reviewer_output.md`
- continue directly into Stage 3

Keep the saved input and output files even if Stage 2 becomes automated, because they are valuable for auditability.

## Add A UI

The current CLI is thin, which is good for adding a UI later.

A UI should call the same workflow objects rather than duplicating logic:

- `load_settings`
- `OpenAIProvider` or another provider
- `JobApplicationOrchestrator`
- `build_context`
- `run_start`
- `run_finalize`

This keeps the UI as a presentation layer and leaves the pipeline in Python modules.

## Add A New Stage

To add a stage:

1. Add a prompt template under `prompts/`.
2. Add the required inputs to `JobContext` if they are shared across stages.
3. Render the prompt in `JobApplicationOrchestrator`.
4. Call the provider if the stage is model-backed.
5. Save the output under `outputs/<job_slug>/`.
6. Include the new output in the returned dictionary so the CLI prints it.

Prefer saving every intermediate result. It makes review and debugging much easier.

## Improve DOCX Export

The current DOCX exporter is intentionally simple.

Current behavior:

- split Stage 3 text by expected section headers
- write plain paragraphs
- convert lines beginning with the configured bullet marker into Word bullet paragraphs

The exporter lives in:

```text
src/jobtailor/docx_writer.py
```

Possible improvements:

- support markdown headings
- support bold and italic text
- preserve nested bullets
- add Word styles for CV sections
- export PDF after DOCX generation
- make section extraction more robust

If Stage 3 prompt headings change, update `export_final_docs()` at the same time.

## Improve Prompt Rendering

Prompt rendering currently uses direct string replacement.

This is easy to understand, but it does not detect missing placeholders or escaping issues.

Possible improvements:

- validate that all expected placeholders were filled
- warn when a template contains an unknown placeholder
- move to a lightweight template engine if prompts become more complex

The relevant file is:

```text
src/jobtailor/prompt_builder.py
```

## Add ATS Or Keyword Scoring

ATS scoring would likely fit between Stage -1 and Stage 1, or as a reviewer-style check after Stage 1.

Suggested shape:

- extract required and preferred skills from the job advert
- compare them with current CV and Stage 1 output
- save a score report into `outputs/<job_slug>/`
- feed the report into Stage 3

Keep the scoring output separate from generated prose so it can be inspected independently.

## Add Application Tracking

Application tracking should probably be a separate layer rather than part of the prompt pipeline.

Possible fields:

- company
- role
- job URL
- job file path
- output folder
- date generated
- application status
- notes

A simple first version could be a YAML, CSV, or SQLite file. The workflow already produces a stable `job_slug`, which can be used as the link between tracking data and generated outputs.
