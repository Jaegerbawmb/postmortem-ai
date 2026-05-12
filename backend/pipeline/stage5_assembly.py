import json
import os
from pathlib import Path
from langchain_google_genai import ChatGoogleGenerativeAI
from models.rootcause import RootCauseOutput
from models.impact import ImpactOutput
from models.actions import ActionsOutput
from models.assembly import AssemblyOutput


PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "assembly.txt"


async def run(
    rootcause: RootCauseOutput,
    impact: ImpactOutput,
    actions: ActionsOutput,
) -> AssemblyOutput:
    """
    Stage 5: Synthesize all structured pipeline outputs into the narrative sections
    of the final post-mortem document.
    """
    prompt_template = PROMPT_PATH.read_text()
    prompt = prompt_template.format(
        confirmed_root_cause=rootcause.confirmed_root_cause,
        trigger=rootcause.trigger,
        underlying_cause=rootcause.underlying_cause,
        severity=impact.severity,
        duration_minutes=impact.duration_minutes,
        user_impact=impact.user_impact,
        affected_systems=", ".join(impact.affected_systems),
        action_items_count=len(actions.action_items),
        contributing_factors=", ".join(rootcause.contributing_factors),
    )

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.2,
    )

    response = await llm.ainvoke(prompt)
    raw = response.content.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    data = json.loads(raw)
    return AssemblyOutput(**data)
