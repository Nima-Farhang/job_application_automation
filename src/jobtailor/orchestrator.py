from __future__ import annotations

from pathlib import Path

from src.jobtailor.docx_writer import export_final_docs
from src.jobtailor.files import read_text, read_yaml_as_pretty_text, slugify_filename
from src.jobtailor.models import JobContext
from src.jobtailor.prompt_builder import load_and_render
from src.jobtailor.providers.base import BaseProvider


class JobApplicationOrchestrator:
    def __init__(self, project_root: Path, provider: BaseProvider) -> None:
        self.project_root = project_root
        self.provider = provider

    def build_context(self, job_path: Path, current_cv_path: Path) -> JobContext:
        slug = slugify_filename(job_path)
        output_dir = self.project_root / "outputs" / slug
        output_dir.mkdir(parents=True, exist_ok=True)
        print(f"[orchestrator] Building context for job slug: {slug}")
        print(f"[orchestrator] Ensured output directory exists: {output_dir}")

        context = JobContext(
            job_path=job_path,
            current_cv_path=current_cv_path,
            job_description=read_text(job_path),
            current_cv=read_text(current_cv_path),
            base_profile=read_yaml_as_pretty_text(self.project_root / "data" / "base_profile.yaml"),
            cv_format_rules=read_text(self.project_root / "data" / "cv_format_rules.md"),
            slug=slug,
            output_dir=output_dir,
        )
        print(
            "[orchestrator] Context loaded: "
            f"job_chars={len(context.job_description)}, "
            f"current_cv_chars={len(context.current_cv)}, "
            f"base_profile_chars={len(context.base_profile)}, "
            f"cv_rules_chars={len(context.cv_format_rules)}"
        )
        return context

    def run_start(self, context: JobContext) -> dict[str, Path]:
        prompts_dir = self.project_root / "prompts"
        print(f"[orchestrator] Starting run_start for slug '{context.slug}'")

        print("[orchestrator] Rendering Stage -1 prompt")
        stage_minus1_prompt = load_and_render(
            prompts_dir / "stage_minus1.md",
            {
                "job_description": context.job_description,
            },
        )
        print(f"[orchestrator] Stage -1 prompt length: {len(stage_minus1_prompt)} chars")
        print("[orchestrator] Requesting Stage -1 analysis from provider")
        stage_minus1_output = self.provider.generate(stage_minus1_prompt)
        stage_minus1_path = context.output_dir / "stage_minus1_analysis.md"
        stage_minus1_path.write_text(stage_minus1_output, encoding="utf-8")
        print(
            "[orchestrator] Stage -1 complete: "
            f"{stage_minus1_path} ({len(stage_minus1_output)} chars)"
        )

        print("[orchestrator] Rendering Stage 0 prompt")
        stage0_prompt = load_and_render(
            prompts_dir / "stage0.md",
            {
                "cv_format_rules": context.cv_format_rules,
            },
        )
        print(f"[orchestrator] Stage 0 prompt length: {len(stage0_prompt)} chars")
        print("[orchestrator] Requesting Stage 0 acknowledgement from provider")
        stage0_output = self.provider.generate(stage0_prompt)
        stage0_path = context.output_dir / "stage0_acknowledgement.md"
        stage0_path.write_text(stage0_output, encoding="utf-8")
        print(
            "[orchestrator] Stage 0 complete: "
            f"{stage0_path} ({len(stage0_output)} chars)"
        )

        print("[orchestrator] Preparing Stage 1 prompt")
        stage1_prompt_text = read_text(prompts_dir / "stage1.md")
        stage1_prompt = (
            stage1_prompt_text.replace(
                "{{ step1_prompt }}", read_text(self.project_root / "data" / "step1_prompt.md")
            )
            .replace("{{ current_cv }}", context.current_cv)
            .replace("{{ base_profile }}", context.base_profile)
            .replace("{{ job_description }}", context.job_description)
        )
        print(f"[orchestrator] Stage 1 prompt length: {len(stage1_prompt)} chars")
        print("[orchestrator] Requesting Stage 1 draft from provider")
        stage1_output = self.provider.generate(stage1_prompt)
        stage1_path = context.output_dir / "stage1_draft.md"
        stage1_path.write_text(stage1_output, encoding="utf-8")
        print(
            "[orchestrator] Stage 1 complete: "
            f"{stage1_path} ({len(stage1_output)} chars)"
        )

        print("[orchestrator] Rendering Stage 2 reviewer input")
        stage2_input = load_and_render(
            prompts_dir / "stage2_reviewer.md",
            {
                "job_description": context.job_description,
                "stage_minus1_output": stage_minus1_output,
                "stage1_output": stage1_output,
            },
        )
        stage2_input_path = context.output_dir / "stage2_reviewer_input.md"
        stage2_input_path.write_text(stage2_input, encoding="utf-8")
        print(
            "[orchestrator] Stage 2 reviewer input ready: "
            f"{stage2_input_path} ({len(stage2_input)} chars)"
        )

        return {
            "stage_minus1": stage_minus1_path,
            "stage0": stage0_path,
            "stage1": stage1_path,
            "stage2_input": stage2_input_path,
        }

    def run_finalize(self, context: JobContext, reviewer_output_path: Path) -> dict[str, Path]:
        print(f"[orchestrator] Starting run_finalize for slug '{context.slug}'")
        print(f"[orchestrator] Loading reviewer output from: {reviewer_output_path}")
        reviewer_output = read_text(reviewer_output_path)
        print(f"[orchestrator] Reviewer output length: {len(reviewer_output)} chars")
        stage1_path = context.output_dir / "stage1_draft.md"
        print(f"[orchestrator] Loading Stage 1 draft from: {stage1_path}")
        stage1_output = read_text(stage1_path)
        print(f"[orchestrator] Stage 1 draft length: {len(stage1_output)} chars")

        print("[orchestrator] Rendering Stage 3 prompt")
        stage3_prompt = load_and_render(
            self.project_root / "prompts" / "stage3_refine.md",
            {
                "job_description": context.job_description,
                "stage1_output": stage1_output,
                "reviewer_output": reviewer_output,
            },
        )
        print(f"[orchestrator] Stage 3 prompt length: {len(stage3_prompt)} chars")
        print("[orchestrator] Requesting Stage 3 refinement from provider")
        stage3_output = self.provider.generate(stage3_prompt)
        stage3_path = context.output_dir / "stage3_final.md"
        stage3_path.write_text(stage3_output, encoding="utf-8")
        print(
            "[orchestrator] Stage 3 complete: "
            f"{stage3_path} ({len(stage3_output)} chars)"
        )

        print("[orchestrator] Exporting final DOCX files")
        cv_path, cover_path = export_final_docs(stage3_output, context.output_dir)
        print(f"[orchestrator] Final CV DOCX: {cv_path}")
        print(f"[orchestrator] Final cover letter DOCX: {cover_path}")

        return {
            "stage3": stage3_path,
            "cv_docx": cv_path,
            "cover_letter_docx": cover_path,
        }
