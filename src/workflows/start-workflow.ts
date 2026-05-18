// Orchestrates the start workflow stages and writes each generated artifact to disk.
import { createJobOutputDirectory, writeMarkdownOutput } from "../files/output-writer.js";
import { renderPromptTemplate, renderPromptTemplateFile } from "../prompts/prompt-renderer.js";
import type { TextGenerationProvider } from "../providers/text-generation-provider.js";
import { buildJobContext, type JobContext } from "./job-context.js";

export interface StartWorkflowPromptPaths {
  stageMinus1: string;
  stage0: string;
  stage1: string;
  stage2Reviewer: string;
}

export interface StartWorkflowOptions {
  outputsRoot?: string;
  baseProfilePath?: string;
  promptPaths?: Partial<StartWorkflowPromptPaths>;
}

export interface StartWorkflowResult {
  context: JobContext;
  outputDirectory: string;
  outputPaths: StartWorkflowOutputPaths;
}

export interface StartWorkflowOutputPaths {
  stageMinus1Analysis: string;
  stage0Acknowledgement: string;
  stage1Draft: string;
  stage2ReviewerInput: string;
}

const DEFAULT_OUTPUTS_ROOT = "outputs";

const DEFAULT_PROMPT_PATHS: StartWorkflowPromptPaths = {
  stageMinus1: "prompts/stage-minus-1.md",
  stage0: "prompts/stage-0.md",
  stage1: "prompts/stage-1.md",
  stage2Reviewer: "prompts/stage-2-reviewer.md",
};

export async function runStartWorkflow(
  jobAdvertPath: string,
  currentCvPath: string,
  provider: TextGenerationProvider,
  options: StartWorkflowOptions = {},
): Promise<StartWorkflowResult> {
  const promptPaths = { ...DEFAULT_PROMPT_PATHS, ...options.promptPaths };
  const context = await buildJobContext(jobAdvertPath, currentCvPath, {
    baseProfilePath: options.baseProfilePath,
    cvFormatRulesPath: promptPaths.stage0,
  });
  const outputDirectory = await createJobOutputDirectory(options.outputsRoot ?? DEFAULT_OUTPUTS_ROOT, context.jobSlug);

  const stageMinus1Prompt = await renderPromptTemplateFile(promptPaths.stageMinus1, {
    job_description: context.jobDescription,
    base_profile: context.baseProfile,
  });
  const stageMinus1Analysis = await provider.generate(stageMinus1Prompt);
  const stageMinus1Path = await writeMarkdownOutput(
    outputDirectory,
    "stage_minus1_analysis.md",
    stageMinus1Analysis,
  );

  const stage0Prompt = renderPromptTemplate(context.cvFormatRules, {});
  const stage0Acknowledgement = await provider.generate(stage0Prompt);
  const stage0Path = await writeMarkdownOutput(outputDirectory, "stage0_acknowledgement.md", stage0Acknowledgement);

  const stage1Prompt = await renderPromptTemplateFile(promptPaths.stage1, {
    job_description: context.jobDescription,
    current_cv: context.currentCv,
    base_profile: context.baseProfile,
    stage_minus1_analysis: stageMinus1Analysis,
    stage0_acknowledgement: stage0Acknowledgement,
  });
  const stage1Draft = await provider.generate(stage1Prompt);
  const stage1Path = await writeMarkdownOutput(outputDirectory, "stage1_draft.md", stage1Draft);

  const stage2ReviewerInput = await renderPromptTemplateFile(promptPaths.stage2Reviewer, {
    job_description: context.jobDescription,
    base_profile: context.baseProfile,
    stage_minus1_analysis: stageMinus1Analysis,
    stage0_acknowledgement: stage0Acknowledgement,
    stage1_draft: stage1Draft,
  });
  const stage2Path = await writeMarkdownOutput(outputDirectory, "stage2_reviewer_input.md", stage2ReviewerInput);

  return {
    context,
    outputDirectory,
    outputPaths: {
      stageMinus1Analysis: stageMinus1Path,
      stage0Acknowledgement: stage0Path,
      stage1Draft: stage1Path,
      stage2ReviewerInput: stage2Path,
    },
  };
}
