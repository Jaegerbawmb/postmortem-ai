import React from 'react'
import { usePipeline } from './hooks/usePipeline'
import PipelineSidebar from './components/PipelineSidebar'
import IncidentInput from './components/IncidentInput'
import PipelineProgress from './components/PipelineProgress'
import PostMortemReport from './components/PostMortemReport'

export default function App() {
  const pipeline = usePipeline()

  return (
    <>
      {/* Global keyframe animations injected via style tag */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
        textarea:focus { border-color: var(--accent) !important; }
        button:hover:not(:disabled) { opacity: 0.85; }
      `}</style>

      <div style={styles.app}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>⚡</div>
            <div>
              <div style={styles.logoText}>PostMortem AI</div>
              <div style={styles.logoSub}>Incident Report Drafter</div>
            </div>
          </div>
          <div style={styles.badges}>
            <span style={styles.badge}>Gemini 2.5 Flash</span>
            <span style={styles.badge}>5-Stage Pipeline</span>
            <span style={styles.badge}>SSE Streaming</span>
          </div>
        </header>

        {/* Body */}
        <div style={styles.main}>
          <PipelineSidebar
            stageStates={pipeline.stageStates}
            status={pipeline.status}
          />

          <main style={styles.content}>
            <IncidentInput
              onGenerate={pipeline.generate}
              disabled={pipeline.status === 'running'}
            />

            {pipeline.status === 'error' && (
              <div style={styles.errorBar}>
                ⚠ {pipeline.error}
              </div>
            )}

            {pipeline.status === 'running' && (
              <PipelineProgress
                stageStates={pipeline.stageStates}
                progress={pipeline.progress}
                progressLabel={pipeline.progressLabel}
              />
            )}

            {pipeline.status === 'done' && pipeline.result && (
              <PostMortemReport result={pipeline.result} />
            )}

            {pipeline.status === 'idle' && (
              <div style={styles.idleCard}>
                <div style={styles.idleIcon}>📄</div>
                <div style={styles.idleTitle}>Your post-mortem will appear here</div>
                <p style={styles.idleSub}>
                  Paste a chaotic Slack thread, PagerDuty log, or raw incident notes above.
                  The 5-stage pipeline extracts a clean timeline, confirms the root cause,
                  assesses impact, and pulls every action item — in under 60 seconds.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

const styles = {
  app: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  header: {
    borderBottom: '1px solid var(--border)',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--surface)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 30, height: 30,
    background: 'var(--accent)',
    borderRadius: 7,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15,
  },
  logoText: { fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px' },
  logoSub: { fontSize: 10, color: 'var(--muted2)', fontFamily: 'var(--mono)' },
  badges: { display: 'flex', gap: 6 },
  badge: {
    fontSize: 10, fontFamily: 'var(--mono)',
    padding: '3px 8px', borderRadius: 4,
    border: '1px solid var(--border2)', color: 'var(--muted2)',
  },
  main: { display: 'flex', flex: 1 },
  content: { flex: 1, padding: 24, maxWidth: 920, overflowY: 'auto' },
  errorBar: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 8,
    padding: '11px 16px',
    marginBottom: 16,
    fontSize: 13,
    color: 'var(--danger)',
  },
  idleCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '56px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  idleIcon: { fontSize: 36, marginBottom: 14, opacity: 0.35 },
  idleTitle: { fontSize: 15, fontWeight: 500, color: 'var(--muted2)', marginBottom: 10 },
  idleSub: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, maxWidth: 440 },
}
