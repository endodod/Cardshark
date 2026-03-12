'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { spinWheel, getColour, evaluateBet, buildStrip } from '@/lib/rouletteLogic'
import Dealer from './Dealer'
import { sounds } from '@/lib/soundEngine'

const BET_TYPES = [
  { type: 'red',   label: 'RED',   group: 'colour' },
  { type: 'black', label: 'BLACK', group: 'colour' },
  { type: 'odd',   label: 'ODD',   group: 'parity' },
  { type: 'even',  label: 'EVEN',  group: 'parity' },
  { type: 'low',   label: '1-18',  group: 'range' },
  { type: 'high',  label: '19-36', group: 'range' },
]

export default function RouletteGame({ roundWinnings, onWin, onLoss }) {
  const [selectedBet, setSelectedBet] = useState(null)
  const [singleNumber, setSingleNumber] = useState('')
  const [phase, setPhase] = useState('betting') // betting | spinning | result
  const [result, setResult] = useState(null)
  const [strip, setStrip] = useState([])
  const [winningNumber, setWinningNumber] = useState(null)
  const [dealerMessages, setDealerMessages] = useState(['Place your bet.'])

  function handleSpin() {
    if (!selectedBet) return
    const n = spinWheel()
    const colour = getColour(n)
    const eval_ = evaluateBet(n, selectedBet)
    const stripNumbers = buildStrip(n)

    setWinningNumber(n)
    setStrip(stripNumbers)
    setPhase('spinning')
    sounds.roulette_spin()
    setDealerMessages(['No more bets. Ball is dropping...'])

    // At 80% of animation (2400ms) — intermediate narration
    setTimeout(() => {
      setDealerMessages(['No more bets. Ball is dropping...', '...and it lands on...'])
    }, 2400)

    setTimeout(() => {
      const colourLabel = colour.toUpperCase()
      const parityLabel = n === 0 ? 'ZERO' : n % 2 === 0 ? 'EVEN' : 'ODD'
      const betLabel = selectedBet.type === 'single'
        ? `SINGLE ${selectedBet.value}`
        : selectedBet.type.toUpperCase()

      sounds.roulette_land()
      setResult(eval_)
      setDealerMessages([
        'No more bets. Ball is dropping...',
        `${n}. ${colourLabel}. ${parityLabel}. YOU BET ${betLabel}.`,
      ])
      setPhase('result')

      setTimeout(() => {
        if (eval_.won) {
          const finalAmount = Math.floor(roundWinnings * eval_.payout)
          onWin(finalAmount)
        } else {
          onLoss()
        }
      }, 2000)
    }, 3000)
  }

  const activeBet = selectedBet
    ? selectedBet.type === 'single'
      ? `SINGLE ${selectedBet.value}`
      : selectedBet.type.toUpperCase()
    : null

  return (
    <div>
      <Dealer messages={dealerMessages} />

      {/* Bet selection */}
      {phase === 'betting' && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ color: '#666666', marginBottom: '8px' }}>SELECT BET:</div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {BET_TYPES.map(b => (
              <button
                key={b.type}
                onClick={() => setSelectedBet({ type: b.type })}
                style={betBtnStyle(selectedBet?.type === b.type, b.type)}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: '#666666' }}>SINGLE NUMBER: </span>
            <input
              type="number"
              min="0"
              max="36"
              value={singleNumber}
              onChange={e => {
                setSingleNumber(e.target.value)
                const n = parseInt(e.target.value)
                if (n >= 0 && n <= 36) setSelectedBet({ type: 'single', value: n })
              }}
              style={{
                background: 'transparent',
                border: '1px solid #666666',
                color: '#c8c8a0',
                fontFamily: 'inherit',
                fontSize: '1em',
                width: '60px',
                padding: '4px 8px',
              }}
              placeholder="0-36"
            />
          </div>

          {selectedBet && (
            <div style={{ color: '#80c080', marginBottom: '12px' }}>
              Bet: {activeBet} — Payout: {selectedBet.type === 'single' ? '35x' : '2x'}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSpin}
              disabled={!selectedBet}
              style={btnStyle(selectedBet ? '#f0c040' : '#333')}
            >
              SPIN
            </button>
            <button onClick={() => onWin(roundWinnings)} style={btnStyle('#666666')}>
              WALK AWAY
            </button>
          </div>
        </div>
      )}

      {/* Roulette strip animation */}
      {(phase === 'spinning' || phase === 'result') && strip.length > 0 && (
        <div style={{ overflow: 'hidden', margin: '16px 0', position: 'relative' }}>
          <motion.div
            initial={{ x: 800 }}
            animate={{ x: 0 }}
            transition={{ duration: 2.8, ease: [0.25, 0.1, 0.05, 1.0] }}
            style={{ display: 'flex', gap: '4px', whiteSpace: 'nowrap' }}
          >
            {strip.map((n, i) => {
              const colour = getColour(n)
              const isWinner = phase === 'result' && n === winningNumber && i === 20
              return (
                <div key={i} style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  border: `1px solid ${isWinner ? '#f0c040' : '#333'}`,
                  color: colour === 'red'
                    ? '#c03030'
                    : colour === 'green'
                      ? '#80c080'
                      : '#c8c8a0',
                  minWidth: '36px',
                  textAlign: 'center',
                  fontWeight: isWinner ? 'bold' : 'normal',
                  fontSize: isWinner ? '1.1em' : '1em',
                  background: isWinner ? 'rgba(240,192,64,0.08)' : 'transparent',
                  transition: 'background 0.3s, border-color 0.3s',
                }}>
                  {n}
                </div>
              )
            })}
          </motion.div>
          <div style={{ color: '#f0c040', textAlign: 'center', fontSize: '0.8em' }}>▲</div>
        </div>
      )}

      {/* Result */}
      {phase === 'result' && result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            color: result.won ? '#f0c040' : '#c03030',
            fontSize: '1.1em',
            marginTop: '12px',
          }}
        >
          {result.won
            ? `WIN — +${Math.floor(roundWinnings * result.payout)} CHIPS`
            : 'LOSS — WINNINGS LOST'}
        </motion.div>
      )}
    </div>
  )
}

function betBtnStyle(active, type) {
  const colour = type === 'red' ? '#c03030' : type === 'black' ? '#c8c8a0' : '#666666'
  return {
    background: active ? colour : 'transparent',
    border: `1px solid ${colour}`,
    color: active ? '#0a0a0a' : colour,
    padding: '4px 12px',
    fontFamily: 'inherit',
    fontSize: '0.9em',
    cursor: 'pointer',
  }
}

function btnStyle(color) {
  return {
    background: 'transparent',
    border: `1px solid ${color}`,
    color,
    padding: '6px 16px',
    fontFamily: 'inherit',
    fontSize: '1em',
    cursor: 'pointer',
  }
}
