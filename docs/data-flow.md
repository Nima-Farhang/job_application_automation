# Data Flow

This document describes how source data moves through the workflow and which files are produced at each stage.

## Input Sources

The workflow starts with four main inputs:

- Job advert text passed with `--job`.
- Current CV text passed with `--current-cv`.
- Base profile facts from `data/base_profile.yaml`.
- Formatting and drafting guidance from `data/cv_format_rules.md` and `data/step1_prompt.md`.

Prompt templates live in `prompts/`.

## Job Slug

The output folder name is created from the job file name.

Example:

```text
jobs/Senior Data Engineer.txt
```

becomes:

```text
outputs/senior_data_engineer/
```

If the file name cannot produce a useful slug, the fallback is:

```text
outputs/job/
```

## Start Command Flow

Command:

```bash
python run.py start --job jobs/job.txt --current-cv data/current_cv.txt
```

### Context Creation

`JobApplicationOrchestrator.build_context()` reads:

- job description
- current CV
- base profile YAML
- CV formatting rules

It stores these values in a `JobContext`.

### Stage -1

Template:

```text
prompts/stage_minus1.md
```

Inputs:

- job description

Output:

```text
outputs/<job_slug>/stage_minus1_analysis.md
```

Purpose:

Analyze the job before drafting so the later stages can respond to the right signals.

### Stage 0

Template:

```text
prompts/stage0.md
```

Inputs:

- CV formatting rules

Output:

```text
outputs/<job_slug>/stage0_acknowledgement.md
```

Purpose:

Make the model acknowledge the structure and formatting constraints.

### Stage 1

Template:

```text
prompts/stage1.md
```

Additional drafting instructions:

```text
data/step1_prompt.md
```

Inputs:

- current CV
- base profile
- job description
- Step 1 drafting prompt

Output:

```text
outputs/<job_slug>/stage1_draft.md
```

Purpose:

Generate the first full tailored CV and cover letter draft.

### Stage 2 Reviewer Input

Template:

```text
prompts/stage2_reviewer.md
```

Inputs:

- job description
- Stage -1 output
- Stage 1 output

Output:

```text
outputs/<job_slug>/stage2_reviewer_input.md
```

Purpose:

Create a single bundle that can be pasted into Gemini or another external reviewer.

## Manual Reviewer Handoff

Paste:

```text
outputs/<job_slug>/stage2_reviewer_input.md
```

into the reviewer.

Save the review response as:

```text
outputs/<job_slug>/stage2_reviewer_output.md
```

The filename matters because it is passed into the finalize command.

## Finalize Command Flow

Command:

```bash
python run.py finalize --job jobs/job.txt --current-cv data/current_cv.txt --reviewer-output outputs/<job_slug>/stage2_reviewer_output.md
```

### Stage 3

Template:

```text
prompts/stage3_refine.md
```

Inputs:

- job description
- Stage 1 draft
- reviewer output

Output:

```text
outputs/<job_slug>/stage3_final.md
```

Purpose:

Refine the draft using external critique while preserving factual accuracy.

### DOCX Export

`docx_writer.py` extracts sections from `stage3_final.md` and writes:

```text
outputs/<job_slug>/cv_final.docx
outputs/<job_slug>/cover_letter_final.docx
```

The extraction depends on the expected Stage 3 headings. If a section cannot be isolated, the exporter falls back to safer default behavior and prints a warning.

## Output Inventory

After a complete run, a job folder usually contains:

```text
stage_minus1_analysis.md
stage0_acknowledgement.md
stage1_draft.md
stage2_reviewer_input.md
stage2_reviewer_output.md
stage3_final.md
cv_final.docx
cover_letter_final.docx
```

These files are useful for reviewing decisions, rerunning only the final stage, or debugging prompt behavior.
