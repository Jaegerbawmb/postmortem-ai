import { useState, useCallback } from 'react'

export const STAGES = [
  { id: 1, label: 'Timeline Reconstruction' },
  { id: 2, label: 'Root Cause Analysis' },
  { id: 3, label: 'Impact Assessment' },
  { id: 4, label: 'Action Item Extraction' },
  { id: 5, label: 'Document Assembly' },
]

const initialStageState = () =>
  Object.fromEntries(STAGES.map(s => [s.id, 'idle'])) // idle | running | done

export function usePipeline() {
  const [status, setStatus] = useState('idle') // idle | running | done | error
  const [stageStates, setStageStates] = useState(initialStageState())
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setStageStates(initialStageState())
    setCurrentStage(0)
    setProgress(0)
    setProgressLabel('')
    setResult(null)
    setError(null)
  }, [])

  const generate = useCallback(async (incidentInput) => {
    reset()
    setStatus('running')

    // Accumulated stage data as it arrives
    const acc = {}

    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_input: incidentInput }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Server error ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          let event
          try { event = JSON.parse(raw) } catch { continue }

          if (event.error) {
            throw new Error(event.error)
          }

          const { stage, label, progress: pct, data } = event

          setCurrentStage(stage)
          setProgress(pct)
          setProgressLabel(label)

          // Mark previous stages done, current running
          setStageStates(prev => {
            const next = { ...prev }
            for (let i = 1; i < stage; i++) next[i] = 'done'
            next[stage] = pct === 100 ? 'done' : 'running'
            return next
          })

          // Merge incoming data into accumulator
          if (data) Object.assign(acc, data)

          // Final event
          if (data?.complete) {
            setStageStates(prev =>
              Object.fromEntries(Object.keys(prev).map(k => [k, 'done']))
            )
            setResult(acc)
            setStatus('done')
          }
        }
      }
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [reset])

  return {
    status,
    stageStates,
    currentStage,
    progress,
    progressLabel,
    result,
    error,
    generate,
    reset,
  }
}
