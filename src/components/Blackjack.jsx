'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CardDisplay from './CardDisplay'
import Dealer from './Dealer'
import { createDeck, dealCard, scoreHand, isBlackjack, isBust, determineOutcome } from '@/lib/blackjackLogic'
import { sounds } from '@/lib/soundEngine'

const DEALER_STAND_DEFAULT = 17
const DEALER_MESSAGES = {
  player_blackjack: 'Blackjack. You played that perfectly.',
  player_win: 'You win. Well played.',
  dealer_win: 'Dealer wins. Better luck next time.',
  push: 'Push. No one wins.',
}

export default function Blackjack({ gameState, activeModifier, onWin, onLoss, onPush }) {
  const [deck, setDeck] = useState([])
  const [playerCards, setPlayerCards] = useState([])
  const [dealerCards, setDealerCards] = useState([])
  const [phase, setPhase] = useState('dealing') // dealing | player_turn | dealer_turn | result
  const [outcome, setOutcome] = useState(null)
  const [dealerMessages, setDealerMessages] = useState([])
  const [doubledDown, setDoubledDown] = useState(false)
  const [dealerRevealed, setDealerRevealed] = useState(false)

  const dealerStandOn = activeModifier?.dealerStandsOn ?? DEALER_STAND_DEFAULT
  const payoutMultiplier = activeModifier?.payoutMultiplier ?? 1
  const freeDouble = activeModifier?.freeDoubleDown ?? false
  const extraCard = activeModifier?.extraStartCard ?? false
  const blindCard = activeModifier?.blindCard ?? false
  const noSplit = activeModifier?.noSplit ?? false

  useEffect(() => {
    startHand()
  }, [])

  function startHand() {
    let d = createDeck()
    let pCards = []
    let dCards = []

    // Deal initial cards
    const cardsToDeal = extraCard ? 3 : 2
    for (let i = 0; i < cardsToDeal; i++) {
      const { card, remainingDeck } = dealCard(d)
      pCards.push(card)
      d = remainingDeck
    }
    for (let i = 0; i < 2; i++) {
      const { card, remainingDeck } = dealCard(d)
      dCards.push(card)
      d = remainingDeck
    }

    setDeck(d)
    setPlayerCards(pCards)
    setDealerCards(dCards)
    setPhase('player_turn')
    sounds.card_deal()

    // Check for instant player blackjack
    if (isBlackjack(pCards) && pCards.length === 2) {
      setTimeout(() => resolveHand(pCards, dCards, d, false), 600)
    }
  }

  function hit() {
    const { card, remainingDeck } = dealCard(deck)
    const newCards = [...playerCards, card]
    setDeck(remainingDeck)
    setPlayerCards(newCards)
    sounds.card_flip()

    if (isBust(newCards)) {
      setTimeout(() => resolveHand(newCards, dealerCards, remainingDeck, false), 400)
    } else if (doubledDown) {
      setTimeout(() => runDealerTurn(newCards, dealerCards, remainingDeck, true), 400)
    }
  }

  function stand() {
    sounds.typewriter_click()
    runDealerTurn(playerCards, dealerCards, deck, false)
  }

  function doubleDown() {
    const { card, remainingDeck } = dealCard(deck)
    const newCards = [...playerCards, card]
    setDeck(remainingDeck)
    setPlayerCards(newCards)
    setDoubledDown(true)
    sounds.card_flip()
    setTimeout(() => runDealerTurn(newCards, dealerCards, remainingDeck, true), 400)
  }

  function runDealerTurn(pCards, dCards, currentDeck, wasDoubled) {
    setPhase('dealer_turn')
    let d = currentDeck
    let dc = [...dCards]

    // First reveal the dealer's hidden card, then draw
    setTimeout(() => {
      sounds.card_flip()
      setDealerRevealed(true)

      const drawLoop = () => {
        const score = scoreHand(dc)
        if (score < dealerStandOn) {
          const { card, remainingDeck } = dealCard(d)
          dc = [...dc, card]
          d = remainingDeck
          setDealerCards([...dc])
          setTimeout(drawLoop, 600)
        } else {
          resolveHand(pCards, dc, d, wasDoubled)
        }
      }
      setTimeout(drawLoop, 600)
    }, 400)
  }

  function resolveHand(pCards, dCards, finalDeck, doubled) {
    const result = determineOutcome(pCards, dCards)
    setOutcome(result)
    setPhase('result')
    setDealerRevealed(true)
    setDealerCards(dCards)

    const msg = DEALER_MESSAGES[result] || 'Round over.'
    setDealerMessages([msg])

    const bet = gameState.currentBet
    const multiplier = result === 'player_blackjack' ? 1.5 * payoutMultiplier : payoutMultiplier
    const doubled_bet = doubled && !freeDouble ? bet * 2 : bet

    if (result === 'player_blackjack' || result === 'player_win') {
      sounds.chip_win()
    } else if (result === 'dealer_win') {
      sounds.chip_lose()
    }

    setTimeout(() => {
      if (result === 'player_blackjack' || result === 'player_win') {
        const winnings = Math.floor(doubled_bet * multiplier)
        onWin(winnings)
      } else if (result === 'dealer_win') {
        onLoss()
      } else {
        onPush()
      }
    }, 1800)
  }

  const playerScore = scoreHand(playerCards)
  const dealerScore = phase === 'result' ? scoreHand(dealerCards) : scoreHand([dealerCards[0]].filter(Boolean))
  const displayPlayerScore = blindCard && phase === 'player_turn'
    ? `${scoreHand(playerCards.filter((_, i) => i !== 1))} + ?`
    : playerScore
  const canSplit = playerCards.length === 2
    && playerCards[0]?.rank === playerCards[1]?.rank
    && !noSplit
    && phase === 'player_turn'
  const canDouble = playerCards.length <= 3 && phase === 'player_turn' && !doubledDown

  return (
    <div>
      <Dealer messages={dealerMessages} />

      {/* Dealer hand */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: '#666666', marginBottom: '4px' }}>
          DEALER {dealerRevealed ? `— ${scoreHand(dealerCards)}` : ''}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {dealerCards.map((card, i) => (
            <CardDisplay
              key={i}
              card={card}
              faceDown={!dealerRevealed && i === 1}
            />
          ))}
        </div>
      </div>

      {/* Player hand */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: '#666666', marginBottom: '4px' }}>YOU — {displayPlayerScore}</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {playerCards.map((card, i) => (
            <CardDisplay
              key={i}
              card={card}
              faceDown={blindCard && i === 1 && phase === 'player_turn'}
            />
          ))}
        </div>
      </div>

      {/* Outcome */}
      {outcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            color: outcome.includes('player') ? '#f0c040' : outcome === 'push' ? '#c8c8a0' : '#c03030',
            fontSize: '1.4em',
            marginBottom: '12px',
          }}
        >
          {outcome === 'player_blackjack' && 'BLACKJACK!'}
          {outcome === 'push' && 'PUSH'}
        </motion.div>
      )}

      {/* Actions */}
      {phase === 'player_turn' && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button onClick={hit} style={btnStyle('#f0c040')}>HIT</button>
          <button onClick={stand} style={btnStyle('#80c080')}>STAND</button>
          {canDouble && (
            <button onClick={doubleDown} style={btnStyle('#c8c8a0')}>
              DOUBLE{freeDouble ? ' (FREE)' : ''}
            </button>
          )}
          {canSplit && (
            <button onClick={() => {}} style={btnStyle('#c8c8a0')} disabled>SPLIT</button>
          )}
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
    padding: '6px 16px',
    fontFamily: 'inherit',
    fontSize: '1em',
    cursor: 'pointer',
  }
}
