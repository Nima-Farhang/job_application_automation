// Defines the command-line entry point for the local job application automation tool.
import { Command } from "commander";

const program = new Command();

program
  .name("job-application-automation")
  .description("Local CLI for staged job application document generation.")
  .version("0.1.0");

program.parse();
