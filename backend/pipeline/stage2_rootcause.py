import json
import os
from pathlib import Path
from langchain_google_genai import ChatGoogleGenerativeAI
from models.timeline import TimelineOutput
from models.rootcause import RootCauseOutput


PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "rootcause.txt"


async def run(incident_input: str, timeline: TimelineOutput) -> RootCauseOutput:
    """
    Stage 2: Identify confirmed root cause vs ruled-out hypotheses.
    This is the most critical distinction in a post-mortem — naive summarisation
    conflates dead-ends with the actual cause.
    """
    prompt_template = PROMPT_PATH.read_text()
    timeline_json = json.dumps([e.model_dump() for e in timeline.events], indent=2)
    prompt = prompt_template.format(
        incident_input=incident_input,
        timeline_json=timeline_json,
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
    return RootCauseOutput(**data)
