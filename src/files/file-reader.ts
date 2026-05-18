// Loads UTF-8 source files and formats base profile YAML for prompt context.
import { readFile } from "node:fs/promises";
import { parse, stringify } from "yaml";

export async function readTextFile(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(`Unable to read required UTF-8 file at ${filePath}: ${describeFileError(error)}`);
  }
}

export async function readBaseProfileAsPromptText(filePath: string): Promise<string> {
  const rawYaml = await readTextFile(filePath);

  try {
    const profile = parse(rawYaml);

    // Sort keys so prompt text remains deterministic even if YAML parser output changes map order.
    return stringify(profile, { sortMapEntries: true }).trimEnd();
  } catch (error) {
    throw new Error(`Unable to parse base profile YAML at ${filePath}: ${describeFileError(error)}`);
  }
}

function describeFileError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
