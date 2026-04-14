You are refining an existing CV and cover letter using external reviewer prompts.

Job description:
{{ job_description }}

Current CV and cover letter draft:
{{ stage1_output }}

External reviewer prompts:
{{ reviewer_output }}

Task:
Use the reviewer prompts to refine the CV and cover letter. Keep the final documents factual, concise, and aligned with the job description.

Rules:
- Do not invent experience or metrics.
- Keep dates and role titles accurate.
- Preserve the strongest scale and impact signals.
- Keep the Professional Summary as exactly two short paragraphs if the CV includes one.
- Produce a recruiter-friendly cover letter that is concise and directly aligned to the job.

Output format:
1️⃣ Final CV
2️⃣ Final Cover Letter
3️⃣ Brief Strategic Evaluation
