// Creates workflow output directories and writes generated markdown artifacts.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function createJobOutputDirectory(outputsRoot: string, jobSlug: string): Promise<string> {
  if (jobSlug.trim() === "") {
    throw new Error("Cannot create a job output directory without a job slug.");
  }

  const outputDirectory = path.join(outputsRoot, jobSlug);

  try {
    await mkdir(outputDirectory, { recursive: true });
    return outputDirectory;
  } catch (error) {
    throw new Error(`Unable to create output directory at ${outputDirectory}: ${describeFileError(error)}`);
  }
}

export async function writeMarkdownOutput(
  outputDirectory: string,
  fileName: string,
  content: string,
): Promise<string> {
  if (!fileName.endsWith(".md")) {
    throw new Error(`Markdown output filename must end with .md: ${fileName}`);
  }

  const outputPath = path.join(outputDirectory, fileName);

  try {
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(outputPath, content, "utf8");
    return outputPath;
  } catch (error) {
    throw new Error(`Unable to write markdown output at ${outputPath}: ${describeFileError(error)}`);
  }
}

function describeFileError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
