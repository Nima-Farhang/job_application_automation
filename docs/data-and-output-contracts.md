# Data And Output Contracts

## Purpose

This document defines the expected input files, output files, naming conventions, and ownership rules for generated content.

## Input Files

### Base Profile

Current file:

```text
data/base_profile.yaml
```

Purpose:

- source of truth for factual claims
- reusable across applications
- should not be overwritten by generated content

Implementation rule:

- read as YAML when structured access is needed
- also support rendering it as stable text for prompts

### Current CV

Current file:

```text
data/current_cv.txt
```

Purpose:

- current CV source material
- used as input for tailoring

Implementation rule:

- read as plain UTF-8 text
- do not modify during workflows

### Job Advert

Expected path:

```text
jobs/<job_slug>.txt
```

Purpose:

- role-specific input
- used to derive the output folder slug

Implementation rule:

- read as plain UTF-8 text
- filename without extension becomes the job slug

### Prompt Templates

Expected path:

```text
prompts/*.md
```

Purpose:

- version-controlled stage instructions
- editable without recompiling TypeScript

## Output Directories

### Stage Outputs

Expected path:

```text
outputs/<job_slug>/
```

The implementation should create this directory if it does not exist.

### Final Document Outputs

Expected future path:

```text
outputs/CV_cover_letter/
```

DOCX files are out of scope until the markdown workflow is stable.

## Stage Output Files

The first version should use these exact filenames:

```text
outputs/<job_slug>/stage_minus1_analysis.md
outputs/<job_slug>/stage0_acknowledgement.md
outputs/<job_slug>/stage1_draft.md
outputs/<job_slug>/stage2_reviewer_input.md
outputs/<job_slug>/stage3_reviewer_output.md
outputs/<job_slug>/stage4_final.md
```

## File Ownership Rules

- Files in `data/` are user-owned source material.
- Files in `jobs/` are user-owned job inputs.
- Files in `prompts/` are project-owned templates.
- Files in `outputs/` are generated artifacts.
- Generated artifacts should not become the source of truth for factual data.

## Overwrite Behavior

For version 1, workflows may overwrite existing stage output files for the same job slug.

Before adding non-overwrite or run-history behavior, the implementation should keep the simple path contract stable.

## Encoding

All text input and output files should use UTF-8.

## Future Run Metadata

Run metadata is not required for the first milestone. If added later, it may include:

- timestamp
- command
- provider name
- model name
- prompt template versions
- output file list

