// Defines the command-line entry point for the local job application automation tool.
import { Command } from "commander";
import { FakeTextGenerationProvider } from "../providers/fake-provider.js";
import { runReviewWorkflow } from "../workflows/review-workflow.js";
import { runStartWorkflow } from "../workflows/start-workflow.js";

const program = new Command();

program
  .name("job-application-automation")
  .description("Local CLI for staged job application document generation.")
  .version("0.1.0");

program
  .command("start")
  .description("Run Stage -1 through Stage 2 for a job advert.")
  .requiredOption("--job <path>", "Path to the job advert text file.")
  .requiredOption("--current-cv <path>", "Path to the current CV text file.")
  .action(async (options: { job: string; currentCv: string }) => {
    const provider = new FakeTextGenerationProvider();
    const result = await runStartWorkflow(options.job, options.currentCv, provider);

    console.log("Start workflow complete: " + result.outputDirectory);
  });

program
  .command("review")
  .description("Run Stage 3 reviewer feedback generation for a job advert.")
  .requiredOption("--job <path>", "Path to the job advert text file.")
  .requiredOption("--reviewer-input <path>", "Path to the Stage 2 reviewer input bundle.")
  .action(async (options: { job: string; reviewerInput: string }) => {
    const provider = new FakeTextGenerationProvider();
    const result = await runReviewWorkflow(options.job, options.reviewerInput, provider);

    console.log("Review workflow complete: " + result.outputPath);
  });

try {
  await program.parseAsync(process.argv);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(message);
  process.exitCode = 1;
}
