# Architecture — Job Application Automation TypeScript Rewrite

## 1. Purpose Of The System

The TypeScript project should reproduce the behaviour of the existing Python repository in a cleaner, incremental way.

The system is a local command-line workflow for creating tailored CVs and cover letters. It takes a job advert, a current CV, a factual base profile, formatting rules, and prompt templates. It then generates staged outputs using an LLM provider and saves all results into a job-specific output folder.

The system is not a full recruitment platform. It is not an application tracker. It is not a web application. The first version should remain a focused local automation tool.

## 2. What The Current Repository Does

The current Python repository performs the following activity:

1. Accepts a job advert file and current CV file from the command line.
2. Reads fixed supporting data from the `data/` folder:
   - factual base profile
   - CV formatting rules
   - detailed Stage 1 drafting prompt
3. Reads prompt templates from the `prompts/` folder.
4. Creates an output folder based on the job filename.
5. Runs Stage -1 role analysis through OpenAI.
6. Runs Stage 0 formatting acknowledgement through OpenAI.
7. Runs Stage 1 CV and cover-letter drafting through OpenAI.
8. Creates Stage 2 reviewer input for manual Gemini review.
9. Waits for the user to save reviewer feedback.
10. Runs Stage 3 final refinement through OpenAI.
11. Splits the final output into CV and cover-letter sections.
12. Exports final `.docx` files.

The important design idea is the staged pipeline. Each stage has a clear input, prompt, output file, and purpose.

## 3. Proposed TypeScript Architecture

The TypeScript rewrite should use a layered command-line architecture.

```text
CLI
 |
 v
Configuration Loader
 |
 v
Orchestrator
 |
 +--> File Reader / Writer
 |
 +--> Prompt Renderer
 |
 +--> Text Generation Provider
 |
 +--> Document Exporter
 |
 v
outputs/<job_slug>/
```

## 4. Main Components

### 4.1 CLI Layer

Proposed file:

```text
src/cli/main.ts
```

Responsibilities:

- Parse command-line arguments.
- Support `start` and `finalize` commands.
- Load settings.
- Create provider instance.
- Create orchestrator instance.
- Print generated output paths.

The CLI should not contain workflow logic.

### 4.2 Configuration Layer

Proposed file:

```text
src/config/settings.ts
```

Responsibilities:

- Load `.env`.
- Read required environment variables.
- Validate required settings.
- Return a typed settings object.

Recommended settings:

```text
OPENAI_API_KEY
OPENAI_MODEL
OPENAI_BASE_URL
```

Use validation so missing configuration fails early with a clear message.

### 4.3 Core Workflow Layer

Proposed files:

```text
src/core/orchestrator.ts
src/core/job-context.ts
src/core/workflow-stage.ts
```

Responsibilities:

- Build the job context.
- Coordinate the staged workflow.
- Keep workflow ordering in one place.
- Save intermediate outputs.
- Return generated file paths to the CLI.

The orchestrator is the most important module, but it should remain readable and procedural in version 1.

### 4.4 File Layer

Proposed files:

```text
src/files/file-reader.ts
src/files/output-writer.ts
src/files/slugify.ts
```

Responsibilities:

- Read UTF-8 text files.
- Read YAML profile data and convert it into stable prompt text.
- Create safe output folder names from job filenames.
- Write markdown output files.
- Ensure output directories exist.

This layer should be easy to unit test.

### 4.5 Prompt Layer

Proposed file:

```text
src/prompts/prompt-renderer.ts
```

Responsibilities:

- Load prompt templates.
- Replace placeholders with runtime values.
- Keep prompt rendering independent from the LLM provider.

Initial placeholder style:

```text
{{ job_description }}
{{ current_cv }}
{{ base_profile }}
{{ cv_format_rules }}
{{ stage_minus1_output }}
{{ stage1_output }}
{{ reviewer_output }}
```

Use simple replacement first. Add strict validation later.

### 4.6 Provider Layer

Proposed files:

```text
src/providers/text-generation-provider.ts
src/providers/openai-provider.ts
```

Responsibilities:

- Hide model-provider details from the workflow.
- Provide one common method for text generation.

Interface:

```ts
export interface TextGenerationProvider {
  generate(prompt: string): Promise<string>;
}
```

The orchestrator should only depend on this interface.

This allows later support for:

- OpenAI
- Gemini
- Anthropic
- fake provider for tests
- local model provider

### 4.7 Export Layer

Proposed file:

```text
src/export/document-exporter.ts
```

Responsibilities:

- Read Stage 3 final markdown text.
- Extract the Final CV section.
- Extract the Final Cover Letter section.
- Write final `.docx` files.

This should be added after the markdown pipeline works.

## 5. Runtime Flow

### 5.1 Start Command

Command:

```bash
npm run start -- start --job jobs/job.txt --current-cv data/current-cv.txt
```

Flow:

