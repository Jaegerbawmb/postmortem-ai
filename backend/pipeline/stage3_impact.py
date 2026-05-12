import json
import os
from pathlib import Path
from langchain_google_genai import ChatGoogleGenerativeAI
from models.timeline import TimelineOutput
from models.impact import ImpactOutput


PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "impact.txt"


async def run(incident_input: str, timeline: TimelineOutput) -> ImpactOutput:
    """
    Stage 3: Assess incident impact — severity, affected systems, user impact,
    peak error rates and latencies. Only surfaces data actually present in the thread.
    """
    prompt_template = PROMPT_PATH.read_text()
    prompt = prompt_template.format(
        incident_input=incident_input,
        start_time=timeline.start_time,
        end_time=timeline.end_time,
        duration_minutes=timeline.duration_minutes,
    )

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
    return ImpactOutput(**data)
