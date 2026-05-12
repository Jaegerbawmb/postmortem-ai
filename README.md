# ⚡ PostMortem AI — Incident Report Drafter

> Paste a chaotic Slack thread or raw incident log. Get back a complete, structured post-mortem report in under 60 seconds.

![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=flat-square&logo=google)

---

## The Problem

Every software company experiences incidents. After every incident, engineers must write a **post-mortem** — a structured document capturing the timeline, root cause, impact, and action items.

Writing this is painful:
- The engineer is exhausted from firefighting
- The Slack thread is chaotic — jokes, dead ends, duplicate messages, overlapping conversations
- Post-mortems get written days later from fading memory
- Action items get missed; root cause analysis conflates dead-ends with the actual cause

**PostMortem AI solves this.** Paste the raw thread. Get a complete, structured post-mortem ready to send to stakeholders.

---

## Architecture: 5-Stage LLM Pipeline

The core insight is that **a single LLM call produces mediocre results**. Timeline reconstruction is a different cognitive task from root cause analysis, which is different from action item extraction. This pipeline decomposes the problem:

```
Raw Incident Thread
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 1: Timeline Reconstruction                               │
│  Chain-of-thought ordering, deduplication, event classification │
│  Output: TimelineOutput (Pydantic-validated)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 2: Root Cause Analysis                                   │
│  Distinguishes CONFIRMED causes from ruled-out hypotheses       │
│  Output: RootCauseOutput (Pydantic-validated)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 3: Impact Assessment                                     │
│  Severity (P1–P4), affected systems, error rates, latency       │
│  Output: ImpactOutput (Pydantic-validated)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 4: Action Item Extraction                                │
│  Catches implicit commitments ("I'll look into", "we need to") │
│  Output: ActionsOutput (Pydantic-validated)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 5: Document Assembly                                     │
│  Synthesizes all stage outputs into narrative prose             │
│  Output: AssemblyOutput (Pydantic-validated)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
         Complete Post-Mortem Report (6 sections)
```

### Why This Is Non-Trivial

**The ruled-out hypotheses problem:** During an incident, engineers investigate and discard many theories. A naive summarisation conflates these dead-ends with the actual root cause. Stage 2 is explicitly prompted to distinguish `confirmed_root_cause` from `ruled_out_hypotheses` — a critical distinction most tools miss entirely.

**The implicit action item problem:** Engineers rarely say "Action item: fix X." They say "I'll look into the DB config tomorrow" or "we should add monitoring for this." Stage 4 is tuned to detect future-tense commitments, not just explicit assignments.

**The noise problem:** Slack threads contain jokes, "+1" messages, duplicate alerts, and overlapping debugging conversations. Stage 1 deduplicates and reorders before any analysis begins.

**Pydantic-validated outputs at every stage:** Each stage enforces a typed schema before passing data downstream. This prevents hallucinated or malformed data from corrupting subsequent stages.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM | Gemini 2.5 Flash (via `google-generativeai`) |
| Backend | Python 3.11 + FastAPI |
| Schema Validation | Pydantic v2 |
| Streaming | Server-Sent Events (SSE) |
| Frontend | React 18 + Vite |
| Styling | CSS custom properties (no framework) |

---

## Project Structure

```
postmortem-ai/
├── backend/
│   ├── main.py                    # FastAPI app, SSE streaming endpoint
│   ├── pipeline/
│   │   ├── orchestrator.py        # Runs 5 stages in sequence, yields SSE events
│   │   ├── stage1_timeline.py     # Chronological reconstruction
│   │   ├── stage2_rootcause.py    # Root cause vs ruled-out hypotheses
│   │   ├── stage3_impact.py       # Impact assessment
│   │   ├── stage4_actions.py      # Explicit + implicit action items
│   │   └── stage5_assembly.py     # Final document generation
│   ├── models/
│   │   ├── timeline.py            # Pydantic schema: TimelineOutput
│   │   ├── rootcause.py           # Pydantic schema: RootCauseOutput
│   │   ├── impact.py              # Pydantic schema: ImpactOutput
│   │   ├── actions.py             # Pydantic schema: ActionsOutput
│   │   └── assembly.py            # Pydantic schema: AssemblyOutput
│   ├── prompts/
│   │   ├── timeline.txt           # Stage 1 prompt template
│   │   ├── rootcause.txt          # Stage 2 prompt template
│   │   ├── impact.txt             # Stage 3 prompt template
│   │   ├── actions.txt            # Stage 4 prompt template
│   │   └── assembly.txt           # Stage 5 prompt template
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx                # Root component
    │   ├── hooks/
    │   │   └── usePipeline.js     # SSE streaming hook, stage state management
    │   └── components/
    │       ├── PipelineSidebar.jsx    # Live stage progress sidebar
    │       ├── IncidentInput.jsx      # Input area with sample thread
    │       ├── PipelineProgress.jsx   # Progress bar + stage rows
    │       └── PostMortemReport.jsx   # Full 6-section report renderer
    ├── package.json
    └── vite.config.js
```

---

## Setup & Running

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Gemini API key](https://aistudio.google.com) (free tier available)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

uvicorn main:app --reload
# Running at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Running at http://localhost:5173
```

Open `http://localhost:5173`, paste an incident thread, and click **Generate Post-Mortem**.

---

## Output: 6-Section Post-Mortem

Every generated report includes:

1. **Incident Summary** — severity, timing, duration, executive summary
2. **Timeline** — clean chronological event list with actor and event type
3. **Root Cause Analysis** — confirmed cause, trigger, underlying issue, and ruled-out hypotheses
4. **Impact Assessment** — affected systems, peak error rates, latency, user and business impact
5. **Action Items** — with owner, priority (high/medium/low), type, and timeline
6. **Lessons Learned** — what went well, what went poorly, and key takeaways

Reports export to **Markdown** with one click.

---

## Sample Input → Output

**Input:** A messy 20-message Slack thread from a checkout service outage

**Output excerpt (Stage 2 — Root Cause):**
```json
{
  "confirmed_root_cause": "Background order-history sync job performing full table scan every 5 minutes due to accidentally removed WHERE clause in PR #4821",
  "trigger": "PR #4821 merged at 14:00 the previous day",
  "underlying_cause": "No PR review requirement or automated check for background job queries",
  "contributing_factors": [
    "No DB query monitoring to detect runaway queries before saturation",
    "Connection pool exhaustion masking the real signal"
  ],
  "ruled_out_hypotheses": [
    "Database migration run at 09:30 (adding 3 indexes — investigated, not the cause)",
    "Connection pooler config deployed the day before (rolled back, error rate continued climbing)"
  ]
}
```

---

## Roadmap

- [ ] Jira integration — auto-create tickets from extracted action items
- [ ] Confluence integration — publish post-mortem directly to team wiki
- [ ] Template library — Google, Amazon, and Atlassian post-mortem formats
- [ ] PagerDuty webhook — trigger pipeline automatically on incident resolution
