# Job Application Automation Workflow

This workflow automates the multi-stage CV and cover letter generation process using your existing tools (ChatGPT/OpenAI and Gemini). It reduces manual copying and pasting while keeping stages visible and editable.

## Base Data Preparation

Maintain the following files in the `data/` directory:

- **`data/base_profile.yaml`**: Your factual source of truth containing dates, titles, technologies, scales, and achievements.
- **`data/cv_format_rules.md`**: Step 0 formatting rules for CV structure.
- **`data/current_cv.txt`**: Your current CV content.

## Step-by-Step Workflow

1. Place the job advertisement into `jobs/<file>.txt` (e.g., `jobs/sample_staff_analytics_engineer.txt`).

2. Run the initial stages (Stage -1, Stage 0, Stage 1):

   ```bash
   python run.py start --job jobs/job.txt --current-cv data/current_cv.txt
   ```

   This generates:
   - `outputs/<job_slug>/stage_minus1_analysis.md`
   - `outputs/<job_slug>/stage0_acknowledgment.md`
   - `outputs/<job_slug>/stage1_draft.md`
   - `outputs/<job_slug>/stage2_reviewer_input.md`

3. Paste the content of `outputs/<job_slug>/stage2_reviewer_input.md` into Gemini (or another external reviewer) once.

4. Save Gemini's response as `outputs/<job_slug>/stage2_reviewer_output.md`.

5. Run the final refinement (Stage 3):
   ```bash
   python run.py finalize --job jobs/sample_staff_analytics_engineer.txt --current-cv data/current_cv.txt --reviewer-output outputs/<job_slug>/stage2_reviewer_output.md
   ```
   This generates the final outputs:
   - `outputs/<job_slug>/stage3_final.md`
   - `outputs/<job_slug>/cv_final.docx`
   - `outputs/<job_slug>/cover_letter_final.docx`

## Notes

- The `<job_slug>` is automatically generated based on the job file name.
- Outputs are saved in the `outputs/<job_slug>/` directory.
- This process keeps one manual handoff to Gemini but automates the rest for reliability.
