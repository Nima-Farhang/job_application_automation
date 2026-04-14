# Job Application Automation

A practical local Python tool that automates your current multi-stage CV and cover letter workflow.

This first version is intentionally built around your existing process rather than replacing it with an opaque agent. It supports:

- Stage -1: job signal analysis
- Stage 0: CV formatting rule initialisation
- Stage 1: first-pass CV and cover letter generation
- Stage 2: reviewer prompt package export for Gemini or another external reviewer
- Stage 3: final refinement using the reviewer output

## Why this design

Your current process already works. The slow part is the manual copying and pasting between tools. This project reduces that friction while keeping the stages visible and editable.

It also gives you a clean migration path later:
- keep your current ChatGPT + Gemini workflow now
- switch Stage 2 to the same provider later if you want
- add a small UI later without changing the core pipeline

## Project structure

```text
job_application_automation/
├── data/
│   ├── base_profile.yaml
│   ├── current_cv.txt
│   └── cv_format_rules.md
├── jobs/
│   └── sample_staff_analytics_engineer.txt
├── outputs/
├── prompts/
│   ├── stage_minus1.md
│   ├── stage0.md
│   ├── stage1.md
│   ├── stage2_reviewer.md
│   └── stage3_refine.md
├── src/jobtailor/
│   ├── __init__.py
│   ├── cli.py
│   ├── config.py
│   ├── docx_writer.py
│   ├── files.py
│   ├── models.py
│   ├── orchestrator.py
│   ├── prompt_builder.py
│   └── providers/
│       ├── __init__.py
│       ├── base.py
│       └── openai_provider.py
├── .env.example
├── requirements.txt
└── run.py
```

## What is automated in v1

### ChatGPT / OpenAI side
- Build prompts from templates
- Inject job description, profile, current CV, and experience pool
- Run Stage -1, Stage 1, and Stage 3
- Save outputs to markdown
- Export docx versions of CV and cover letter from the final markdown

### Gemini side
- Generate a ready-to-paste reviewer bundle for Stage 2
- Save it into `outputs/<job_slug>/stage2_reviewer_input.md`
- You paste that once into Gemini and save Gemini's reply as
  `outputs/<job_slug>/stage2_reviewer_output.md`
- Then Stage 3 uses it automatically

This still includes one manual handoff, but removes most of the repetitive work and keeps the process reliable.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# or .venv\Scripts\activate on Windows

pip install -r requirements.txt
cp .env.example .env
```

Set your API key in `.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5
```

## Base data you should maintain

### `data/base_profile.yaml`
This is your factual source of truth.
Keep dates, titles, technologies, scales, and achievements here.

### `data/cv_format_rules.md`
This contains your Step 0 formatting rules.

## Typical usage

### 1) Run Stage -1 and Stage 1
```bash
python run.py start   --job jobs/sample_staff_analytics_engineer.txt   --current-cv data/current_cv.txt
```

Outputs:
- `stage_minus1_analysis.md`
- `stage1_draft.md`
- `stage2_reviewer_input.md`

### 2) Paste `stage2_reviewer_input.md` into Gemini
Save Gemini's response to:
- `outputs/<job_slug>/stage2_reviewer_output.md`

### 3) Run final refinement
```bash
python run.py finalize   --job jobs/sample_staff_analytics_engineer.txt   --current-cv data/current_cv.txt   --reviewer-output outputs/<job_slug>/stage2_reviewer_output.md
```

Outputs:
- `stage3_final.md`
- `cv_final.docx`
- `cover_letter_final.docx`

## Optional next upgrades

- Replace the manual Gemini handoff with a second provider client
- Add a Streamlit UI
- Add ATS keyword scoring
- Add structured extraction of CV and cover letter sections from markdown
- Add job application tracking

## Notes on output quality

This tool is designed to be deterministic where possible and model-driven where useful:
- prompts are versioned files
- profile facts are stored separately from generated writing
- outputs are preserved for review
- formatting rules stay explicit rather than hidden in code
