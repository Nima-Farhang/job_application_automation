#!/usr/bin/env bash
# Purpose:
# Perform lightweight one-time setup after the Codespace is created. This script
# makes sure common environment variables exist, creates working directories,
# and marks helper scripts as executable.
set -euo pipefail

echo "Running job application automation init script..."

BASHRC_FILE="${HOME}/.bashrc"

append_if_missing() {
  local line="$1"
  # Add the export line only once so repeated Codespace rebuilds stay tidy.
  grep -Fqx "$line" "${BASHRC_FILE}" || echo "$line" >> "${BASHRC_FILE}"
}

# Ensure Python virtual environment binaries are easy to access in new shells.
append_if_missing 'export PATH="/opt/venv/bin:$PATH"'

# Create a small amount of local configuration/state storage for the project.
mkdir -p "${HOME}/.config/job-application-automation"
mkdir -p "${HOME}/.local/state/job-application-automation"

# Create the project runtime directories used by local output files.
mkdir -p "${PWD}/sample_output"

# Make shell helpers runnable from the start.
chmod +x scripts/*.sh 2>/dev/null || true

echo "Init complete."
echo
echo "Useful checks:"
echo "  python --version"
