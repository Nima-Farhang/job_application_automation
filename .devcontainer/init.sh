#!/usr/bin/env bash
# Purpose:
# Perform lightweight one-time setup after the Codespace is created. This script
# prepares the local Node/TypeScript workflow, creates runtime directories, and
# marks helper scripts as executable when present.
set -euo pipefail

echo "Running job application automation init script..."

BASHRC_FILE="${HOME}/.bashrc"

append_if_missing() {
  local line="$1"
  # Add the export line only once so repeated Codespace rebuilds stay tidy.
  grep -Fqx "$line" "${BASHRC_FILE}" || echo "$line" >> "${BASHRC_FILE}"
}

# Keep locally installed npm binaries easy to access in new shells.
append_if_missing 'export PATH="./node_modules/.bin:$PATH"'

# Create a small amount of local configuration/state storage for the project.
mkdir -p "${HOME}/.config/job-application-automation"
mkdir -p "${HOME}/.local/state/job-application-automation"

# Create the project runtime directories used by local output files.
mkdir -p "${PWD}/jobs"
mkdir -p "${PWD}/outputs"
mkdir -p "${PWD}/prompts"

# Make shell helpers runnable from the start.
chmod +x scripts/*.sh 2>/dev/null || true

if [ -f "${PWD}/package.json" ]; then
  if [ -f "${PWD}/package-lock.json" ]; then
    npm ci
  else
    npm install
  fi
else
  echo "package.json not found yet; skipping npm install."
fi

echo "Init complete."
echo
echo "Useful checks:"
echo "  node --version"
echo "  npm --version"
echo "  npm run typecheck"
echo "  npm test"
