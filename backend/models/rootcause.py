from pydantic import BaseModel, Field


class RootCauseOutput(BaseModel):
    confirmed_root_cause: str = Field(description="The actual, confirmed cause of the incident")
    trigger: str = Field(description="Immediate trigger event, e.g. a deploy or config change")
    underlying_cause: str = Field(description="Deeper systemic or process issue, if any")
    contributing_factors: list[str] = Field(description="Things that made detection or resolution harder")
    ruled_out_hypotheses: list[str] = Field(description="Theories investigated but confirmed NOT the cause")
