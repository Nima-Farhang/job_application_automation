import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createJobOutputDirectory, writeMarkdownOutput } from "../src/files/output-writer.js";

describe("createJobOutputDirectory", () => {
  it("creates a job-specific output directory", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "outputs-"));

    try {
      const outputDirectory = await createJobOutputDirectory(path.join(tempDirectory, "outputs"), "sample-job");

      expect(outputDirectory).toBe(path.join(tempDirectory, "outputs", "sample-job"));
      await expect(writeMarkdownOutput(outputDirectory, "stage1_draft.md", "Draft")).resolves.toBe(
        path.join(outputDirectory, "stage1_draft.md"),
      );
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  it("fails clearly for an empty job slug", async () => {
    await expect(createJobOutputDirectory("outputs", " ")).rejects.toThrow(
      "Cannot create a job output directory without a job slug.",
    );
  });
});

describe("writeMarkdownOutput", () => {
  it("writes markdown files with UTF-8 content", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "outputs-"));

    try {
      const outputDirectory = path.join(tempDirectory, "outputs", "sample-job");
      const outputPath = await writeMarkdownOutput(outputDirectory, "stage_minus1_analysis.md", "# Analysis\n");

      await expect(readFile(outputPath, "utf8")).resolves.toBe("# Analysis\n");
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  it("overwrites expected stage files when rerun", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "outputs-"));

    try {
      const outputDirectory = path.join(tempDirectory, "outputs", "sample-job");
      const outputPath = await writeMarkdownOutput(outputDirectory, "stage1_draft.md", "first");
      await writeMarkdownOutput(outputDirectory, "stage1_draft.md", "second");

      await expect(readFile(outputPath, "utf8")).resolves.toBe("second");
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  it("fails clearly for non-markdown output names", async () => {
    await expect(writeMarkdownOutput("outputs/sample-job", "stage1_draft.txt", "Draft")).rejects.toThrow(
      "Markdown output filename must end with .md",
    );
  });
});
