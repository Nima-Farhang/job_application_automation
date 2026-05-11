"""Purpose: Define shared data structures used across the workflow."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class JobContext:
    # Holds all loaded inputs and derived paths for one job run.
    job_path: Path
    current_cv_path: Path
    job_description: str
    current_cv: str
    base_profile: str
    cv_format_rules: str
    slug: str
    output_dir: Path
