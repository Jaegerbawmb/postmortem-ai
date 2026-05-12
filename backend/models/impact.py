from pydantic import BaseModel, Field
from typing import Literal


class ImpactOutput(BaseModel):
    severity: Literal["P1", "P2", "P3", "P4"]
    severity_reasoning: str = Field(description="One sentence justifying the severity level")
    affected_systems: list[str]
    user_impact: str = Field(description="How end users were affected")
    error_rate_peak: str = Field(description="Peak error rate if mentioned, else 'unknown'")
    latency_peak: str = Field(description="Peak latency if mentioned, else 'unknown'")
    duration_minutes: int
    estimated_affected_users: str = Field(description="Number or percentage if mentioned, else 'unknown'")
    business_impact: str = Field(description="Revenue, reputation, or operational impact if mentioned")
