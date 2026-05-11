"""Purpose: Provide small file-reading and filename-normalization helpers."""

from __future__ import annotations

import re
from pathlib import Path

import yaml


def read_text(path: Path) -> str:
    # Read text files consistently as UTF-8 across prompts, CVs, and outputs.
    return path.read_text(encoding="utf-8")


def read_yaml_as_pretty_text(path: Path) -> str:
    # Convert YAML profile data into stable readable text before injecting it into prompts.
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    return yaml.safe_dump(data, sort_keys=False, allow_unicode=True)


def slugify_filename(path: Path) -> str:
    # Turn a job file name into a safe folder name under outputs/.
    stem = path.stem.lower()
    stem = re.sub(r"[^a-z0-9]+", "_", stem).strip("_")
    return stem or "job"
