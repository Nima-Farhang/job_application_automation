from __future__ import annotations

from openai import AuthenticationError, OpenAI

from src.jobtailor.providers.base import BaseProvider


class OpenAIProvider(BaseProvider):
    def __init__(self, api_key: str, model: str, base_url: str) -> None:
        self.model = model
        self.client = OpenAI(api_key=api_key, base_url=base_url)

    def generate(self, prompt: str) -> str:
        print(
            "[openai] Sending request: "
            f"model={self.model}, prompt_chars={len(prompt)}"
        )
        try:
            response = self.client.responses.create(
                model=self.model,
                input=prompt,
            )
        except AuthenticationError as exc:
            raise ValueError(
                "OpenAI authentication failed. Check that OPENAI_API_KEY is current and that the active shell or .env file is using the right key."
            ) from exc

        text_parts: list[str] = []

        for item in response.output:
            if item.type != "message":
                continue
            for content in item.content:
                if hasattr(content, "text") and content.text:
                    text_parts.append(content.text)

        if not text_parts:
            raise ValueError("The model response did not contain any text output.")

        output = "\n".join(text_parts).strip()
        print(f"[openai] Received response: output_chars={len(output)}")
        return output
