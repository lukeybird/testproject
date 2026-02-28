'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [state, setState] = useState(null)

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/float')
        const data = await res.json()
        setState(data.state)
      } catch {
        setState(null)
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
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
      }}
    >
      <p style={{ margin: 0, fontSize: '3rem', fontWeight: 600 }}>{display}</p>
    </main>
  )
}
