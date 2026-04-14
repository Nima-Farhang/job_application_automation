from __future__ import annotations

from pathlib import Path


def render_template(template_text: str, variables: dict[str, str]) -> str:
    rendered = template_text
    for key, value in variables.items():
        rendered = rendered.replace(f"{{{{ {key} }}}}", value)
    return rendered


def load_and_render(template_path: Path, variables: dict[str, str]) -> str:
    template_text = template_path.read_text(encoding="utf-8")
    return render_template(template_text, variables)
