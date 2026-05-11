"""Purpose: Load prompt templates and replace named placeholders with job data."""

from __future__ import annotations

from pathlib import Path


def render_template(template_text: str, variables: dict[str, str]) -> str:
    # Templates use simple placeholders like {{ job_description }}.
    rendered = template_text
    for key, value in variables.items():
        rendered = rendered.replace(f"{{{{ {key} }}}}", value)
    return rendered


def load_and_render(template_path: Path, variables: dict[str, str]) -> str:
    # Keep file loading and placeholder replacement together for common prompt use.
    template_text = template_path.read_text(encoding="utf-8")
    return render_template(template_text, variables)