```text
CLI
 -> load settings
 -> create provider
 -> build job context
 -> create outputs/<job_slug>/
 -> render Stage -1 prompt
 -> call provider
 -> save stage_minus1_analysis.md
 -> render Stage 0 prompt
 -> call provider
 -> save stage0_acknowledgement.md
 -> render Stage 1 prompt
 -> call provider
 -> save stage1_draft.md
 -> render Stage 2 reviewer input
 -> save stage2_reviewer_input.md
```

Stage 2 should not call Gemini automatically in version 1. The manual review point should remain explicit.

### 5.2 Manual Reviewer Handoff

The user manually copies:

```text
outputs/<job_slug>/stage2_reviewer_input.md
```

into Gemini or another reviewer.

The reviewer response is saved as:

```text
outputs/<job_slug>/stage2_reviewer_output.md
```

### 5.3 Finalize Command

Command:

```bash
npm run start -- finalize \
  --job jobs/job.txt \
  --current-cv data/current-cv.txt \
  --reviewer-output outputs/<job_slug>/stage2_reviewer_output.md
```

Flow:

```text
CLI
 -> load settings
 -> create provider
 -> build job context
 -> load stage1_draft.md
 -> load stage2_reviewer_output.md
 -> render Stage 3 prompt
 -> call provider
 -> save stage3_final.md
 -> export cv_final.docx
 -> export cover_letter_final.docx
```

## 6. Data Flow

```text
Job advert
Current CV
Base profile
CV rules
Step 1 prompt
Prompt templates
   |
   v
JobContext
   |
   v
Rendered prompts
   |
   v
Provider responses
   |
   v
Intermediate markdown files
   |
   v
Manual reviewer output
   |
   v
Stage 3 final markdown
   |
   v
Final DOCX files
```

## 7. Suggested Development Sequence

The rewrite should be developed in small vertical slices.

### Step 1 — Skeleton Only

Create the folder structure, TypeScript config, package scripts, and empty modules.

Outcome:

- Project runs a placeholder CLI command.
- No OpenAI integration.
- No document export.

### Step 2 — File Utilities

Implement:

- `readTextFile`
- `readYamlAsPromptText`
- `slugifyJobFileName`
- `ensureOutputDirectory`
- `writeTextFile`

Outcome:

- The project can load local files and create `outputs/<job_slug>/`.

### Step 3 — Prompt Renderer

Implement:

- `renderTemplate(templateText, variables)`
- `loadAndRenderPrompt(templatePath, variables)`

Outcome:

- Prompt templates can be rendered without calling an LLM.

### Step 4 — Fake Provider

Implement a fake provider that returns deterministic text.

Outcome:

- The full workflow can be tested without API calls or cost.

### Step 5 — Start Workflow

Implement `start` using the fake provider first.

Outcome:

- The expected Stage -1, Stage 0, Stage 1, and Stage 2 files are written.

### Step 6 — OpenAI Provider

Add the real OpenAI provider behind the provider interface.

Outcome:

- The same workflow works with real model calls.

### Step 7 — Finalize Workflow

Implement `finalize` using a saved reviewer output file.

Outcome:

- `stage3_final.md` is produced.

### Step 8 — DOCX Export

Add document export.

Outcome:

- `cv_final.docx` and `cover_letter_final.docx` are produced.

## 8. Key Design Decisions

### Keep The Manual Reviewer Boundary

Do not automate Gemini in the first version. The manual review point is useful because it gives the user control before final generation.

### Keep Generated Files Visible

Every stage should write a file. This makes the workflow auditable and easier to debug.

### Keep Facts Separate From Drafting

`base-profile.yaml` should remain the factual source of truth. Generated CV text should not become the factual source.

### Keep Provider Calls Swappable

The workflow should not know whether the provider is OpenAI, Gemini, or a fake test provider.

### Keep DOCX Export Late

Do not start with DOCX export. First make the markdown workflow reliable.

## 9. Initial Non-Goals

The first TypeScript version should not include:

- Web UI
- database
- job application CRM
- automated job scraping
- automated application submission
- multi-user support
- background scheduler
- full ATS scoring engine
- automatic Gemini integration

These can be added later only after the core workflow is stable.

## 10. Risks And Controls

| Risk | Control |
|---|---|
| Building too much at once | Use the staged development sequence |
| Prompt outputs changing format | Save intermediate files and keep section headers stable |
| Model provider lock-in | Use a provider interface |
| Generated content drifting from facts | Keep base profile as source of truth |
| DOCX export becoming fragile | Add export only after Stage 3 output format is stable |
| High API cost during development | Use a fake provider until orchestration is tested |

## 11. Recommended First Version Boundary

The first working TypeScript version should only prove this:

```text
Given a job advert, CV, base profile, and prompt templates,
the CLI can generate staged markdown outputs into outputs/<job_slug>/
using a fake provider or OpenAI provider.
```

Once that is stable, document export can be added.
