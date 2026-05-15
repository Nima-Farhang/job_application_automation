# ADR 0004 - Use Node 22 Devcontainer

## Status

Accepted.

## Context

The project is a TypeScript rewrite developed inside GitHub Codespaces. The previous devcontainer was configured for Python.

## Decision

Use the official TypeScript/Node devcontainer image based on Node 22.

## Consequences

- Codespaces starts with a current Node LTS-oriented TypeScript environment.
- Python virtual environment setup is removed from the development container.
- Project dependencies are managed through npm.

