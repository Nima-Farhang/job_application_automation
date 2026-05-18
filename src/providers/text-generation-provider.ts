export interface TextGenerationProvider {
  generate(prompt: string): Promise<string>;
}
