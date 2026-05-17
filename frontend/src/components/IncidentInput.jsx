import React, { useState } from 'react'

const SAMPLE = `[09:47] pagerduty-bot: 🔴 CRITICAL - checkout-service error rate > 15% (threshold: 2%)
[09:47] pagerduty-bot: 🔴 CRITICAL - payment-api p99 latency 8200ms (threshold: 2000ms)
[09:48] @ravi.: on it, pulling up dashboards
[09:49] @sonali.k: I'm seeing DB connection pool exhaustion in the logs
[09:50] @pranav.lele: yeah I see it too. Could be the migration we ran at 9:30?
[09:51] @om.t: or the new connection pooler config we deployed yesterday?
[09:52] @sonali.k: checking the migration — it added 3 new indexes, shouldn't cause this
[09:53] @pranav.lele: payments are failing for users, seeing reports in #customer-reports
[09:54] @om.t: rolled back the connection pooler config
[09:55] @pranav.lele: error rate still climbing, 22% now
[09:56] @sonali.k: wait — RDS instance CPU at 98%. Something is hammering the DB
[09:57] @pranav.lele: found it. The background job that syncs order history to the data warehouse is doing a full table scan every 5 minutes instead of incremental
[09:58] @pranav.lele: PR #4821 merged yesterday at 2pm. Removed the WHERE clause accidentally
[09:59] @sonali.k: killing the sync job now
[10:00] @pranav.lele: error rate dropping... 18%... 9%... 3%...
[10:01] @sonali.k: we're back. Error rate 1.2%, latency normalizing
[10:02] pagerduty-bot: ✅ RESOLVED - checkout-service error rate 1.2%
[10:02] pagerduty-bot: ✅ RESOLVED - payment-api p99 latency 890ms
[10:04] @om.t: incident duration was ~17 minutes. Need a post-mortem
[10:05] @sonali.k: I'll fix the sync job today and add a guard against full table scans
[10:06] @pranav.lele: we should add a runbook for DB CPU spikes
[10:07] @mike.t: we need better PR review for anything touching background jobs — I'll set up a CODEOWNERS rule
[10:08] @sonali.k: also why did it take 10 minutes to find the root cause? We need better DB query monitoring
[10:09] @om.t: agreed. I'll look into adding pg_stat_statements to our dashboards this week`

export default function IncidentInput({ onGenerate, disabled }) {
  const [value, setValue] = useState('')

  const charCount = value.length

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>Paste your incident data</span>
        <button style={styles.sampleBtn} onClick={() => setValue(SAMPLE)}>
          load sample Slack thread →
        </button>
      </div>

      <textarea
        style={styles.textarea}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={`Paste a Slack thread, PagerDuty log, or raw incident notes...\n\n[10:03] pagerduty-bot: ALERT - API latency p99 > 5000ms\n[10:05] @sarah: looking into it\n[10:08] @mike: could be the new deploy?\n...`}
        disabled={disabled}
      />

      <div style={styles.footer}>
        <button
          style={{ ...styles.btn, ...(disabled ? styles.btnDisabled : {}) }}
          onClick={() => value.trim() && onGenerate(value)}
          disabled={disabled || !value.trim()}
        >
          {disabled ? (
            <>
              <span style={styles.spinner} /> Generating...
            </>
          ) : (
            <>⚡ Generate Post-Mortem</>
          )}
        </button>

        <button
          style={styles.ghostBtn}
          onClick={() => setValue('')}
          disabled={disabled}
        >
          Clear
        </button>

        <span style={styles.charCount}>{charCount.toLocaleString()} chars</span>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 18,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: { fontSize: 14, fontWeight: 500 },
  sampleBtn: {
    fontSize: 11,
    color: 'var(--accent2)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--mono)',
    textDecoration: 'underline',
    padding: 0,
  },
  textarea: {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 14,
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: 12,
    lineHeight: 1.65,
    resize: 'vertical',
    minHeight: 180,
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  btn: {
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '9px 20px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--font)',
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    transition: 'opacity 0.15s',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  ghostBtn: {
    background: 'transparent',
    color: 'var(--muted2)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '9px 14px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'var(--font)',
  },
  charCount: {
    fontSize: 11,
    color: 'var(--muted)',
    fontFamily: 'var(--mono)',
    marginLeft: 'auto',
  },
  spinner: {
    display: 'inline-block',
    width: 10,
    height: 10,
    border: '1.5px solid rgba(255,255,255,0.4)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
}
