'use client'

import { useEffect, useState } from 'react'

export default function EnterScreen({ onEnter }) {
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setCursor(c => !c), 530)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handle = (e) => {
      if (e.target?.closest('[data-no-skip]')) return
      onEnter()
    }
    window.addEventListener('keydown', handle)
    window.addEventListener('click', handle)
    return () => {
      window.removeEventListener('keydown', handle)
      window.removeEventListener('click', handle)
    }
  }, [onEnter])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '32px',
        userSelect: 'none',
      }}
    >
      <div style={{ color: '#887755', letterSpacing: '0.18em', fontSize: '1.1em' }}>
        CARDSHARK.EXE
      </div>

      <div style={{ color: '#3a3a3a', letterSpacing: '0.12em', fontSize: '0.7em' }}>
        ────────────────────────
      </div>

      <div style={{ color: '#80c080', letterSpacing: '0.12em' }}>
        &gt; PRESS ANY KEY TO BEGIN{cursor ? '_' : ' '}
      </div>
    </div>
  )
}
