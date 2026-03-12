'use client'

import { motion } from 'framer-motion'

function getSuitSymbol(suit) {
  switch (suit) {
    case 'hearts': return '♥'
    case 'diamonds': return '♦'
    case 'spades': return '♠'
    case 'clubs': return '♣'
    default: return '?'
  }
}

function getSuitColor(suit) {
  return ['hearts', 'diamonds'].includes(suit) ? '#c03030' : '#c8c8a0'
}

export default function CardDisplay({ card, faceDown, animate = true, compact = false }) {
  const cardStyle = {
    display: 'inline-block',
    border: '1px solid #666666',
    padding: compact ? '6px 8px' : '10px 12px',
    width: compact ? '88px' : '144px',
    height: compact ? '122px' : '200px',
    fontFamily: 'inherit',
    fontSize: compact ? '26px' : '44px',
    lineHeight: '1.3',
    verticalAlign: 'top',
    backgroundColor: '#0a0a0a',
    position: 'relative',
    textAlign: 'center',
    flexShrink: 0,
  }

  const wrapper = animate
    ? { initial: { y: -30, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.2 } }
    : {}

  if (faceDown) {
    return (
      <motion.div style={cardStyle} {...wrapper}>
        <div style={{
          position: 'absolute', inset: '8px',
          color: '#333', fontSize: '0.8em', lineHeight: '1.6',
          overflow: 'hidden', wordBreak: 'break-all',
          userSelect: 'none',
        }}>
          {'░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░'}
        </div>
      </motion.div>
    )
  }

  const symbol = getSuitSymbol(card.suit)
  const color = getSuitColor(card.suit)
  const rankDisplay = card.rank

  return (
    <motion.div style={{ ...cardStyle, color }} {...wrapper}>
      {/* Top-left rank */}
      <div style={{ position: 'absolute', top: '8px', left: '10px', fontSize: '0.85em', lineHeight: 1 }}>
        {rankDisplay}
      </div>
      {/* Center suit */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '2em',
        lineHeight: 1,
      }}>
        {symbol}
      </div>
      {/* Bottom-right rank (rotated) */}
      <div style={{
        position: 'absolute', bottom: '8px', right: '10px',
        fontSize: '0.85em', lineHeight: 1,
        transform: 'rotate(180deg)',
      }}>
        {rankDisplay}
      </div>
    </motion.div>
  )
}
