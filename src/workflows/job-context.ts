// Builds the typed input context shared by workflow stages before prompt rendering or provider calls.
import { readBaseProfileAsPromptText, readTextFile } from "../files/file-reader.js";
import { deriveJobSlug } from "../files/slugify.js";

export interface JobContext {
  jobSlug: string;
  paths: JobContextPaths;
  jobDescription: string;
  currentCv: string;
  baseProfile: string;
  cvFormatRules: string;
}

export interface JobContextPaths {
  jobAdvert: string;
  currentCv: string;
  baseProfile: string;
  cvFormatRules: string;
}

export interface BuildJobContextOptions {
  baseProfilePath?: string;
  cvFormatRulesPath?: string;
}

const DEFAULT_BASE_PROFILE_PATH = "data/base_profile.yaml";
const DEFAULT_CV_FORMAT_RULES_PATH = "prompts/stage-0.md";

export async function buildJobContext(
  jobAdvertPath: string,
  currentCvPath: string,
  options: BuildJobContextOptions = {},
): Promise<JobContext> {
  const paths: JobContextPaths = {
    jobAdvert: jobAdvertPath,
    currentCv: currentCvPath,
    baseProfile: options.baseProfilePath ?? DEFAULT_BASE_PROFILE_PATH,
    cvFormatRules: options.cvFormatRulesPath ?? DEFAULT_CV_FORMAT_RULES_PATH,
  };

  const jobSlug = deriveJobSlug(paths.jobAdvert);
  const [jobDescription, currentCv, baseProfile, cvFormatRules] = await Promise.all([
    readTextFile(paths.jobAdvert),
    readTextFile(paths.currentCv),
    readBaseProfileAsPromptText(paths.baseProfile),
    readTextFile(paths.cvFormatRules),
  ]);

  return {
    jobSlug,
    paths,
    jobDescription,
    currentCv,
    baseProfile,
    cvFormatRules,
  };
}
