import { describe, expect, it } from "vitest";
import { deriveJobSlug } from "../src/files/slugify.js";

describe("deriveJobSlug", () => {
  it("uses the filename without extension as the slug", () => {
    expect(deriveJobSlug("jobs/senior-platform-engineer.txt")).toBe("senior-platform-engineer");
  });

  it("ignores nested paths", () => {
    expect(deriveJobSlug("/tmp/jobs/sample-job.txt")).toBe("sample-job");
  });

  it("converts spaces and uppercase letters", () => {
    expect(deriveJobSlug("jobs/Senior Platform Engineer.txt")).toBe("senior-platform-engineer");
  });

  it("converts underscores to hyphens", () => {
    expect(deriveJobSlug("jobs/senior_platform_engineer.txt")).toBe("senior-platform-engineer");
  });

  it("fails clearly for empty names", () => {
    expect(() => deriveJobSlug("jobs/.txt")).toThrow("Cannot derive job slug from an empty filename");
  });

  it("fails clearly when no valid slug characters remain", () => {
    expect(() => deriveJobSlug("jobs/!!!.txt")).toThrow("Cannot derive a valid job slug");
  });
});
