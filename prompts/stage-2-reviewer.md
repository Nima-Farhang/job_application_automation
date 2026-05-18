# Stage 2 - Reviewer Input Bundle

You are assembling a reviewer bundle for an independent reviewer such as Gemini.

Do not rewrite the CV or cover letter. Do not create reviewer feedback yourself. Package the relevant context so the reviewer can assess alignment, factual accuracy, and improvement opportunities.

## Reviewer Instructions

Ask the reviewer to evaluate the Stage 1 draft against the job advert, base profile, Stage -1 analysis, and Stage 0 formatting acknowledgement.

The reviewer should:

- Identify whether the draft matches the real hiring signal.
- Check whether claims are grounded in the base profile.
- Flag unsupported, exaggerated, vague, or generic statements.
- Suggest precise improvements to the CV and cover letter.
- Preserve the Stage 0 formatting rules, especially the two-paragraph professional summary.
- Return actionable refinement prompts or notes, not a full rewrite.

## Inputs For Reviewer

### Job Description

{{ job_description }}

### Base Profile

{{ base_profile }}

### Stage -1 Analysis

{{ stage_minus1_analysis }}

### Stage 0 Formatting Acknowledgement

{{ stage0_acknowledgement }}

### Stage 1 Draft

{{ stage1_draft }}

## Requested Reviewer Output

Ask the reviewer to return markdown with these headings:

# Role Interpretation

# CV Assessment

# Cover Letter Assessment

# Factual Accuracy Risks

# Formatting Risks

# Refinement Prompts

The refinement prompts should be specific enough to pass into Stage 4.
