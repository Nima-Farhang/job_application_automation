import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { FakeTextGenerationProvider } from "../src/providers/fake-provider.js";
import { runStartWorkflow } from "../src/workflows/start-workflow.js";

const fixturePath = (...parts: string[]): string => path.join(process.cwd(), "tests/fixtures", ...parts);

describe("runStartWorkflow", () => {
  it("writes all expected start workflow stage files", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "start-workflow-"));
    const provider = new FakeTextGenerationProvider();
    const generateSpy = vi.spyOn(provider, "generate");

    try {
      const result = await runStartWorkflow(
        fixturePath("jobs/sample-job.txt"),
        fixturePath("data/current_cv.txt"),
        provider,
        {
          outputsRoot: path.join(tempDirectory, "outputs"),
          baseProfilePath: fixturePath("data/base_profile.yaml"),
          promptPaths: {
            stageMinus1: fixturePath("prompts/stage-minus-1.md"),
            stage0: fixturePath("prompts/stage-0.md"),
            stage1: fixturePath("prompts/stage-1.md"),
            stage2Reviewer: fixturePath("prompts/stage-2-reviewer.md"),
          },
        },
      );

      expect(result.context.jobSlug).toBe("sample-job");
      expect(result.outputDirectory).toBe(path.join(tempDirectory, "outputs", "sample-job"));
      expect(generateSpy).toHaveBeenCalledTimes(3);

      await expect(readFile(result.outputPaths.stageMinus1Analysis, "utf8")).resolves.toContain(
        "Provider: fake",
      );
      await expect(readFile(result.outputPaths.stage0Acknowledgement, "utf8")).resolves.toContain(
        "Provider: fake",
      );
      await expect(readFile(result.outputPaths.stage1Draft, "utf8")).resolves.toContain("Provider: fake");
      await expect(readFile(result.outputPaths.stage2ReviewerInput, "utf8")).resolves.toContain(
        "# Test Stage 2 Reviewer Bundle",
      );
    } finally {
      generateSpy.mockRestore();
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  it("renders Stage 2 from prior artifacts without calling the provider again", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "start-workflow-"));
    const provider = new FakeTextGenerationProvider();
    const generateSpy = vi.spyOn(provider, "generate");

    try {
      const result = await runStartWorkflow(
        fixturePath("jobs/sample-job.txt"),
        fixturePath("data/current_cv.txt"),
        provider,
        {
          outputsRoot: path.join(tempDirectory, "outputs"),
          baseProfilePath: fixturePath("data/base_profile.yaml"),
          promptPaths: {
            stageMinus1: fixturePath("prompts/stage-minus-1.md"),
            stage0: fixturePath("prompts/stage-0.md"),
            stage1: fixturePath("prompts/stage-1.md"),
            stage2Reviewer: fixturePath("prompts/stage-2-reviewer.md"),
          },
        },
      );

      const stage2ReviewerInput = await readFile(result.outputPaths.stage2ReviewerInput, "utf8");

      expect(generateSpy).toHaveBeenCalledTimes(3);
      expect(stage2ReviewerInput).toContain("Draft:");
      expect(stage2ReviewerInput).toContain("Provider: fake");
      expect(stage2ReviewerInput).toContain("Prompt preview:");
    } finally {
      generateSpy.mockRestore();
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });
});
