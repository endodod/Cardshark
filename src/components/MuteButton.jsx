'use client'

import { useState, useEffect } from 'react'
import { initSound, isMuted, toggleMute } from '@/lib/soundEngine'

export default function MuteButton() {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    initSound()
    setMuted(isMuted())
  }, [])

  function handle() {
    setMuted(toggleMute())
  }

  return (
    <button
      onClick={handle}
      title={muted ? 'Unmute' : 'Mute'}
      style={{
        background: 'transparent',
        border: '1px solid #444',
        color: muted ? '#c03030' : '#666666',
        fontFamily: 'inherit',
        fontSize: 'clamp(14px, 1.4vw, 20px)',
        padding: '4px 14px',
        cursor: 'pointer',
        letterSpacing: '0.05em',
      }}
    >
      {muted ? '[MUTED]' : '[SFX ON]'}
    </button>
  )
}
