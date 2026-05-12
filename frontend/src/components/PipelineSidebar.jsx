import React from 'react'
import { STAGES } from '../hooks/usePipeline'

const icons = { 1: '🕐', 2: '🔍', 3: '📊', 4: '✅', 5: '📋' }

export default function PipelineSidebar({ stageStates, status }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.label}>Pipeline Stages</div>

      {STAGES.map(stage => {
        const state = stageStates[stage.id] || 'idle'
        return (
          <div key={stage.id} style={{ ...styles.item, ...stateStyle(state) }}>
            <span style={styles.num}>0{stage.id}</span>
            <span style={{ ...styles.dot, ...dotStyle(state) }} />
            <span style={styles.name}>{stage.label}</span>
            {state === 'done' && <span style={styles.check}>✓</span>}
          </div>
        )
      })}

      <div style={styles.divider} />

      <p style={styles.tip}>
        Each stage runs a focused prompt with a Pydantic-validated JSON schema.
        Outputs feed sequentially into the next stage.
      </p>

      <div style={styles.divider} />

      <div style={styles.modelBadge}>
        <span style={styles.modelDot} />
        gemini-2.5-flash
      </div>
    </aside>
  )
}

function stateStyle(state) {
  if (state === 'running') return { color: 'var(--warning)', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }
  if (state === 'done') return { color: 'var(--success)' }
  return {}
}

function dotStyle(state) {
  const base = {}
  if (state === 'running') return { ...base, background: 'var(--warning)', animation: 'pulse 1s infinite' }
  if (state === 'done') return { ...base, background: 'var(--success)' }
  return { ...base, background: 'var(--muted)' }
}

const styles = {
  sidebar: {
    width: 230,
    borderRight: '1px solid var(--border)',
    padding: '22px 14px',
    flexShrink: 0,
    background: 'var(--surface)',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  label: {
    fontSize: 10,
    fontFamily: 'var(--mono)',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 14,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '8px 10px',
    borderRadius: 6,
    marginBottom: 3,
    fontSize: 12,
    color: 'var(--muted2)',
    border: '1px solid transparent',
    transition: 'all 0.2s',
  },
  num: {
    fontFamily: 'var(--mono)',
    fontSize: 10,
    color: 'var(--muted)',
    width: 16,
    flexShrink: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
  },
  name: { flex: 1 },
  check: { fontSize: 11, color: 'var(--success)' },
  divider: { height: 1, background: 'var(--border)', margin: '16px 0' },
  tip: {
    fontSize: 11,
    color: 'var(--muted)',
    lineHeight: 1.6,
    padding: '0 2px',
  },
  modelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 11,
    fontFamily: 'var(--mono)',
    color: 'var(--muted2)',
  },
  modelDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--success)',
    flexShrink: 0,
  },
}
