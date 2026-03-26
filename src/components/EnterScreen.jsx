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

      <div
        data-no-skip
        style={{
          border: '1px solid #c03030',
          padding: '18px 32px',
          maxWidth: '640px',
          textAlign: 'center',
          lineHeight: '1.7',
        }}
      >
        <div style={{ color: '#c03030', letterSpacing: '0.2em', fontSize: '1.1em', marginBottom: '10px' }}>
          !! EARLY ACCESS BUILD !!
        </div>
        <div style={{ color: '#888', fontSize: '0.75em', letterSpacing: '0.08em' }}>
          This is a very early stage of production. Bugs, broken flows, and unfinished game logic should be expected. Gameflow is not complete.
        </div>
      </div>

      <div style={{ color: '#80c080', letterSpacing: '0.12em' }}>
        &gt; PRESS ANY KEY TO BEGIN{cursor ? '_' : ' '}
      </div>
    </div>
  )
}
