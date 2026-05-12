import React from 'react'
import { STAGES } from '../hooks/usePipeline'

export default function PipelineProgress({ stageStates, progress, progressLabel }) {
  return (
    <div style={styles.card}>
      <div style={styles.title}>// pipeline running</div>

      <div style={styles.barWrap}>
        <div style={{ ...styles.bar, width: `${progress}%` }} />
      </div>
      <div style={styles.label}>{progressLabel}</div>

      <div style={styles.stageList}>
        {STAGES.map(stage => {
          const state = stageStates[stage.id] || 'idle'
          return (
            <div key={stage.id} style={styles.row}>
              <span style={styles.statusIcon}>
                {state === 'done' && <span style={{ color: 'var(--success)' }}>✓</span>}
                {state === 'running' && <span style={styles.spinner} />}
                {state === 'idle' && <span style={{ color: 'var(--muted)' }}>○</span>}
              </span>
              <span style={{
                ...styles.stageName,
                color: state === 'running' ? 'var(--warning)'
                  : state === 'done' ? 'var(--success)'
                  : 'var(--muted)',
              }}>
                Stage {stage.id} — {stage.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: 22,
    marginBottom: 18,
  },
  title: {
    fontSize: 12,
    fontFamily: 'var(--mono)',
    color: 'var(--muted2)',
    marginBottom: 14,
  },
  barWrap: {
    background: 'var(--border)',
    borderRadius: 2,
    height: 3,
    marginBottom: 6,
  },
  bar: {
    height: 3,
    borderRadius: 2,
    background: 'var(--accent)',
    transition: 'width 0.5s ease',
  },
  label: {
    fontSize: 11,
    color: 'var(--muted2)',
    fontFamily: 'var(--mono)',
    marginBottom: 16,
    minHeight: 16,
  },
  stageList: { display: 'flex', flexDirection: 'column', gap: 9 },
  row: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 },
  statusIcon: { width: 18, textAlign: 'center', flexShrink: 0 },
  stageName: { transition: 'color 0.2s' },
  spinner: {
    display: 'inline-block',
    width: 10,
    height: 10,
    border: '1.5px solid var(--warning)',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
}
