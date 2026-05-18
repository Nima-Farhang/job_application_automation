// Derives stable job slugs from job advert filenames for output folder names.
import path from "node:path";

export function deriveJobSlug(jobAdvertPath: string): string {
  const rawBaseName = path.basename(jobAdvertPath).trim();

  if (rawBaseName.startsWith(".")) {
    throw new Error(`Cannot derive job slug from an empty filename: ${jobAdvertPath}`);
  }

  const extension = path.extname(rawBaseName);
  const baseName = path.basename(rawBaseName, extension).trim();

  if (baseName === "") {
    throw new Error(`Cannot derive job slug from an empty filename: ${jobAdvertPath}`);
  }

  const slug = baseName
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (slug === "") {
    throw new Error(`Cannot derive a valid job slug from path: ${jobAdvertPath}`);
  }

  return slug;
}
