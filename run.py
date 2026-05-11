"""Purpose: Small entry point that forwards command-line execution to the CLI."""

from src.jobtailor.cli import main

# Running this file directly behaves the same as invoking the package CLI.
if __name__ == "__main__":
    main()
