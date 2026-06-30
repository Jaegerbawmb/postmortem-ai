import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from pipeline.orchestrator import run_pipeline

load_dotenv()

if not os.getenv("GEMINI_API_KEY"):
    raise RuntimeError("GEMINI_API_KEY not set. Copy .env.example to .env and add your key.")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="PostMortem AI",
    description="Multi-stage LLM pipeline that transforms chaotic incident threads into structured post-mortem reports.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://postmortem-ai-0tam.onrender.com/", "http://localhost:5173", "https://postmortem-ai-1.onrender.com/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ─────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    incident_input: str


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "model": "gemini-2.5-flash"}


@app.post("/generate")
async def generate(req: GenerateRequest):
    """
    Main endpoint. Runs the 5-stage pipeline and streams progress + results
    back to the client via Server-Sent Events.

    Each SSE event carries:
      { stage, label, progress, data? }

    The final event includes data.complete = true and all stage outputs.
    """
    if not req.incident_input or len(req.incident_input.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Incident input is too short. Please paste a more complete thread.",
        )

    if len(req.incident_input) > 50_000:
        raise HTTPException(
            status_code=400,
            detail="Input too long. Please trim your incident thread to under 50,000 characters.",
        )

    async def event_stream():
        try:
            async for chunk in run_pipeline(req.incident_input):
                yield chunk
        except Exception as e:
            import json
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
