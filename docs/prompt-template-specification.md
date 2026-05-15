# Prompt Template Specification

## Purpose

Prompt templates are markdown files that define the instructions for each workflow stage. They should remain editable without changing TypeScript source code.

## Template Location

Use one prompt directory in the TypeScript project. The preferred directory is:

```text
prompts/
```

Expected files:

```text
prompts/stage-minus-1.md
prompts/stage-0.md
prompts/stage-1.md
prompts/stage-2-reviewer.md
prompts/stage-4-finalize.md
prompts/cv-format-rules.md
```

Use `prompts/` consistently throughout the project. Do not introduce a second prompt directory.

## Placeholder Format

Templates use double curly placeholders:

```text
{{ job_description }}
{{ current_cv }}
{{ base_profile }}
{{ cv_format_rules }}
{{ stage_minus1_analysis }}
{{ stage0_acknowledgement }}
{{ stage1_draft }}
{{ reviewer_feedback }}
```

The first implementation should use simple exact replacement. No loops, conditionals, or embedded scripting are required.

## Required Variables By Stage

### Stage -1

Purpose: analyse the job advert and identify the real hiring signal.

Recommended variables:

- `{{ job_description }}`
- `{{ base_profile }}`

### Stage 0

Purpose: acknowledge and preserve CV formatting rules.

Recommended variables:

- `{{ cv_format_rules }}`

### Stage 1

Purpose: create first-pass tailored CV and cover letter draft.

Recommended variables:

- `{{ job_description }}`
- `{{ current_cv }}`
- `{{ base_profile }}`
- `{{ cv_format_rules }}`
- `{{ stage_minus1_analysis }}`
- `{{ stage0_acknowledgement }}`

### Stage 2 Reviewer Bundle

Purpose: assemble a reviewer prompt for Gemini or another reviewer.

Recommended variables:

- `{{ job_description }}`
- `{{ base_profile }}`
- `{{ cv_format_rules }}`
- `{{ stage_minus1_analysis }}`
- `{{ stage1_draft }}`

Stage 2 may be rendered and saved without a provider call.

### Stage 4 Finalize

Purpose: refine the draft using reviewer feedback.

Recommended variables:

- `{{ job_description }}`
- `{{ current_cv }}`
- `{{ base_profile }}`
- `{{ cv_format_rules }}`
- `{{ stage1_draft }}`
- `{{ reviewer_feedback }}`

## Rendering Rules

- Missing required variables should cause a clear error.
- Unknown placeholders should cause a clear error in tests.
- Rendered prompts should be returned as strings.
- Prompt rendering should not call providers.
- Prompt rendering should not write files.

## Prompt Quality Rules

Prompts should:

- protect factual accuracy by grounding claims in `base_profile.yaml`
- avoid inventing experience, employers, dates, credentials, or achievements
- preserve the formatting intent from `cv-format-rules.md`
- ask for concise, ATS-compatible output
- keep CV and cover letter sections clearly separated in generated markdown
