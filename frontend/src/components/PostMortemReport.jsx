import React, { useState } from 'react'

const SEV_COLORS = {
  P1: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
  P2: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  P3: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  P4: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
}

const TL_DOT_COLOR = { detection: '#ef4444', investigation: '#3b82f6', action: '#f59e0b', resolution: '#10b981', communication: '#94a3b8' }
const PRIORITY_STYLE = {
  high: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '#ef4444' },
  medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '#f59e0b' },
  low: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: '#10b981' },
}

function SectionHeader({ icon, code, title }) {
  return (
    <div style={s.sectionHeader}>
      <span>{icon}</span>
      <span style={s.sectionCode}>{code}</span>
      <span style={s.sectionTitle}>{title}</span>
    </div>
  )
}

function MetaGrid({ items }) {
  return (
    <div style={s.metaGrid}>
      {items.filter(Boolean).map(([label, value, color], i) => (
        <div key={i} style={s.metaItem}>
          <div style={s.metaLabel}>{label}</div>
          <div style={{ ...s.metaValue, color: color || 'var(--text)' }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

export default function PostMortemReport({ result }) {
  const [copied, setCopied] = useState(false)
  const { timeline, rootcause, impact, actions, assembly } = result

  const sev = impact?.severity || 'P2'
  const sevStyle = SEV_COLORS[sev] || SEV_COLORS.P2

  function copyMarkdown() {
    const md = buildMarkdown(result)
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  return (
    <div style={s.card}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.headerIcon}>📋</span>
          <span style={s.headerTitle}>{timeline?.incident_name || 'Post-Mortem Report'}</span>
          <span style={{ ...s.sevBadge, background: sevStyle.bg, color: sevStyle.color, border: `1px solid ${sevStyle.border}` }}>
            ● {sev}
          </span>
        </div>
        <div style={s.headerActions}>
          <button style={s.copyBtn} onClick={copyMarkdown}>
            {copied ? '✓ Copied!' : 'Copy Markdown'}
          </button>
        </div>
      </div>

      <div style={s.body}>

        {/* 01 Summary */}
        <div style={s.section}>
          <SectionHeader icon="📌" code="// 01" title="Incident Summary" />
          <MetaGrid items={[
            ['Start Time', timeline?.start_time || '—', null],
            ['End Time', timeline?.end_time || '—', null],
            ['Duration', `${impact?.duration_minutes || timeline?.duration_minutes || '?'} min`, 'var(--warning)'],
            ['Severity', sev, sevStyle.color],
            impact?.error_rate_peak && impact.error_rate_peak !== 'unknown'
              ? ['Peak Error Rate', impact.error_rate_peak, 'var(--danger)'] : null,
            impact?.latency_peak && impact.latency_peak !== 'unknown'
              ? ['Peak Latency', impact.latency_peak, 'var(--warning)'] : null,
          ]} />
          <p style={s.prose}>{assembly?.executive_summary}</p>
        </div>

        <div style={s.divider} />

        {/* 02 Timeline */}
        <div style={s.section}>
          <SectionHeader icon="🕐" code="// 02" title="Timeline" />
          <ul style={s.timeline}>
            {(timeline?.events || []).map((ev, i, arr) => (
              <li key={i} style={s.tlItem}>
                <div style={s.tlLeft}>
                  <div style={{ ...s.tlDot, background: TL_DOT_COLOR[ev.type] || '#3b82f6' }} />
                  {i < arr.length - 1 && <div style={s.tlLine} />}
                </div>
                <div style={s.tlTime}>{ev.time}</div>
                <div style={s.tlContent}>
                  <strong style={{ color: 'var(--text)', fontWeight: 500 }}>{ev.actor}</strong>
                  {' — '}{ev.event}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={s.divider} />

        {/* 03 Root Cause */}
        <div style={s.section}>
          <SectionHeader icon="🔍" code="// 03" title="Root Cause Analysis" />
          <div style={s.rcaBox}>
            <div style={s.rcaLabel}>Confirmed Root Cause</div>
            <p style={s.prose}>{rootcause?.confirmed_root_cause}</p>
          </div>

          {rootcause?.trigger && (
            <div style={{ marginTop: 12 }}>
              <div style={s.subLabel}>Immediate Trigger</div>
              <p style={s.prose}>{rootcause.trigger}</p>
            </div>
          )}

          {rootcause?.underlying_cause && (
            <div style={{ marginTop: 12 }}>
              <div style={s.subLabel}>Underlying Systemic Issue</div>
              <p style={s.prose}>{rootcause.underlying_cause}</p>
            </div>
          )}

          {(rootcause?.ruled_out_hypotheses || []).length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={s.subLabel}>Ruled Out Hypotheses</div>
              {rootcause.ruled_out_hypotheses.map((h, i) => (
                <div key={i} style={s.ruledOut}>
                  <span style={{ color: 'var(--danger)', flexShrink: 0 }}>✗</span>
                  <span style={{ textDecoration: 'line-through', opacity: 0.55 }}>{h}</span>
                </div>
              ))}
            </div>
          )}

          {(rootcause?.contributing_factors || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={s.subLabel}>Contributing Factors</div>
              {rootcause.contributing_factors.map((f, i) => (
                <div key={i} style={s.factor}>
                  <span style={{ color: 'var(--warning)', flexShrink: 0 }}>!</span>
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={s.divider} />

        {/* 04 Impact */}
        <div style={s.section}>
          <SectionHeader icon="📊" code="// 04" title="Impact Assessment" />
          {(impact?.affected_systems || []).length > 0 && (
            <div style={{ ...s.metaItem, gridColumn: '1/-1', marginBottom: 10 }}>
              <div style={s.metaLabel}>Affected Systems</div>
              <div style={{ fontSize: 12, color: 'var(--text)' }}>{impact.affected_systems.join(' · ')}</div>
            </div>
          )}
          <p style={s.prose}>{impact?.user_impact}</p>
          {impact?.business_impact && (
            <p style={{ ...s.prose, marginTop: 8 }}>{impact.business_impact}</p>
          )}
          {impact?.severity_reasoning && (
            <p style={{ ...s.prose, marginTop: 8, fontStyle: 'italic' }}>
              Severity rationale: {impact.severity_reasoning}
            </p>
          )}
        </div>

        <div style={s.divider} />

        {/* 05 Action Items */}
        <div style={s.section}>
          <SectionHeader icon="✅" code="// 05" title={`Action Items (${(actions?.action_items || []).length})`} />
          {(actions?.action_items || []).map((item, i) => {
            const p = (item.priority || 'medium').toLowerCase()
            const ps = PRIORITY_STYLE[p] || PRIORITY_STYLE.medium
            return (
              <div key={i} style={{ ...s.actionItem, borderLeftColor: ps.border }}>
                <span style={s.checkbox}>☐</span>
                <div style={s.actionBody}>
                  <div style={s.actionText}>{item.description}</div>
                  <div style={s.actionMeta}>
                    <span style={s.actionOwner}>@{item.owner}</span>
                    <span style={{ ...s.priorityBadge, background: ps.bg, color: ps.color }}>{p}</span>
                    <span style={s.actionType}>{item.type}</span>
                    <span style={s.actionTimeline}>{item.timeline}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={s.divider} />

        {/* 06 Lessons */}
        <div style={s.section}>
          <SectionHeader icon="💡" code="// 06" title="Lessons Learned" />
          <div style={s.lessonsGrid}>
            <div>
              <div style={{ ...s.subLabel, color: 'var(--success)' }}>What went well</div>
              {(assembly?.what_went_well || []).map((w, i) => (
                <div key={i} style={s.lessonItem}>
                  <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>{w}
                </div>
              ))}
            </div>
            <div>
              <div style={{ ...s.subLabel, color: 'var(--danger)' }}>What went poorly</div>
              {(assembly?.what_went_poorly || []).map((w, i) => (
                <div key={i} style={s.lessonItem}>
                  <span style={{ color: 'var(--danger)', flexShrink: 0 }}>✗</span>{w}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={s.subLabel}>Key Takeaways</div>
            {(assembly?.lessons_learned || []).map((l, i) => (
              <div key={i} style={s.lessonItem}>
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span>{l}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// Markdown export
function buildMarkdown({ timeline, rootcause, impact, actions, assembly }) {
  let md = `# Post-Mortem: ${timeline?.incident_name || 'Incident'}\n\n`
  md += `**Severity:** ${impact?.severity} | **Duration:** ${impact?.duration_minutes} min | **Period:** ${timeline?.start_time} – ${timeline?.end_time}\n\n`
  md += `---\n\n## 1. Incident Summary\n\n${assembly?.executive_summary || ''}\n\n`
  md += `---\n\n## 2. Timeline\n\n`
  ;(timeline?.events || []).forEach(e => { md += `- **${e.time}** \`${e.actor}\` — ${e.event}\n` })
  md += `\n---\n\n## 3. Root Cause Analysis\n\n**Confirmed Root Cause:** ${rootcause?.confirmed_root_cause}\n\n`
  if (rootcause?.trigger) md += `**Trigger:** ${rootcause.trigger}\n\n`
  if (rootcause?.underlying_cause) md += `**Underlying Issue:** ${rootcause.underlying_cause}\n\n`
  if ((rootcause?.ruled_out_hypotheses || []).length)
    md += `**Ruled Out:**\n${rootcause.ruled_out_hypotheses.map(h => `- ~~${h}~~`).join('\n')}\n\n`
  md += `---\n\n## 4. Impact Assessment\n\n`
  md += `- **Severity:** ${impact?.severity}\n- **Duration:** ${impact?.duration_minutes} minutes\n`
  if (impact?.error_rate_peak) md += `- **Peak Error Rate:** ${impact.error_rate_peak}\n`
  if (impact?.latency_peak) md += `- **Peak Latency:** ${impact.latency_peak}\n`
  md += `- **User Impact:** ${impact?.user_impact}\n`
  if (impact?.affected_systems?.length) md += `- **Affected Systems:** ${impact.affected_systems.join(', ')}\n`
  md += `\n---\n\n## 5. Action Items\n\n`
  ;(actions?.action_items || []).forEach(a => {
    md += `- [ ] **[${(a.priority || '').toUpperCase()}]** ${a.description} — @${a.owner} _(${a.timeline})_\n`
  })
  md += `\n---\n\n## 6. Lessons Learned\n\n`
  md += `### What Went Well\n${(assembly?.what_went_well || []).map(w => `- ${w}`).join('\n')}\n\n`
  md += `### What Went Poorly\n${(assembly?.what_went_poorly || []).map(w => `- ${w}`).join('\n')}\n\n`
  md += `### Key Takeaways\n${(assembly?.lessons_learned || []).map(l => `- ${l}`).join('\n')}\n`
  return md
}

const s = {
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' },
  header: { padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 },
  headerIcon: { fontSize: 15, flexShrink: 0 },
  headerTitle: { fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sevBadge: { fontSize: 10, fontFamily: 'var(--mono)', padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 },
  headerActions: { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 },
  copyBtn: { background: 'transparent', color: 'var(--muted2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--mono)', transition: 'all 0.15s' },
  body: { padding: 22 },
  section: { marginBottom: 4 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 9, borderBottom: '1px solid var(--border)' },
  sectionCode: { fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)' },
  sectionTitle: { fontSize: 13, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--accent2)' },
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, marginBottom: 12 },
  metaItem: { background: 'var(--surface2)', borderRadius: 6, padding: '10px 12px' },
  metaLabel: { fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' },
  metaValue: { fontSize: 13, fontWeight: 500 },
  prose: { fontSize: 13, lineHeight: 1.7, color: 'var(--muted2)' },
  divider: { height: 1, background: 'var(--border)', margin: '20px 0' },
  subLabel: { fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 7 },
  timeline: { listStyle: 'none' },
  tlItem: { display: 'flex', gap: 10, marginBottom: 10 },
  tlLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 },
  tlDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  tlLine: { width: 1, flex: 1, background: 'var(--border2)', marginTop: 4, minHeight: 10 },
  tlTime: { fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', minWidth: 46, paddingTop: 2, flexShrink: 0 },
  tlContent: { fontSize: 13, lineHeight: 1.5, color: 'var(--muted2)' },
  rcaBox: { background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '14px 16px', marginBottom: 4 },
  rcaLabel: { fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 },
  ruledOut: { display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--muted2)' },
  factor: { display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--muted2)' },
  actionItem: { background: 'var(--surface2)', borderRadius: 6, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 10, borderLeft: '3px solid var(--accent)' },
  checkbox: { color: 'var(--muted)', marginTop: 1, flexShrink: 0, fontSize: 15 },
  actionBody: { flex: 1, minWidth: 0 },
  actionText: { fontSize: 13, color: 'var(--text)', marginBottom: 5, lineHeight: 1.4 },
  actionMeta: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  actionOwner: { fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--accent2)' },
  priorityBadge: { fontSize: 10, padding: '2px 7px', borderRadius: 3, fontFamily: 'var(--mono)' },
  actionType: { fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)' },
  actionTimeline: { fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' },
  lessonsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 },
  lessonItem: { display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--muted2)' },
}
