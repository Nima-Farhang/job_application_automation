import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { exportFinalDocuments, exportFinalDocumentsFromFile } from "../src/export/document-exporter.js";

const finalMarkdown = [
  "# Final CV",
  "",
  "## Profile",
  "Plain ATS-friendly CV content.",
  "",
  "- One concise achievement",
  "",
  "# Final Cover Letter",
  "",
  "Dear Hiring Team,",
  "",
  "Plain ATS-friendly cover letter content.",
  "",
  "# Final Review Notes",
  "",
  "- Applied reviewer feedback.",
].join("\n");

describe("document exporter", () => {
  it("exports CV and cover letter DOCX files from final markdown", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "document-exporter-"));

    try {
      const result = await exportFinalDocuments("sample-job", finalMarkdown, {
        outputsRoot: path.join(tempDirectory, "outputs"),
      });

      expect(result.outputDirectory).toBe(path.join(tempDirectory, "outputs", "CV_cover_letter"));
      expect(result.cvPath).toBe(path.join(result.outputDirectory, "cv_final_sample-job.docx"));
      expect(result.coverLetterPath).toBe(path.join(result.outputDirectory, "cover_letter_sample-job.docx"));

      const cvBytes = await readFile(result.cvPath);
      const coverLetterBytes = await readFile(result.coverLetterPath);

      expect(cvBytes.subarray(0, 2).toString("utf8")).toBe("PK");
      expect(coverLetterBytes.subarray(0, 2).toString("utf8")).toBe("PK");
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  it("can read Stage 4 final markdown from disk", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "document-exporter-"));
    const stage4Path = path.join(tempDirectory, "stage4_final.md");

    try {
      await writeFile(stage4Path, finalMarkdown, "utf8");

      const result = await exportFinalDocumentsFromFile("sample-job", stage4Path, {
        outputsRoot: path.join(tempDirectory, "outputs"),
      });

      await expect(readFile(result.cvPath)).resolves.toBeInstanceOf(Buffer);
      await expect(readFile(result.coverLetterPath)).resolves.toBeInstanceOf(Buffer);
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  it("fails clearly when final markdown is missing required document headings", async () => {
    await expect(exportFinalDocuments("sample-job", "# Final CV\nOnly CV")).rejects.toThrow(
      "Final markdown must include '# Final CV' and '# Final Cover Letter' headings.",
    );
  });
});
