// Exports final Stage 4 markdown into plain ATS-compatible DOCX documents.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as docx from "docx";

const { Document, HeadingLevel, Packer, Paragraph, TextRun } = docx as Record<string, any>;

export interface DocumentExportOptions {
  outputsRoot?: string;
}

export interface DocumentExportResult {
  outputDirectory: string;
  cvPath: string;
  coverLetterPath: string;
}

const DEFAULT_OUTPUTS_ROOT = "outputs";
const FINAL_DOCUMENTS_DIRECTORY = "CV_cover_letter";

export async function exportFinalDocumentsFromFile(
  jobSlug: string,
  stage4FinalPath: string,
  options: DocumentExportOptions = {},
): Promise<DocumentExportResult> {
  const finalMarkdown = await readStage4Markdown(stage4FinalPath);

  return exportFinalDocuments(jobSlug, finalMarkdown, options);
}

export async function exportFinalDocuments(
  jobSlug: string,
  finalMarkdown: string,
  options: DocumentExportOptions = {},
): Promise<DocumentExportResult> {
  const normalizedJobSlug = validateJobSlug(jobSlug);
  const sections = splitFinalMarkdown(finalMarkdown);
  const outputDirectory = path.join(options.outputsRoot ?? DEFAULT_OUTPUTS_ROOT, FINAL_DOCUMENTS_DIRECTORY);
  const cvPath = path.join(outputDirectory, `cv_final_${normalizedJobSlug}.docx`);
  const coverLetterPath = path.join(outputDirectory, `cover_letter_${normalizedJobSlug}.docx`);

  try {
    await mkdir(outputDirectory, { recursive: true });
    await Promise.all([
      writeDocxFile(cvPath, "Final CV", sections.cv),
      writeDocxFile(coverLetterPath, "Final Cover Letter", sections.coverLetter),
    ]);
  } catch (error) {
    throw new Error(`Unable to export DOCX documents for ${normalizedJobSlug}: ${describeFileError(error)}`);
  }

  return {
    outputDirectory,
    cvPath,
    coverLetterPath,
  };
}

interface FinalMarkdownSections {
  cv: string;
  coverLetter: string;
}

function splitFinalMarkdown(finalMarkdown: string): FinalMarkdownSections {
  const cvStart = findHeadingIndex(finalMarkdown, "Final CV");
  const coverLetterStart = findHeadingIndex(finalMarkdown, "Final Cover Letter");
  const reviewNotesStart = findHeadingIndex(finalMarkdown, "Final Review Notes");

  if (cvStart === -1 || coverLetterStart === -1) {
    throw new Error("Final markdown must include '# Final CV' and '# Final Cover Letter' headings.");
  }

  if (coverLetterStart <= cvStart) {
    throw new Error("'# Final Cover Letter' must appear after '# Final CV'.");
  }

  const cv = finalMarkdown.slice(cvStart, coverLetterStart).trim();
  const coverLetterEnd = reviewNotesStart > coverLetterStart ? reviewNotesStart : finalMarkdown.length;
  const coverLetter = finalMarkdown.slice(coverLetterStart, coverLetterEnd).trim();

  if (cv.length === 0 || coverLetter.length === 0) {
    throw new Error("Final markdown CV and cover letter sections cannot be empty.");
  }

  return { cv, coverLetter };
}

function findHeadingIndex(markdown: string, heading: string): number {
  const headingPattern = new RegExp(`^#\\s+${escapeRegExp(heading)}\\s*$`, "m");
  const match = headingPattern.exec(markdown);

  return match?.index ?? -1;
}

async function readStage4Markdown(stage4FinalPath: string): Promise<string> {
  try {
    return await readFile(stage4FinalPath, "utf8");
  } catch (error) {
    throw new Error(`Unable to read Stage 4 final markdown at ${stage4FinalPath}: ${describeFileError(error)}`);
  }
}

async function writeDocxFile(outputPath: string, title: string, markdown: string): Promise<void> {
  const document = new Document({
    sections: [
      {
        properties: {},
        children: markdownToParagraphs(title, markdown),
      },
    ],
  });
  const buffer = await Packer.toBuffer(document);

  await writeFile(outputPath, buffer);
}

function markdownToParagraphs(title: string, markdown: string): any[] {
  const paragraphs: any[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
    }),
  ];

  for (const line of markdown.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0) {
      paragraphs.push(new Paragraph(""));
      continue;
    }

    paragraphs.push(markdownLineToParagraph(trimmedLine));
  }

  return paragraphs;
}

function markdownLineToParagraph(line: string): any {
  const headingMatch = /^(#{1,3})\s+(.+)$/.exec(line);

  if (headingMatch !== null) {
    const headingLevelByDepth = {
      1: HeadingLevel.HEADING_1,
      2: HeadingLevel.HEADING_2,
      3: HeadingLevel.HEADING_3,
    } as const;

    return new Paragraph({
      text: headingMatch[2],
      heading: headingLevelByDepth[headingMatch[1].length as 1 | 2 | 3],
    });
  }

  const bulletMatch = /^[-*]\s+(.+)$/.exec(line);

  if (bulletMatch !== null) {
    return new Paragraph({
      children: [new TextRun(bulletMatch[1])],
      bullet: { level: 0 },
    });
  }

  return new Paragraph({
    children: [new TextRun(line)],
  });
}

function validateJobSlug(jobSlug: string): string {
  const normalizedJobSlug = jobSlug.trim();

  if (normalizedJobSlug.length === 0) {
    throw new Error("Cannot export DOCX documents without a job slug.");
  }

  return normalizedJobSlug;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function describeFileError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
