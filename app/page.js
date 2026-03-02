'use client'

import { useState, useEffect } from 'react'

function formatLogTime(isoString) {
  try {
    const d = new Date(isoString)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return isoString
  }
}

export default function Home() {
  const [state, setState] = useState(null)
  const [log, setLog] = useState([])

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/float')
        const data = await res.json()
        setState(data.state)
        setLog(Array.isArray(data.log) ? data.log : [])
      } catch {
        setState(null)
        setLog([])
      }
    }

    fetchState()
    const interval = setInterval(fetchState, 2000)
    return () => clearInterval(interval)
  }, [])

  const display =
    state === null
      ? 'Loading...'
      : state === true
        ? 'TRUE'
        : 'FALSE'

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'white',
      }}
    >
      <section
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: '3rem', fontWeight: 600 }}>{display}</p>
      </section>
      <aside
        style={{
          width: '320px',
          borderLeft: '1px solid #eee',
          padding: '1rem',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600 }}>
          Last 20 values
        </h2>
        {log.length === 0 ? (
          <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
            No entries yet.
          </p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {log.map((entry, i) => (
              <li
                key={i}
                style={{
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '0.875rem',
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: entry.value ? '#0a0' : '#c00',
                  }}
                >
                  {entry.value ? 'TRUE' : 'FALSE'}
                </span>
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                  {formatLogTime(entry.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </main>
  )
}
