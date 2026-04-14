from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


@dataclass
class Settings:
    project_root: Path
    openai_api_key: str
    openai_model: str
    openai_base_url: str


def load_settings(project_root: Path) -> Settings:
    load_dotenv(project_root / ".env")

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    model = os.getenv("OPENAI_MODEL", "gpt-5").strip()
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()

    if not api_key:
        raise ValueError("OPENAI_API_KEY is missing. Add it to your .env file.")

    return Settings(
        project_root=project_root,
        openai_api_key=api_key,
        openai_model=model,
        openai_base_url=base_url,
    )
