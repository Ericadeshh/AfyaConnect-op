import os
from fastapi import HTTPException
from openai import OpenAI  # xAI API is compatible with OpenAI SDK

client = OpenAI(
    api_key=os.getenv("XAI_API_KEY"),  # or hardcode for testing: "xai-your-key-here"
    base_url="https://api.x.ai/v1",
)

def summarize_with_grok(text: str, max_len: int = 180, min_len: int = 40) -> str:
    if not text.strip():
        return "- No content provided."

    try:
        response = client.chat.completions.create(
            model="grok-beta",  # or "grok-2-latest" if available
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional medical report summarizer for hospital referrals. "
                        "Summarize the input clinical note as concise bullet points for the receiving physician. "
                        "Preserve: patient name/age, chief complaint, vitals, diagnosis, medications/dosages, "
                        "pending tests, plans, red flags, negations. Be factual and concise. Use - bullet format."
                    )
                },
                {"role": "user", "content": text}
            ],
            max_tokens=max_len // 4,  # rough token estimate
            temperature=0.0,
        )
        summary = response.choices[0].message.content.strip()
        # Optional: convert to clean bullets if Grok doesn't already
        lines = [f"- {line.strip()}" for line in summary.split("\n") if line.strip()]
        return "\n".join(lines) if lines else summary
    except Exception as e:
        raise HTTPException(500, f"Grok summarization failed: {str(e)}")