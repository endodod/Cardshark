'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { spinMachine } from '@/lib/slotLogic'
import { MACHINE_COSTS, MACHINE_LABELS } from '@/constants/machinePools'
import { sounds } from '@/lib/soundEngine'

const SYMBOLS = ['7', 'BAR', '🔔', '🍒', '♦', '★']

const MACHINE_ART = {
  rusty: [
    '┌───────┐',
    '│?  │  ?│',
    '├───────┤',
    '│   ?   │',
    '├───────┤',
    '│ ░ ░ ░ │',
    '└──┬─┬──┘',
    '   │ │   ',
  ],
  classic: [
    '╔═══════╗',
    '║7  │  B║',
    '╠═══════╣',
    '║   ★   ║',
    '╠═══════╣',
    '║ ▓ ▓ ▓ ║',
    '╚══╦═╦══╝',
    '   ║ ║   ',
  ],
  highroller: [
    '◆━━━━━━━◆',
    '║◆  │  ◆║',
    '◆━━━━━━━◆',
    '║   ◆   ║',
    '◆━━━━━━━◆',
    '║ ◆ ◆ ◆ ║',
    '◆━━┳━┳━━◆',
    '   ┃ ┃   ',
  ],
}

const SHORT_LABELS = {
  rusty: 'RUSTY',
  classic: 'CLASSIC',
  highroller: 'HIGH ROLLER',
}

function ReelBox({ symbol, spinning, stopped, isWinner, big }) {
  const size = big
    ? { width: '100px', height: '120px', fontSize: '2.4em' }
    : { width: '48px', height: '56px', fontSize: '1.1em' }
  return (
    <motion.div
      animate={stopped ? { scale: [1, 1.06, 0.97, 1] } : {}}
      transition={stopped ? { duration: 0.18, times: [0, 0.4, 0.7, 1] } : {}}
      style={{
        border: `1px solid ${isWinner ? '#f0c040' : '#666666'}`,
        ...size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isWinner ? '#f0c040' : '#c8c8a0',
        overflow: 'hidden',
        transition: 'border-color 0.2s, color 0.2s',
      }}
    >
      {spinning ? (
        <motion.span
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 0.12, ease: 'linear' }}
        >
          {symbol}
        </motion.span>
      ) : symbol}
    </motion.div>
  )
}

