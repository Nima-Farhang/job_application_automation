from __future__ import annotations

from pathlib import Path

from jobtailor.docx_writer import export_final_docs
from jobtailor.files import read_text, read_yaml_as_pretty_text, slugify_filename
from jobtailor.models import JobContext
from jobtailor.prompt_builder import load_and_render
from jobtailor.providers.base import BaseProvider


class JobApplicationOrchestrator:
    def __init__(self, project_root: Path, provider: BaseProvider) -> None:
        self.project_root = project_root
        self.provider = provider

    def build_context(self, job_path: Path, current_cv_path: Path) -> JobContext:
        slug = slugify_filename(job_path)
        output_dir = self.project_root / "outputs" / slug
        output_dir.mkdir(parents=True, exist_ok=True)

        return JobContext(
            job_path=job_path,
            current_cv_path=current_cv_path,
            job_description=read_text(job_path),
            current_cv=read_text(current_cv_path),
            base_profile=read_yaml_as_pretty_text(self.project_root / "data" / "base_profile.yaml"),
            cv_format_rules=read_text(self.project_root / "data" / "cv_format_rules.md"),
            slug=slug,
            output_dir=output_dir,
        )

    def run_start(self, context: JobContext) -> dict[str, Path]:
        prompts_dir = self.project_root / "prompts"

        stage_minus1_prompt = load_and_render(
            prompts_dir / "stage_minus1.md",
            {
                "job_description": context.job_description,
            },
        )
        stage_minus1_output = self.provider.generate(stage_minus1_prompt)
        stage_minus1_path = context.output_dir / "stage_minus1_analysis.md"
        stage_minus1_path.write_text(stage_minus1_output, encoding="utf-8")

        stage0_prompt = load_and_render(
            prompts_dir / "stage0.md",
            {
                "cv_format_rules": context.cv_format_rules,
            },
        )
        stage0_output = self.provider.generate(stage0_prompt)
        stage0_path = context.output_dir / "stage0_acknowledgement.md"
        stage0_path.write_text(stage0_output, encoding="utf-8")

        stage1_prompt_text = read_text(prompts_dir / "stage1.md")
        stage1_output = self.provider.generate(
            stage1_prompt_text.replace("{{ step1_prompt }}", read_text(self.project_root / "data" / "step1_prompt.md"))
            .replace("{{ current_cv }}", context.current_cv)
            .replace("{{ base_profile }}", context.base_profile)
            .replace("{{ job_description }}", context.job_description)
        )
        stage1_path = context.output_dir / "stage1_draft.md"
        stage1_path.write_text(stage1_output, encoding="utf-8")

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

        return {
            "stage_minus1": stage_minus1_path,
            "stage0": stage0_path,
            "stage1": stage1_path,
            "stage2_input": stage2_input_path,
        }

    def run_finalize(self, context: JobContext, reviewer_output_path: Path) -> dict[str, Path]:
        reviewer_output = read_text(reviewer_output_path)
        stage1_output = read_text(context.output_dir / "stage1_draft.md")

        stage3_prompt = load_and_render(
            self.project_root / "prompts" / "stage3_refine.md",
            {
                "job_description": context.job_description,
                "stage1_output": stage1_output,
                "reviewer_output": reviewer_output,
            },
        )
        stage3_output = self.provider.generate(stage3_prompt)
        stage3_path = context.output_dir / "stage3_final.md"
        stage3_path.write_text(stage3_output, encoding="utf-8")

        cv_path, cover_path = export_final_docs(stage3_output, context.output_dir)

        return {
            "stage3": stage3_path,
            "cv_docx": cv_path,
            "cover_letter_docx": cover_path,
        }
