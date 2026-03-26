'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { rollDice, evaluateChallenge } from '@/lib/diceLogic'
import Dealer from './Dealer'
import { sounds } from '@/lib/soundEngine'

const DICE_PIPS = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
}

function DieFace({ value, rolling, settling, resultPassed, index }) {
  const display = rolling ? Math.floor(Math.random() * 6) + 1 : value
  const pips = DICE_PIPS[display] || DICE_PIPS[1]

  const borderColor = settling || (!rolling && value != null)
    ? resultPassed === true
      ? '#f0c040'
      : resultPassed === false
        ? '#c03030'
        : '#666666'
    : '#666666'

  return (
    <motion.div
      animate={
        settling
          ? { scale: [1.1, 0.95, 1] }
          : rolling
            ? { rotateZ: [0, 180, 360] }
            : { rotateZ: 0, scale: 1 }
      }
      transition={
        settling
          ? { duration: 0.2, delay: index * 0.08, times: [0, 0.5, 1] }
          : rolling
            ? { repeat: Infinity, duration: 0.18, ease: 'linear', delay: index * 0.05 }
            : { duration: 0.1 }
      }
      style={{
        border: `1px solid ${borderColor}`,
        width: '52px',
        height: '52px',
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'top',
        transition: 'border-color 0.3s',
      }}
    >
      {pips.map(([row, col], i) => (
        <div key={i} style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: '#c8c8a0',
          top: `${8 + row * 14}px`,
          left: `${8 + col * 14}px`,
        }} />
      ))}
    </motion.div>
  )
}

export default function DiceGame({ offer, roundWinnings, hasLoadedDice, onWin, onLoss }) {
  const [phase, setPhase] = useState('offer') // offer | rolling | settling | result
  const [rolls, setRolls] = useState([])
  const [flickering, setFlickering] = useState(false)
  const [settling, setSettling] = useState(false)
  const [result, setResult] = useState(null)
  const [rerollUsed, setRerollUsed] = useState(false)
  const [showReroll, setShowReroll] = useState(false)
  const [dealerMessages, setDealerMessages] = useState([offer.dealerLine])

  function doRoll() {
    setPhase('rolling')
    setFlickering(true)
    setSettling(false)
    setShowReroll(false)
    sounds.dice_roll()

    // Flicker for 1 second — rapidly update rolls for visual chaos
    const flickerInterval = setInterval(() => {
      setRolls(rollDice(offer.dice))
    }, 80)

    setTimeout(() => {
      clearInterval(flickerInterval)
      const finalRolls = rollDice(offer.dice)
      setRolls(finalRolls)
      setFlickering(false)

      // Bounce settle animation
      setSettling(true)
      setTimeout(() => setSettling(false), 300)

      const eval_ = evaluateChallenge(finalRolls, { condition: offer.condition, target: offer.target })
      setResult(eval_)
      sounds.dice_result()
      setDealerMessages([offer.dealerLine, eval_.description])
      setPhase('result')

      if (!eval_.passed && hasLoadedDice && !rerollUsed) {
        setShowReroll(true)
      } else {
        finalize(eval_)
      }
    }, 1000)
  }

  function doReroll() {
    setRerollUsed(true)
    setShowReroll(false)
    setFlickering(true)
    setSettling(false)
    setPhase('rolling')
    sounds.dice_roll()

    const flickerInterval = setInterval(() => {
      setRolls(rollDice(offer.dice))
    }, 80)

    setTimeout(() => {
      clearInterval(flickerInterval)
      const finalRolls = rollDice(offer.dice)
      setRolls(finalRolls)
      setFlickering(false)

      setSettling(true)
      setTimeout(() => setSettling(false), 300)

      const eval_ = evaluateChallenge(finalRolls, { condition: offer.condition, target: offer.target })
      setResult(eval_)
      sounds.dice_result()
      setDealerMessages([offer.dealerLine, eval_.description])
      setPhase('result')
      finalize(eval_)
    }, 1000)
  }

  function finalize(eval_) {
    setTimeout(() => {
      if (eval_.passed) {
        const finalAmount = Math.floor(roundWinnings * offer.payout)
        onWin(finalAmount)
      } else {
        onLoss()
      }
    }, 1500)
  }

  return (
    <div>
      <Dealer messages={dealerMessages} />

      {/* Challenge info */}
      <div style={{ color: '#c8c8a0', margin: '12px 0' }}>
        {offer.condition === 'over' && `Roll over ${offer.target} with ${offer.dice} dice`}
        {offer.condition === 'pair' && `Roll a matching pair with ${offer.dice} dice`}
        {offer.condition === 'triple' && `Roll three of a kind with ${offer.dice} dice`}
        {' — '}
        <span style={{ color: '#f0c040' }}>{offer.payout}x payout</span>
        {' ('}{offer.odds}{')'}
      </div>

      <div style={{ color: '#80c080', marginBottom: '12px' }}>
        Winnings at stake: <span style={{ color: '#f0c040' }}>{roundWinnings} dollars</span>
        {' → '}
        <span style={{ color: '#f0c040' }}>{Math.floor(roundWinnings * offer.payout)} dollars if you win</span>
      </div>

      {/* Dice display */}
      {rolls.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          {rolls.map((val, i) => (
            <DieFace
              key={i}
              value={val}
              rolling={flickering}
              settling={settling}
              resultPassed={!flickering && !settling && result ? result.passed : null}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Result */}
      {result && !flickering && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            color: result.passed ? '#f0c040' : '#c03030',
            marginBottom: '12px',
            fontSize: '1.1em',
          }}
        >
          {result.passed ? `WIN — +${Math.floor(roundWinnings * offer.payout)} DOLLARS` : 'FAIL — WINNINGS LOST'}
        </motion.div>
      )}

      {/* Buttons */}
      {phase === 'offer' && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={doRoll} style={btnStyle('#f0c040')}>ROLL</button>
          <button onClick={() => { sounds.typewriter_click(); onWin(Math.floor(roundWinnings * 0.5)) }} style={btnStyle('#666666')}>WALK AWAY — KEEP 50%</button>
        </div>
      )}

      {showReroll && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button onClick={doReroll} style={btnStyle('#80c080')}>[REROLL] — LOADED DICE</button>
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
