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
    env_path = project_root / ".env"
    env_loaded = load_dotenv(env_path, override=False)

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    model = os.getenv("OPENAI_MODEL", "gpt-5").strip()
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()

    if not api_key:
        if env_path.exists():
            raise ValueError(
                "OPENAI_API_KEY is missing. A .env file was found, but it does not define a usable OPENAI_API_KEY."
            )
        raise ValueError(
            "OPENAI_API_KEY is missing. Add it to your .env file or export it in your shell environment."
        )

    if env_loaded:
        print(f"[config] Loaded environment variables from: {env_path}")
    elif env_path.exists():
        print(f"[config] Found .env file but no new variables were loaded from: {env_path}")
    else:
        print("[config] No .env file found; using shell environment variables")

    return Settings(
        project_root=project_root,
        openai_api_key=api_key,
        openai_model=model,
        openai_base_url=base_url,
    )
