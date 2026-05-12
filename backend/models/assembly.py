from pydantic import BaseModel, Field


class AssemblyOutput(BaseModel):
    executive_summary: str = Field(description="2-3 sentence summary for non-technical stakeholders")
    lessons_learned: list[str] = Field(description="Specific, actionable lessons — not generic advice")
    what_went_well: list[str] = Field(description="Things that worked well during incident response")
    what_went_poorly: list[str] = Field(description="Things that slowed detection or resolution")
