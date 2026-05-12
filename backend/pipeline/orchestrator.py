import asyncio
from typing import AsyncIterator
import json

from pipeline import (
    stage1_timeline,
    stage2_rootcause,
    stage3_impact,
    stage4_actions,
    stage5_assembly,
)
from models.timeline import TimelineOutput
from models.rootcause import RootCauseOutput
from models.impact import ImpactOutput
from models.actions import ActionsOutput
from models.assembly import AssemblyOutput


def _progress(stage: int, label: str, pct: int, data: dict = None) -> str:
    payload = {"stage": stage, "label": label, "progress": pct}
    if data:
        payload["data"] = data
    return f"data: {json.dumps(payload)}\n\n"


async def run_pipeline(incident_input: str) -> AsyncIterator[str]:
    """
    Runs the 5-stage post-mortem pipeline sequentially, streaming progress
    events to the frontend via Server-Sent Events.

    Stage outputs are Pydantic-validated at each step before being passed
    downstream, ensuring type safety throughout the pipeline.
    """

    # ── Stage 1: Timeline ─────────────────────────────────────────────────────
    yield _progress(1, "Reconstructing chronological timeline...", 5)
    timeline: TimelineOutput = await stage1_timeline.run(incident_input)
    yield _progress(1, "Timeline reconstructed", 22, {"timeline": timeline.model_dump()})

    # ── Stage 2: Root Cause ───────────────────────────────────────────────────
    yield _progress(2, "Analyzing root cause and ruling out hypotheses...", 25)
    rootcause: RootCauseOutput = await stage2_rootcause.run(incident_input, timeline)
    yield _progress(2, "Root cause identified", 44, {"rootcause": rootcause.model_dump()})

    # ── Stage 3: Impact ───────────────────────────────────────────────────────
    yield _progress(3, "Assessing user and business impact...", 47)
    impact: ImpactOutput = await stage3_impact.run(incident_input, timeline)
    yield _progress(3, "Impact assessed", 64, {"impact": impact.model_dump()})

    # ── Stage 4: Action Items ─────────────────────────────────────────────────
    yield _progress(4, "Extracting explicit and implicit action items...", 67)
    actions: ActionsOutput = await stage4_actions.run(incident_input)
    yield _progress(4, "Action items extracted", 84, {"actions": actions.model_dump()})

    # ── Stage 5: Assembly ─────────────────────────────────────────────────────
    yield _progress(5, "Assembling final post-mortem document...", 87)
    assembly: AssemblyOutput = await stage5_assembly.run(rootcause, impact, actions)

    yield _progress(5, "Done", 100, {
        "assembly": assembly.model_dump(),
        "complete": True,
    })
