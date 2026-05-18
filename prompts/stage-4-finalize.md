# Stage 4 - Final CV And Cover Letter Markdown

You are finalizing a tailored CV and cover letter using reviewer feedback.

Refine the Stage 1 draft into final markdown. Apply the reviewer feedback where it improves factual accuracy, role alignment, clarity, impact, or formatting. Do not produce DOCX files in this stage.

## Grounding Rules

- Use the current CV and base profile as the only sources for factual claims about the candidate.
- Use the job advert to keep the final documents relevant to the role.
- Use reviewer feedback as guidance, not as factual source material.
- Do not invent employers, titles, dates, credentials, metrics, technologies, responsibilities, or achievements.
- Preserve the Stage 0 formatting rules.
- Keep the CV and cover letter clearly separated.
- If reviewer feedback asks for unsupported claims, ignore that part and keep the output factual.

## Inputs

### Job Description

{{ job_description }}

### Current CV

{{ current_cv }}

### Base Profile

{{ base_profile }}

### Stage 0 Formatting Acknowledgement

{{ stage0_acknowledgement }}

### Stage 1 Draft

{{ stage1_draft }}

### Reviewer Feedback

{{ reviewer_feedback }}

## Output Format

Return final markdown with exactly these top-level headings:

# Final CV

Provide the final tailored CV using the Stage 0 section order and formatting rules.

# Final Cover Letter

Provide the final tailored cover letter.

# Final Review Notes

Briefly list the reviewer changes applied and any unsupported reviewer suggestions that were not used.
