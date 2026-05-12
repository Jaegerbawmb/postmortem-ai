from pydantic import BaseModel, Field
from typing import Literal


class TimelineEvent(BaseModel):
    time: str = Field(description="HH:MM timestamp or inferred order label")
    actor: str = Field(description="Person or system name")
    event: str = Field(description="What happened, one clear sentence")
    type: Literal["detection", "investigation", "action", "resolution", "communication"]


class TimelineOutput(BaseModel):
    incident_name: str = Field(description="Short descriptive name, max 8 words")
    start_time: str = Field(description="When the incident started")
    end_time: str = Field(description="When the incident resolved")
    duration_minutes: int = Field(description="Total incident duration in minutes")
    events: list[TimelineEvent]
