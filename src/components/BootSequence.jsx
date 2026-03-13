'use client'

import { useEffect, useRef, useState } from 'react'
import { sounds } from '@/lib/soundEngine'

// type: 'header' | 'blank' | 'bill' | 'divider' | 'invoice' | 'warning' | 'system' | 'terminal' | 'progress'
const SEQUENCE = [
  { text: 'OVERDUE_INVOICES.TXT', type: 'header', charDelay: 35, pauseAfter: 500 },
  { text: '', type: 'blank', pauseAfter: 150 },
  { text: '  RENT ..................... $3,200', type: 'bill', charDelay: 18, pauseAfter: 220 },
  { text: '  ELECTRICITY ................ $180', type: 'bill', charDelay: 18, pauseAfter: 220 },
  { text: '  MEDICAL BILL ............... $850', type: 'bill', charDelay: 18, pauseAfter: 220 },
  { text: '  CAR PAYMENT ................ $640', type: 'bill', charDelay: 18, pauseAfter: 220 },
  { text: '  CREDIT CARD .............. $1,430', type: 'bill', charDelay: 18, pauseAfter: 220 },
  { text: '  STUDENT LOAN ............. $2,100', type: 'bill', charDelay: 18, pauseAfter: 220 },
  { text: '  MISC ....................... $600', type: 'bill', charDelay: 18, pauseAfter: 300 },
  { text: '', type: 'blank', pauseAfter: 100 },
  { text: '  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', type: 'divider', charDelay: 8, pauseAfter: 200 },
  { text: '  TOTAL DUE: $10,000', type: 'invoice', charDelay: 65, pauseAfter: 1400, soundAfter: 'invoice_alarm' },
  { text: '  DEADLINE: TONIGHT', type: 'warning', charDelay: 40, pauseAfter: 500 },
  { text: '  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', type: 'divider', charDelay: 8, pauseAfter: 1000 },
  { text: '', type: 'blank', pauseAfter: 400 },
  { text: '__CLEAR__', type: 'clear', pauseAfter: 300 },
  { text: 'CARDSHARK.EXE LOADING...', type: 'system', charDelay: 40, pauseAfter: 300 },
  { text: '__PROGRESS__', type: 'progress', pauseAfter: 400 },
  { text: '', type: 'blank', pauseAfter: 150 },
  { text: '> SYSTEM READY.', type: 'terminal', charDelay: 40, pauseAfter: 250 },
  { text: '> BALANCE: $500.', type: 'terminal', charDelay: 40, pauseAfter: 250 },
  { text: '> TARGET: $10,000.', type: 'terminal', charDelay: 40, pauseAfter: 250 },
  { text: '> DO NOT FAIL.', type: 'terminal', charDelay: 40, pauseAfter: 600 },
]

const PROGRESS_STEPS = 20
const MAX_VISIBLE = 14   // invoice section is 14 lines — keep them all visible

const COLOR = {
  header:   '#887755',
  bill:     '#c08878',
  divider:  '#3a3a3a',
  invoice:  '#e03030',
  warning:  '#b03030',
  system:   '#c8c8a0',
  terminal: '#80c080',
}

export default function BootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [currentTyping, setCurrentTyping] = useState({ text: '', type: 'system' })
  const [progressCount, setProgressCount] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [cursor, setCursor] = useState(true)
  const completedRef = useRef(false)
  const abortRef = useRef(false)
  const hasStarted = useRef(false)

  const pushLine = (line) => {
    setVisibleLines(prev => {
      const next = [...prev, line]
      return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next
    })
  }

  const complete = () => {
    if (completedRef.current) return
    completedRef.current = true
    abortRef.current = true
    sessionStorage.setItem('cardshark_booted', '1')
    onComplete()
  }

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    if (sessionStorage.getItem('cardshark_booted') === '1') {
      onComplete()
      return
    }

    const cursorInterval = setInterval(() => setCursor(c => !c), 500)

    const runSequence = async () => {
      for (let i = 0; i < SEQUENCE.length; i++) {
        if (abortRef.current) return
        const item = SEQUENCE[i]

        // Progress bar
        if (item.type === 'progress') {
          setShowProgress(true)
          for (let p = 1; p <= PROGRESS_STEPS; p++) {
            if (abortRef.current) return
            await delay(75)
            setProgressCount(p)
          }
          setShowProgress(false)
          sounds.boot_beep()
          pushLine({ text: '[' + '▓'.repeat(PROGRESS_STEPS) + '] 100%', type: 'system' })
          await delay(item.pauseAfter ?? 400)
          continue
        }

        // Clear terminal
        if (item.type === 'clear') {
          setVisibleLines([])
          await delay(item.pauseAfter ?? 300)
          continue
        }

        // Blank line
        if (item.type === 'blank') {
          pushLine({ text: '', type: 'blank' })
          await delay(item.pauseAfter ?? 150)
          continue
        }

        // Typewriter per character
        let typed = ''
        for (let c = 0; c < item.text.length; c++) {
          if (abortRef.current) return
          typed += item.text[c]
          setCurrentTyping({ text: typed, type: item.type })
          // Click sound: every 3 chars for bills (fast), every 2 for others
          const every = item.type === 'bill' ? 3 : 2
          if (c % every === 0) sounds.typewriter_click()
          await delay(item.charDelay ?? 40)
        }

        // Commit line
        pushLine({ text: typed, type: item.type })
        setCurrentTyping({ text: '', type: 'system' })

        // Post-line sound
        if (item.type === 'bill') sounds.bill_tick()
        if (item.soundAfter && sounds[item.soundAfter]) sounds[item.soundAfter]()

        await delay(item.pauseAfter ?? 300)
      }

      await delay(300)
      if (!abortRef.current) complete()
    }

    runSequence()
    return () => clearInterval(cursorInterval)
  }, [])

  // Skip after 1s grace period (audio unlock handled globally by MuteButton)
  useEffect(() => {
    let canSkip = false
    const skipTimer = setTimeout(() => { canSkip = true }, 1000)
    const skip = (e) => { if (e.target?.closest('[data-no-skip]')) return; if (canSkip) complete() }
    window.addEventListener('keydown', skip)
    window.addEventListener('click', skip)
    return () => {
      clearTimeout(skipTimer)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('click', skip)
    }
  }, [])

  return (
    <div style={{ fontFamily: 'inherit', lineHeight: '1.6' }}>
      {visibleLines.map((line, i) => (
        <div key={i} style={{ color: COLOR[line.type] ?? COLOR.system, minHeight: '1.6em' }}>
          {line.text}
        </div>
      ))}

      {showProgress && (
        <div style={{ color: COLOR.system }}>
          {'['}
          {'▓'.repeat(progressCount)}
          {' '.repeat(PROGRESS_STEPS - progressCount)}
          {'] '}
          {Math.round((progressCount / PROGRESS_STEPS) * 100)}%
        </div>
      )}

      {currentTyping.text !== '' && (
        <div style={{ color: COLOR[currentTyping.type] ?? COLOR.system }}>
          {currentTyping.text}{cursor ? '|' : ' '}
        </div>
      )}

      {currentTyping.text === '' && visibleLines.length > 0 && !showProgress && (
        <span style={{ color: COLOR.terminal }}>{cursor ? '|' : ' '}</span>
      )}
    </div>
  )
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
