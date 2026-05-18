import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readBaseProfileAsPromptText, readTextFile } from "../src/files/file-reader.js";

describe("readTextFile", () => {
  it("reads UTF-8 text files", async () => {
    const fixturePath = path.join(process.cwd(), "tests/fixtures/jobs/sample-job.txt");

    await expect(readTextFile(fixturePath)).resolves.toContain("Senior Platform Engineer");
  });

  it("fails clearly for missing files", async () => {
    await expect(readTextFile("tests/fixtures/jobs/missing.txt")).rejects.toThrow(
      "Unable to read required UTF-8 file",
    );
  });
});

describe("readBaseProfileAsPromptText", () => {
  it("reads YAML profile as stable prompt text", async () => {
    const fixturePath = path.join(process.cwd(), "tests/fixtures/data/base_profile.yaml");

    await expect(readBaseProfileAsPromptText(fixturePath)).resolves.toBe(
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
  });

  it("fails clearly for invalid YAML", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "base-profile-"));
    const invalidYamlPath = path.join(tempDirectory, "base_profile.yaml");

    try {
      await writeFile(invalidYamlPath, "name: Sample\nbad: [", "utf8");

      await expect(readBaseProfileAsPromptText(invalidYamlPath)).rejects.toThrow(
        "Unable to parse base profile YAML",
      );
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });
});
