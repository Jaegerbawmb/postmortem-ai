from pydantic import BaseModel, Field
from typing import Literal


class ActionItem(BaseModel):
    description: str = Field(description="Specific, actionable task description")
    owner: str = Field(description="Person who committed or was assigned, or 'team'")
    priority: Literal["high", "medium", "low"]
    type: Literal["fix", "monitoring", "process", "documentation", "infrastructure"]
    timeline: Literal["today", "this week", "next sprint", "tbd"]


class ActionsOutput(BaseModel):
    action_items: list[ActionItem]
