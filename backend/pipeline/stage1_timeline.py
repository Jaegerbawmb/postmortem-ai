import json
import os
from pathlib import Path
from langchain_google_genai import ChatGoogleGenerativeAI
from models.timeline import TimelineOutput


PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "timeline.txt"


async def run(incident_input: str) -> TimelineOutput:
    """
    Stage 1: Reconstruct a clean, chronological timeline from raw incident data.
    Deduplicates messages, infers ordering from context, and classifies each event.
    """
    prompt_template = PROMPT_PATH.read_text()
    prompt = prompt_template.format(incident_input=incident_input)

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.1,
    )

    response = await llm.ainvoke(prompt)
    raw = response.content.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    data = json.loads(raw)
    return TimelineOutput(**data)
