// Orchestrates the final markdown workflow stage using reviewer feedback and saved draft artifacts.
import path from "node:path";
import { exportFinalDocuments, type DocumentExportResult } from "../export/document-exporter.js";
import { readBaseProfileAsPromptText, readTextFile } from "../files/file-reader.js";
import { writeMarkdownOutput } from "../files/output-writer.js";
import { deriveJobSlug } from "../files/slugify.js";
import { renderPromptTemplateFile } from "../prompts/prompt-renderer.js";
import type { TextGenerationProvider } from "../providers/text-generation-provider.js";

export interface FinalizeWorkflowOptions {
  outputsRoot?: string;
  baseProfilePath?: string;
  stage4PromptPath?: string;
  exportDocx?: boolean;
}

export interface FinalizeWorkflowResult {
  jobSlug: string;
  outputDirectory: string;
  outputPath: string;
  finalDocuments?: DocumentExportResult;
}

const DEFAULT_OUTPUTS_ROOT = "outputs";
const DEFAULT_BASE_PROFILE_PATH = "data/base_profile.yaml";
const DEFAULT_STAGE4_PROMPT_PATH = "prompts/stage-4-finalize.md";

export async function runFinalizeWorkflow(
  jobAdvertPath: string,
  currentCvPath: string,
  reviewerOutputPath: string,
  provider: TextGenerationProvider,
  options: FinalizeWorkflowOptions = {},
): Promise<FinalizeWorkflowResult> {
  const jobSlug = deriveJobSlug(jobAdvertPath);
  const outputDirectory = path.join(options.outputsRoot ?? DEFAULT_OUTPUTS_ROOT, jobSlug);
  const stage0AcknowledgementPath = path.join(outputDirectory, "stage0_acknowledgement.md");
  const stage1DraftPath = path.join(outputDirectory, "stage1_draft.md");

  const [jobDescription, currentCv, baseProfile, stage0Acknowledgement, stage1Draft, reviewerFeedback] =
    await Promise.all([
      readTextFile(jobAdvertPath),
      readTextFile(currentCvPath),
      readBaseProfileAsPromptText(options.baseProfilePath ?? DEFAULT_BASE_PROFILE_PATH),
      readTextFile(stage0AcknowledgementPath),
      readTextFile(stage1DraftPath),
      readTextFile(reviewerOutputPath),
    ]);

  const stage4Prompt = await renderPromptTemplateFile(options.stage4PromptPath ?? DEFAULT_STAGE4_PROMPT_PATH, {
    job_description: jobDescription,
    current_cv: currentCv,
    base_profile: baseProfile,
    stage0_acknowledgement: stage0Acknowledgement,
    stage1_draft: stage1Draft,
    reviewer_feedback: reviewerFeedback,
  });
  const finalMarkdown = await provider.generate(stage4Prompt);
  const outputPath = await writeMarkdownOutput(outputDirectory, "stage4_final.md", finalMarkdown);
  const finalDocuments =
    options.exportDocx === true
      ? await exportFinalDocuments(jobSlug, finalMarkdown, { outputsRoot: options.outputsRoot ?? DEFAULT_OUTPUTS_ROOT })
      : undefined;

  return {
    jobSlug,
    outputDirectory,
    outputPath,
    finalDocuments,
  };
}
