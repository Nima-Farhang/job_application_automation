// Orchestrates the reviewer workflow stage and writes reviewer feedback to disk.
import { createJobOutputDirectory, writeMarkdownOutput } from "../files/output-writer.js";
import { readTextFile } from "../files/file-reader.js";
import { deriveJobSlug } from "../files/slugify.js";
import type { TextGenerationProvider } from "../providers/text-generation-provider.js";

export interface ReviewWorkflowOptions {
  outputsRoot?: string;
}

export interface ReviewWorkflowResult {
  jobSlug: string;
  outputDirectory: string;
  outputPath: string;
}

const DEFAULT_OUTPUTS_ROOT = "outputs";

export async function runReviewWorkflow(
  jobAdvertPath: string,
  reviewerInputPath: string,
  provider: TextGenerationProvider,
  options: ReviewWorkflowOptions = {},
): Promise<ReviewWorkflowResult> {
  const jobSlug = deriveJobSlug(jobAdvertPath);

  // Stage 3 intentionally treats the Stage 2 bundle as the reviewer prompt.
  await readTextFile(jobAdvertPath);
  const reviewerInput = await readTextFile(reviewerInputPath);
  const outputDirectory = await createJobOutputDirectory(options.outputsRoot ?? DEFAULT_OUTPUTS_ROOT, jobSlug);
  const reviewerOutput = await provider.generate(reviewerInput);
  const outputPath = await writeMarkdownOutput(outputDirectory, "stage3_reviewer_output.md", reviewerOutput);

  return {
    jobSlug,
    outputDirectory,
    outputPath,
  };
}
