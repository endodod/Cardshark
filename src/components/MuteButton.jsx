'use client'

import { useState, useEffect } from 'react'
import { isMuted, toggleMute } from '@/lib/soundEngine'

export default function MuteButton() {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    setMuted(isMuted())
  }, [])

  function handle() {
    setMuted(toggleMute())
  }

  return (
    <button
      onClick={handle}
      data-no-skip="true"
      title={muted ? 'Unmute' : 'Mute'}
      style={{
        background: 'transparent',
        border: `1px solid ${muted ? '#c03030' : '#80c080'}`,
        color: muted ? '#c03030' : '#80c080',
        fontFamily: 'inherit',
        fontSize: 'clamp(18px, 1.8vw, 26px)',
        padding: '6px 20px',
        cursor: 'pointer',
        letterSpacing: '0.08em',
      }}
    >
      {muted ? '[MUTED]' : '[SFX ON]'}
    </button>
  )
}