export default function SlotMachine({ balance, onSpin, onSkip }) {
  const [view, setView] = useState('select') // 'select' | 'machine'
  const [activeMachine, setActiveMachine] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [reelSymbols, setReelSymbols] = useState(['7', 'BAR', '★'])
  const [revealedModifier, setRevealedModifier] = useState(null)
  const [spinningReels, setSpinningReels] = useState([false, false, false])
  const [stoppedReels, setStoppedReels] = useState([false, false, false])
  const [showModifier, setShowModifier] = useState(false)
  const tickRef = useRef(null)
  const lockedRef = useRef([null, null, null])

  function openMachine(machineId) {
    if (balance < MACHINE_COSTS[machineId]) return
    setActiveMachine(machineId)
    setRevealedModifier(null)
    setShowModifier(false)
    setSpinning(false)
    setReelSymbols(['7', 'BAR', '★'])
    setSpinningReels([false, false, false])
    setStoppedReels([false, false, false])
    setView('machine')
  }

  function handlePull() {
    if (spinning) return
    const cost = MACHINE_COSTS[activeMachine]
    if (balance < cost) return

    setSpinning(true)
    setRevealedModifier(null)
    setShowModifier(false)
    setStoppedReels([false, false, false])
    lockedRef.current = [null, null, null]

    const modifier = spinMachine(activeMachine)
    sounds.slot_spin()

    setSpinningReels([true, true, true])
    tickRef.current = setInterval(() => {
      // Only randomize reels that haven't locked yet
      setReelSymbols(prev => prev.map((sym, i) =>
        lockedRef.current[i] !== null
          ? lockedRef.current[i]
          : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ))
    }, 80)

    const stopTimes = [800, 1150, 1500]
    stopTimes.forEach((delay, index) => {
      setTimeout(() => {
        sounds.slot_stop()
        // Lock this reel to a final symbol
        const finalSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        lockedRef.current[index] = finalSym
        setReelSymbols(prev => { const n = [...prev]; n[index] = finalSym; return n })
        setSpinningReels(prev => { const n = [...prev]; n[index] = false; return n })
        setStoppedReels(prev => { const n = [...prev]; n[index] = true; return n })
        setTimeout(() => {
          setStoppedReels(prev => { const n = [...prev]; n[index] = false; return n })
        }, 250)
      }, delay)
    })

    setTimeout(() => {
      clearInterval(tickRef.current)
      setSpinningReels([false, false, false])
      setRevealedModifier(modifier)
      setTimeout(() => setShowModifier(true), 200)
      setTimeout(() => {
        setSpinning(false)
        onSpin(cost, modifier)
      }, 1500)
    }, 2200)
  }

  useEffect(() => () => clearInterval(tickRef.current), [])

  // ── Machine view ──────────────────────────────────────────────────────────
  if (view === 'machine') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' }}>
        <div style={{ color: '#f0c040', letterSpacing: '0.12em' }}>
          {MACHINE_LABELS[activeMachine].toUpperCase()}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {reelSymbols.map((sym, i) => (
            <ReelBox
              key={i}
              symbol={sym}
              spinning={spinningReels[i]}
              stopped={stoppedReels[i]}
              isWinner={revealedModifier != null && !spinningReels[i]}
              big
            />
          ))}
        </div>

        {revealedModifier && showModifier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ color: revealedModifier.type === 'curse' ? '#c03030' : '#f0c040' }}>
              [{revealedModifier.label}]
            </div>
            <div style={{ color: '#c8c8a0', fontSize: '0.85em' }}>
              {revealedModifier.description}
            </div>
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          {!spinning && !revealedModifier && (
            <button onClick={handlePull} style={btnStyle('#f0c040')}>
              ▶ PULL — {MACHINE_COSTS[activeMachine]} DOLLARS
            </button>
          )}
          {!spinning && (
            <button onClick={() => setView('select')} style={btnStyle('#666666')}>
              ← BACK
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Select view ───────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ color: '#80c080', marginBottom: '12px' }}>
        &gt; Choose a machine to spin, or skip to bet.
      </div>

      <div style={{ display: 'flex', gap: '32px', marginBottom: '20px', justifyContent: 'center' }}>
        {['rusty', 'classic', 'highroller'].map(machineId => {
          const cost = MACHINE_COSTS[machineId]
          const disabled = balance < cost
          return (
            <div
              key={machineId}
              onClick={() => !disabled && openMachine(machineId)}
              style={{
                border: `1px solid ${disabled ? '#333' : '#666666'}`,
                padding: '120px 24px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.35 : 1,
                textAlign: 'center',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = '#f0c040' }}
              onMouseLeave={e => { if (!disabled) e.currentTarget.style.borderColor = '#666666' }}
            >
              <pre style={{
                color: disabled ? '#333' : '#c8c8a0',
                margin: '0 0 8px',
                fontSize: '0.55em',
                lineHeight: '1.35',
                fontFamily: 'inherit',
                userSelect: 'none',
              }}>
                {MACHINE_ART[machineId].join('\n')}
              </pre>
              <div style={{ color: disabled ? '#444' : '#f0c040', fontSize: '0.85em', marginBottom: '2px', letterSpacing: '0.08em' }}>
                {SHORT_LABELS[machineId]}
              </div>
              <div style={{ color: disabled ? '#333' : '#80c080', fontSize: '0.75em' }}>
                {cost} DOLLARS
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onSkip}
          style={{
            background: 'transparent',
            border: '1px solid #444',
            color: '#666666',
            padding: '5px 16px',
            fontFamily: 'inherit',
            fontSize: '0.9em',
            cursor: 'pointer',
          }}
        >
          SKIP — PLAY WITHOUT MODIFIER
        </button>
      </div>
    </div>
  )
}

function btnStyle(color) {
  return {
    background: 'transparent',
    border: `1px solid ${color}`,
    color,
    padding: '6px 20px',
    fontFamily: 'inherit',
    fontSize: '1em',
    cursor: 'pointer',
  }
}
