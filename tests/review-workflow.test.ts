import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { FakeTextGenerationProvider } from "../src/providers/fake-provider.js";
import { runReviewWorkflow } from "../src/workflows/review-workflow.js";

const fixturePath = (...parts: string[]): string => path.join(process.cwd(), "tests/fixtures", ...parts);

describe("runReviewWorkflow", () => {
  it("writes Stage 3 reviewer output from the configured provider", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "review-workflow-"));
    const provider = new FakeTextGenerationProvider();
    const generateSpy = vi.spyOn(provider, "generate");

    try {
      const result = await runReviewWorkflow(
        fixturePath("jobs/sample-job.txt"),
        fixturePath("prompts/stage-2-reviewer.md"),
        provider,
        {
          outputsRoot: path.join(tempDirectory, "outputs"),
        },
      );

      expect(result.jobSlug).toBe("sample-job");
      expect(result.outputDirectory).toBe(path.join(tempDirectory, "outputs", "sample-job"));
      expect(result.outputPath).toBe(
        path.join(tempDirectory, "outputs", "sample-job", "stage3_reviewer_output.md"),
      );
      expect(generateSpy).toHaveBeenCalledTimes(1);
      expect(generateSpy).toHaveBeenCalledWith(expect.stringContaining("# Test Stage 2 Reviewer Bundle"));

      await expect(readFile(result.outputPath, "utf8")).resolves.toContain("Provider: fake");
    } finally {
      generateSpy.mockRestore();
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  it("fails early when the job advert is missing", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "review-workflow-"));

    try {
      await expect(
        runReviewWorkflow(
          path.join(tempDirectory, "missing-job.txt"),
          fixturePath("prompts/stage-2-reviewer.md"),
          new FakeTextGenerationProvider(),
          {
            outputsRoot: path.join(tempDirectory, "outputs"),
          },
        ),
      ).rejects.toThrow("Unable to read required UTF-8 file");
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });
});
