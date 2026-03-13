'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CardDisplay from './CardDisplay'
import Dealer from './Dealer'
import { evaluateBestHand } from '@/lib/pokerLogic'
import { createDeck, dealCard } from '@/lib/blackjackLogic'

const DEALER_LINES = {
  blind: "Pure cards, pure guts. You in?",
  flop: "Three cards on the table. Your move.",
  full: "Everything's on the table. No surprises.",
}

const PAYOUTS = { blind: 3, flop: 2, full: 1.5 }

export default function PokerDuel({ variant, roundWinnings, hasPeekAdvantage, onWin, onLoss }) {
  const [playerHole, setPlayerHole] = useState([])
  const [dealerHole, setDealerHole] = useState([])
  const [community, setCommunity] = useState([])
  const [phase, setPhase] = useState('decision') // decision | showdown | result
  const [outcome, setOutcome] = useState(null)
  const [dealerMessages, setDealerMessages] = useState([DEALER_LINES[variant]])
  const [peeking, setPeeking] = useState(false)
  const [revealedDealer, setRevealedDealer] = useState(false)
  const [revealCount, setRevealCount] = useState(variant === 'blind' ? 0 : variant === 'flop' ? 3 : 5)

  useEffect(() => {
    let d = createDeck()
    const ph = [], dh = [], com = []
    for (let i = 0; i < 2; i++) { const { card, remainingDeck } = dealCard(d); ph.push(card); d = remainingDeck }
    for (let i = 0; i < 2; i++) { const { card, remainingDeck } = dealCard(d); dh.push(card); d = remainingDeck }
    for (let i = 0; i < 5; i++) { const { card, remainingDeck } = dealCard(d); com.push(card); d = remainingDeck }
    setPlayerHole(ph)
    setDealerHole(dh)
    setCommunity(com)
  }, [])

  function handlePeek() {
    setPeeking(true)
    setTimeout(() => setPeeking(false), 2000)
  }

  function goAllIn() {
    setPhase('showdown')
    const startCount = revealCount
    let count = startCount
    if (count < 5) {
      const interval = setInterval(() => {
        count++
        setRevealCount(count)
        if (count >= 5) clearInterval(interval)
      }, 300)
    }

    setTimeout(() => {
      setRevealedDealer(true)
      const playerBest = evaluateBestHand([...playerHole, ...community])
      const dealerBest = evaluateBestHand([...dealerHole, ...community])
      const pv = playerBest.value
      const dv = dealerBest.value
      const msg = `You: ${playerBest.rank.replace(/_/g, ' ')}. Dealer: ${dealerBest.rank.replace(/_/g, ' ')}.`
      setDealerMessages([DEALER_LINES[variant], msg])

      if (pv > dv) {
        setOutcome('win')
        const finalAmount = Math.floor(roundWinnings * PAYOUTS[variant])
        setTimeout(() => onWin(finalAmount), 1800)
      } else if (dv > pv) {
        setOutcome('loss')
        setTimeout(() => onLoss(), 1800)
      } else {
        setOutcome('tie')
        setTimeout(() => onWin(roundWinnings), 1800)
      }
    }, 5 * 300 + 400)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Dealer messages={dealerMessages} />

      <div style={{ color: '#666666', fontSize: '0.85em' }}>
        Payout if win: <span style={{ color: '#f0c040' }}>{PAYOUTS[variant]}x</span>
        {' — '}Winnings at stake: <span style={{ color: '#f0c040' }}>{roundWinnings} dollars</span>
      </div>

      {/* Community cards */}
      <div>
        <div style={{ color: '#666666', marginBottom: '4px', fontSize: '0.8em' }}>COMMUNITY</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {community.map((card, i) => (
            <CardDisplay key={i} card={card} faceDown={i >= revealCount} animate={i < revealCount} compact />
          ))}
        </div>
      </div>

      {/* Player + Dealer hands on same row */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#666666', marginBottom: '4px', fontSize: '0.8em' }}>YOUR HAND</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {playerHole.map((card, i) => (
              <CardDisplay key={i} card={card} faceDown={false} compact />
            ))}
          </div>
        </div>

        <div>
          <div style={{ color: '#666666', marginBottom: '4px', fontSize: '0.8em' }}>DEALER HAND</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {dealerHole.map((card, i) => (
              <CardDisplay
                key={i}
                card={card}
                faceDown={!revealedDealer && !(peeking && i === 0)}
                compact
              />
            ))}
          </div>
        </div>
      </div>

      {/* Outcome */}
      {outcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            color: outcome === 'win' ? '#f0c040' : outcome === 'tie' ? '#c8c8a0' : '#c03030',
            fontSize: '1.1em',
          }}
        >
          {outcome === 'win' && `YOU WIN — +${Math.floor(roundWinnings * PAYOUTS[variant])} DOLLARS`}
          {outcome === 'loss' && 'DEALER WINS — WINNINGS LOST'}
          {outcome === 'tie' && 'TIE — WINNINGS PRESERVED'}
        </motion.div>
      )}

      {/* Buttons */}
      {phase === 'decision' && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {hasPeekAdvantage && !peeking && (
            <button onClick={handlePeek} style={btnStyle('#80c080')}>[PEEK]</button>
          )}
          <button onClick={goAllIn} style={btnStyle('#f0c040')}>GO ALL IN</button>
          <button onClick={() => onWin(roundWinnings)} style={btnStyle('#666666')}>WALK AWAY</button>
        </div>
      )}
    </div>
  )
}

function btnStyle(color) {
  return {
    background: 'transparent',
    border: `1px solid ${color}`,
    color,
    padding: '5px 14px',
    fontFamily: 'inherit',
    fontSize: '0.95em',
    cursor: 'pointer',
  }
}
