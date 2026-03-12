'use client'

import { useEffect, useRef, useState } from 'react'
import { sounds } from '@/lib/soundEngine'

const BOOT_LINES = [
  { text: 'PHOENIX BIOS v2.0 (C)1994', isSystem: false },
  { text: 'MEMORY TEST: 640K OK', isSystem: false },
  { text: '', isSystem: false },
  { text: 'LOADING CARDSHARK v1.0...', isSystem: false },
  { text: '__PROGRESS__', isSystem: false },
  { text: '', isSystem: false },
  { text: '> SYSTEM READY.', isSystem: true },
  { text: '> IT HAS BEEN 2847 DAYS SINCE YOUR LAST SESSION.', isSystem: true },
  { text: '> YOUR BALANCE: 500 CHIPS', isSystem: true },
  { text: '> THE DEALER IS READY.', isSystem: true },
]

const PROGRESS_STEPS = 20
const CHAR_DELAY = 40
const LINE_DELAY = 800

export default function BootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [currentTyping, setCurrentTyping] = useState('')
  const [progressCount, setProgressCount] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [done, setDone] = useState(false)
  const [cursor, setCursor] = useState(true)
  const completedRef = useRef(false)
  const lineIndexRef = useRef(0)
  const abortRef = useRef(false)

  const complete = () => {
    if (completedRef.current) return
    completedRef.current = true
    abortRef.current = true
    sessionStorage.setItem('cardshark_booted', '1')
    onComplete()
  }

  useEffect(() => {
    if (sessionStorage.getItem('cardshark_booted') === '1') {
      onComplete()
      return
    }

    const cursorInterval = setInterval(() => setCursor(c => !c), 500)

    const runLines = async () => {
      for (let i = 0; i < BOOT_LINES.length; i++) {
        if (abortRef.current) return
        const line = BOOT_LINES[i]

        if (line.text === '__PROGRESS__') {
          setShowProgress(true)
          for (let p = 1; p <= PROGRESS_STEPS; p++) {
            if (abortRef.current) return
            await delay(80)
            setProgressCount(p)
          }
          setShowProgress(false)
          setVisibleLines(prev => [...prev, { text: '[' + '▓'.repeat(PROGRESS_STEPS) + '] 100%', isSystem: false }])
          await delay(LINE_DELAY)
          continue
        }

        if (line.text === '') {
          setVisibleLines(prev => [...prev, { text: '', isSystem: false }])
          await delay(LINE_DELAY)
          continue
        }

        // Typewriter per character
        let typed = ''
        for (let c = 0; c < line.text.length; c++) {
          if (abortRef.current) return
          typed += line.text[c]
          setCurrentTyping(typed)
          await delay(CHAR_DELAY)
        }

        setVisibleLines(prev => [...prev, { text: typed, isSystem: line.isSystem }])
        setCurrentTyping('')
        await delay(LINE_DELAY)
      }

      // Final pause before completing
      await delay(500)
      if (!abortRef.current) sounds.boot_beep()
      await delay(500)
      if (!abortRef.current) complete()
    }

    runLines()
    return () => clearInterval(cursorInterval)
  }, [])

  // Skip on any keydown or click
  useEffect(() => {
    const skip = () => complete()
    window.addEventListener('keydown', skip)
    window.addEventListener('click', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('click', skip)
    }
  }, [])

  if (done) return null

  return (
    <div style={{ fontFamily: 'inherit', lineHeight: '1.6' }}>
      {visibleLines.map((line, i) => (
        <div key={i} style={{ color: line.isSystem ? '#80c080' : '#c8c8a0', minHeight: '1.6em' }}>
          {line.text}
        </div>
      ))}

      {showProgress && (
        <div style={{ color: '#c8c8a0' }}>
          {'['}{'▓'.repeat(progressCount)}{' '.repeat(PROGRESS_STEPS - progressCount)}{']'}{' '}{Math.round((progressCount / PROGRESS_STEPS) * 100)}%
        </div>
      )}

      {currentTyping !== '' && (
        <div style={{ color: currentTyping.startsWith('>') ? '#80c080' : '#c8c8a0' }}>
          {currentTyping}{cursor ? '|' : ' '}
        </div>
      )}

      {currentTyping === '' && visibleLines.length > 0 && !showProgress && (
        <span style={{ color: '#80c080' }}>{cursor ? '|' : ' '}</span>
      )}
    </div>
  )
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
