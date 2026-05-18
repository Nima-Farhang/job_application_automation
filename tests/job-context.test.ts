import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildJobContext } from "../src/workflows/job-context.js";

const fixturePath = (...parts: string[]): string => path.join(process.cwd(), "tests/fixtures", ...parts);

describe("buildJobContext", () => {
  it("derives the job slug and loads all workflow input text", async () => {
    const context = await buildJobContext(
      fixturePath("jobs/sample-job.txt"),
      fixturePath("data/current_cv.txt"),
      {
        baseProfilePath: fixturePath("data/base_profile.yaml"),
        cvFormatRulesPath: fixturePath("prompts/stage-0.md"),
      },
    );

    expect(context.jobSlug).toBe("sample-job");
    expect(context.jobDescription).toContain("Senior Platform Engineer");
    expect(context.currentCv).toContain("Platform engineer with experience");
    expect(context.baseProfile).toBe(
      [
        "experience:",
        "  current_role: Platform Engineer",
        "  years: 5",
        "name: Sample Person",
        "skills:",
        "  - TypeScript",
        "  - Automation",
      ].join("\n"),
    );
    expect(context.cvFormatRules).toContain("Use ALL CAPS section headings");
  });

  it("returns the source paths used to build the context", async () => {
    const jobAdvertPath = fixturePath("jobs/sample-job.txt");
    const currentCvPath = fixturePath("data/current_cv.txt");
    const baseProfilePath = fixturePath("data/base_profile.yaml");
    const cvFormatRulesPath = fixturePath("prompts/stage-0.md");

    await expect(
      buildJobContext(jobAdvertPath, currentCvPath, {
        baseProfilePath,
        cvFormatRulesPath,
      }),
    ).resolves.toMatchObject({
      paths: {
        jobAdvert: jobAdvertPath,
        currentCv: currentCvPath,
        baseProfile: baseProfilePath,
        cvFormatRules: cvFormatRulesPath,
      },
    });
  });

  it("fails clearly when a required input file is missing", async () => {
    await expect(
      buildJobContext(fixturePath("jobs/missing-job.txt"), fixturePath("data/current_cv.txt"), {
        baseProfilePath: fixturePath("data/base_profile.yaml"),
        cvFormatRulesPath: fixturePath("prompts/stage-0.md"),
      }),
    ).rejects.toThrow("Unable to read required UTF-8 file");
  });
});
