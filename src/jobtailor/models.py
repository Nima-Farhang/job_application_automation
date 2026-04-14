from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class JobContext:
    job_path: Path
    current_cv_path: Path
    job_description: str
    current_cv: str
    base_profile: str
    cv_format_rules: str
    slug: str
    output_dir: Path
