"""Purpose: Define the common interface that all text-generation providers must implement."""

from __future__ import annotations

from abc import ABC, abstractmethod


class BaseProvider(ABC):
    # The orchestrator only needs this method, so providers can be swapped later.
    @abstractmethod
    def generate(self, prompt: str) -> str:
        raise NotImplementedError
