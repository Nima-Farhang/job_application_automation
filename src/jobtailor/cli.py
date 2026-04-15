from __future__ import annotations

import argparse
from pathlib import Path

from src.jobtailor.config import load_settings
from src.jobtailor.orchestrator import JobApplicationOrchestrator
from src.jobtailor.providers.openai_provider import OpenAIProvider


def _resolve_project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Automate a staged CV and cover letter workflow.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    start_parser = subparsers.add_parser("start", help="Run Stage -1, Stage 0, and Stage 1.")
    start_parser.add_argument("--job", required=True, help="Path to the job description text file.")
    start_parser.add_argument("--current-cv", required=True, help="Path to the current CV text file.")

    finalize_parser = subparsers.add_parser("finalize", help="Run Stage 3 using reviewer output.")
    finalize_parser.add_argument("--job", required=True, help="Path to the job description text file.")
    finalize_parser.add_argument("--current-cv", required=True, help="Path to the current CV text file.")
    finalize_parser.add_argument("--reviewer-output", required=True, help="Path to the saved Stage 2 reviewer output.")

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    print(f"[jobtailor] Starting command: {args.command}")

    project_root = _resolve_project_root()
    print(f"[jobtailor] Project root: {project_root}")
    settings = load_settings(project_root)
    print(
        "[jobtailor] Loaded settings: "
        f"model={settings.openai_model}, base_url={settings.openai_base_url}"
    )
    provider = OpenAIProvider(
        api_key=settings.openai_api_key,
        model=settings.openai_model,
        base_url=settings.openai_base_url,
    )
    orchestrator = JobApplicationOrchestrator(project_root=project_root, provider=provider)

    print(f"[jobtailor] Job file: {Path(args.job).resolve()}")
    print(f"[jobtailor] Current CV file: {Path(args.current_cv).resolve()}")
    context = orchestrator.build_context(
        job_path=Path(args.job).resolve(),
        current_cv_path=Path(args.current_cv).resolve(),
    )
    print(f"[jobtailor] Output directory: {context.output_dir}")

    if args.command == "start":
        print("[jobtailor] Running start workflow: Stage -1, Stage 0, Stage 1, Stage 2 input")
        outputs = orchestrator.run_start(context)
    elif args.command == "finalize":
        reviewer_output_path = Path(args.reviewer_output).resolve()
        print(f"[jobtailor] Reviewer output file: {reviewer_output_path}")
        print("[jobtailor] Running finalize workflow: Stage 3 and DOCX export")
        outputs = orchestrator.run_finalize(context, reviewer_output_path)
    else:
        raise ValueError(f"Unsupported command: {args.command}")

    print("\nGenerated files:")
    for name, path in outputs.items():
        print(f"- {name}: {path}")


if __name__ == "__main__":
    main()
