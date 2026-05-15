# Fixture Strategy

## Purpose

This document defines how test fixtures should be organized before workflow tests are written.

## Fixture Location

Test fixtures should live under:

```text
tests/fixtures/
```

Recommended structure:

```text
tests/fixtures/
data/
  base_profile.yaml
  current_cv.txt
jobs/
  sample-job.txt
prompts/
  stage-minus-1.md
  stage-0.md
  stage-1.md
  stage-2-reviewer.md
  stage-4-finalize.md
  cv-format-rules.md
```

## Sample Job Naming

Use `sample-job.txt` as the default workflow fixture.

The expected slug is:

```text
sample-job
```

Tests that cover slug edge cases may add separate fixture filenames, but workflow tests should use `sample-job.txt` unless a specific behavior requires another name.

## Fixture Size

Fixtures should stay small and readable:

- sample job advert: 10 to 40 lines
- sample current CV: 20 to 80 lines
- sample base profile: enough fields to verify YAML loading and prompt grounding
- prompt templates: concise templates with all required placeholders

Do not copy real personal CV data into fixtures.

## Test Output Location

Automated tests should write generated files to temporary directories, not the repository-level `outputs/` directory.

Use the real output path shape inside the temporary directory:

```text
<temp_dir>/outputs/<job_slug>/stage1_draft.md
```

Manual verification may write to:

```text
outputs/<job_slug>/
```

## Cleanup

Tests should clean up temporary output directories automatically. Repository-level generated output should not be required for tests to pass.
