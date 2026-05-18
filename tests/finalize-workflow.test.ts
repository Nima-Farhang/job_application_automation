import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { FakeTextGenerationProvider } from "../src/providers/fake-provider.js";
import { runFinalizeWorkflow } from "../src/workflows/finalize-workflow.js";

const fixturePath = (...parts: string[]): string => path.join(process.cwd(), "tests/fixtures", ...parts);

describe("runFinalizeWorkflow", () => {
  it("renders Stage 4, calls the provider, and writes final markdown", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "finalize-workflow-"));
    const outputsRoot = path.join(tempDirectory, "outputs");
    const jobOutputDirectory = path.join(outputsRoot, "sample-job");
    const reviewerOutputPath = path.join(jobOutputDirectory, "stage3_reviewer_output.md");
    const provider = new FakeTextGenerationProvider();
    const generateSpy = vi.spyOn(provider, "generate");

    try {
      await mkdir(jobOutputDirectory, { recursive: true });
      await writeFile(path.join(jobOutputDirectory, "stage0_acknowledgement.md"), "Stage 0 ack", "utf8");
      await writeFile(path.join(jobOutputDirectory, "stage1_draft.md"), "Stage 1 draft", "utf8");
      await writeFile(reviewerOutputPath, "Reviewer feedback", "utf8");

      const result = await runFinalizeWorkflow(
        fixturePath("jobs/sample-job.txt"),
        fixturePath("data/current_cv.txt"),
        reviewerOutputPath,
        provider,
        {
          outputsRoot,
          baseProfilePath: fixturePath("data/base_profile.yaml"),
          stage4PromptPath: path.join(process.cwd(), "prompts/stage-4-finalize.md"),
        },
      );

      expect(result.jobSlug).toBe("sample-job");
      expect(result.outputDirectory).toBe(jobOutputDirectory);
      expect(result.outputPath).toBe(path.join(jobOutputDirectory, "stage4_final.md"));
      expect(generateSpy).toHaveBeenCalledTimes(1);
      expect(generateSpy).toHaveBeenCalledWith(expect.stringContaining("Reviewer feedback"));
      expect(generateSpy).toHaveBeenCalledWith(expect.stringContaining("Stage 1 draft"));
      expect(generateSpy).toHaveBeenCalledWith(expect.stringContaining("Stage 0 ack"));

      await expect(readFile(result.outputPath, "utf8")).resolves.toContain("Provider: fake");
    } finally {
      generateSpy.mockRestore();
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  it("fails when the saved Stage 1 draft is missing", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "finalize-workflow-"));
    const outputsRoot = path.join(tempDirectory, "outputs");
    const jobOutputDirectory = path.join(outputsRoot, "sample-job");
    const reviewerOutputPath = path.join(jobOutputDirectory, "stage3_reviewer_output.md");

    try {
      await mkdir(jobOutputDirectory, { recursive: true });
      await writeFile(path.join(jobOutputDirectory, "stage0_acknowledgement.md"), "Stage 0 ack", "utf8");
      await writeFile(reviewerOutputPath, "Reviewer feedback", "utf8");

      await expect(
        runFinalizeWorkflow(
          fixturePath("jobs/sample-job.txt"),
          fixturePath("data/current_cv.txt"),
          reviewerOutputPath,
          new FakeTextGenerationProvider(),
          {
            outputsRoot,
            baseProfilePath: fixturePath("data/base_profile.yaml"),
            stage4PromptPath: path.join(process.cwd(), "prompts/stage-4-finalize.md"),
          },
        ),
      ).rejects.toThrow("Unable to read required UTF-8 file");
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });
});
