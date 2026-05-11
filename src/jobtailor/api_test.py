"""Purpose: Minimal smoke test for checking that the OpenAI client can respond."""

from openai import OpenAI

# This script relies on OPENAI_API_KEY being available in the environment.
client = OpenAI()

# Send a tiny request so you can verify authentication and model access quickly.
response = client.responses.create(
    model="gpt-5.4",
    input="Write a one-sentence bedtime story about a unicorn."
)

# Print only the model text, which keeps this useful as a quick terminal check.
print(response.output_text)
