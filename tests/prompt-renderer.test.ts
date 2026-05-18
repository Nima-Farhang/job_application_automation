import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  loadPromptTemplate,
  renderPromptTemplate,
  renderPromptTemplateFile,
} from "../src/prompts/prompt-renderer.js";

describe("loadPromptTemplate", () => {
  it("loads markdown prompt templates as UTF-8 text", async () => {
    const templatePath = path.join(process.cwd(), "prompts/stage-minus-1.md");

    await expect(loadPromptTemplate(templatePath)).resolves.toContain("{{ job_description }}");
  });

  it("fails clearly for missing templates", async () => {
    await expect(loadPromptTemplate("prompts/missing.md")).rejects.toThrow("Unable to load prompt template");
  });
});

describe("renderPromptTemplate", () => {
  it("replaces known placeholders with exact variable values", () => {
    const rendered = renderPromptTemplate("Role:\n{{ job_description }}\n\nProfile:\n{{ base_profile }}", {
      base_profile: "name: Sample Person",
      job_description: "Senior Platform Engineer",
    });

    expect(rendered).toBe("Role:\nSenior Platform Engineer\n\nProfile:\nname: Sample Person");
  });

  it("preserves markdown formatting around replaced values", () => {
    const template = [
      "# Reviewer Bundle",
      "",
      "- Role: {{ job_description }}",
      "",
      "```text",
      "{{ current_cv }}",
      "```",
    ].join("\n");

    const rendered = renderPromptTemplate(template, {
      current_cv: "## Experience\n- Built automation",
      job_description: "Platform role",
    });

    expect(rendered).toBe(
      [
        "# Reviewer Bundle",
        "",
        "- Role: Platform role",
        "",
        "```text",
        "## Experience\n- Built automation",
        "```",
      ].join("\n"),
    );
  });

  it("fails clearly when a required variable is missing", () => {
    expect(() => renderPromptTemplate("Draft from {{ stage1_draft }}", {})).toThrow(
      "Missing required prompt variable: stage1_draft",
    );
  });

  it("fails clearly when rendered content still contains unresolved placeholders", () => {
    expect(() =>
      renderPromptTemplate("Feedback:\n{{ reviewer_feedback }}", {
        reviewer_feedback: "Check {{ unknown_placeholder }} before finalizing.",
      }),
    ).toThrow("Rendered prompt contains unresolved placeholders: unknown_placeholder");
  });
});

describe("renderPromptTemplateFile", () => {
  it("loads and renders a prompt template file", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "prompt-renderer-"));
    const templatePath = path.join(tempDirectory, "stage-1.md");

    try {
      await writeFile(templatePath, "CV:\n{{ current_cv }}\n\nJob:\n{{ job_description }}", "utf8");

      await expect(
        renderPromptTemplateFile(templatePath, {
          current_cv: "Current CV text",
          job_description: "Job advert text",
        }),
      ).resolves.toBe("CV:\nCurrent CV text\n\nJob:\nJob advert text");
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });
});
