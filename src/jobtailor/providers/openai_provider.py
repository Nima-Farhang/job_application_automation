from __future__ import annotations

from openai import OpenAI

from src.jobtailor.providers.base import BaseProvider


class OpenAIProvider(BaseProvider):
    def __init__(self, api_key: str, model: str, base_url: str) -> None:
        self.model = model
        self.client = OpenAI(api_key=api_key, base_url=base_url)

    def generate(self, prompt: str) -> str:
        response = self.client.responses.create(
            model=self.model,
            input=prompt,
        )

        text_parts: list[str] = []

        for item in response.output:
            if item.type != "message":
                continue
            for content in item.content:
                if hasattr(content, "text") and content.text:
                    text_parts.append(content.text)

        if not text_parts:
            raise ValueError("The model response did not contain any text output.")

        return "\n".join(text_parts).strip()
