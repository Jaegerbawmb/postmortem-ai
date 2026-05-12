import json
import os
from pathlib import Path
from langchain_google_genai import ChatGoogleGenerativeAI
from models.actions import ActionsOutput


PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "actions.txt"


async def run(incident_input: str) -> ActionsOutput:
    """
    Stage 4: Extract all action items — both explicit commitments and implicit ones.
    Implicit commitments (future tense, 'we should', 'we need to') are often missed
    by naive summarisation but are critical for preventing recurrence.
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

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    data = json.loads(raw)
    return ActionsOutput(**data)
