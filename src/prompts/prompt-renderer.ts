// Loads markdown prompt templates and renders double-curly placeholders.
import { readFile } from "node:fs/promises";

export type PromptVariables = Record<string, string>;

const placeholderPattern = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

export async function loadPromptTemplate(templatePath: string): Promise<string> {
  try {
    return await readFile(templatePath, "utf8");
  } catch (error) {
    throw new Error(`Unable to load prompt template at ${templatePath}: ${describeError(error)}`);
  }
}

export async function renderPromptTemplateFile(
  templatePath: string,
  variables: PromptVariables,
): Promise<string> {
  const template = await loadPromptTemplate(templatePath);

  return renderPromptTemplate(template, variables);
}

export function renderPromptTemplate(template: string, variables: PromptVariables): string {
  const requiredVariableNames = collectPlaceholderNames(template);

  for (const variableName of requiredVariableNames) {
    if (!(variableName in variables)) {
      throw new Error(`Missing required prompt variable: ${variableName}`);
    }
  }

  const rendered = template.replace(placeholderPattern, (_placeholder, variableName: string) => {
    return variables[variableName];
  });
  const unresolvedPlaceholders = collectPlaceholderNames(rendered);

  // A replacement value can itself contain a placeholder, so validate after rendering too.
  if (unresolvedPlaceholders.length > 0) {
    throw new Error(`Rendered prompt contains unresolved placeholders: ${unresolvedPlaceholders.join(", ")}`);
  }

  return rendered;
}

function collectPlaceholderNames(content: string): string[] {
  const names = new Set<string>();

  for (const match of content.matchAll(placeholderPattern)) {
    names.add(match[1]);
  }

  return [...names];
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
