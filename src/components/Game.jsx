'use client'

import { useState } from 'react'
import { initialState } from '@/lib/gameState'
import { selectDiceOffer } from '@/lib/diceLogic'
import HUD from './HUD'
import Dealer from './Dealer'
import BootSequence from './BootSequence'
import SlotMachine from './SlotMachine'
import Blackjack from './Blackjack'
import DiceGame from './DiceGame'
import RouletteGame from './RouletteGame'
import PokerDuel from './PokerDuel'

function selectBonusGame(roundWinnings) {
  const rand = Math.random()
  if (roundWinnings < 50) return 'dice'
  if (roundWinnings < 100) return rand < 0.6 ? 'dice' : 'roulette'
  // >= 100
  if (rand < 0.4) return 'dice'
  if (rand < 0.7) return 'roulette'
  return 'poker'
}

function selectPokerVariant() {
  const variants = ['blind', 'flop', 'full']
  return variants[Math.floor(Math.random() * variants.length)]
}

export default function Game() {
  const [state, setState] = useState({ ...initialState, phase: 'boot', hasRescued: false })
  const [betInput, setBetInput] = useState('')
  const [bonusGame, setBonusGame] = useState(null)
  const [pokerVariant, setPokerVariant] = useState('blind')
  const [diceOffer, setDiceOffer] = useState(null)
  const [roundResult, setRoundResult] = useState(null) // 'win' | 'loss' | 'push'

  function updateState(patch) {
    setState(prev => ({ ...prev, ...patch }))
  }

  // ── BOOT ────────────────────────────────────────────────────────────────────
  if (state.phase === 'boot') {
    return (
      <BootSequence onComplete={() => updateState({ phase: 'idle' })} />
    )
  }

  // ── IDLE ────────────────────────────────────────────────────────────────────
  function handleBet() {
    const bet = parseInt(betInput)
    if (!bet || bet <= 0 || bet > state.balance) return
    updateState({ currentBet: bet, balance: state.balance - bet, phase: 'blackjack' })
  }

  // ── SLOT SPIN ───────────────────────────────────────────────────────────────
  function handleSlotSpin(cost, modifier) {
    // jackpot: add 500 chips, skip hand, go to round_end
    if (modifier?.jackpot) {
      updateState({
        balance: state.balance - cost + 500,
        activeModifier: null,
        roundWinnings: 500,
        phase: 'round_end',
      })
      setRoundResult('win')
      return
    }
    // Return to idle so player can place their bet with modifier visible in HUD
    updateState({
      balance: state.balance - cost,
      activeModifier: modifier,
      phase: 'idle',
    })
  }

  // ── BLACKJACK CALLBACKS ──────────────────────────────────────────────────────
  function handleBJWin(winnings) {
    const newStreak = state.streak + 1
    const game = selectBonusGame(winnings)
    setBonusGame(game)
    if (game === 'dice') setDiceOffer(selectDiceOffer())
    if (game === 'poker') setPokerVariant(selectPokerVariant())

    updateState({
      roundWinnings: winnings,
      streak: newStreak,
      phase: 'bonus_offer',
    })
  }

  function handleBJLoss() {
    const newBalance = Math.max(0, state.balance)
    updateState({
      streak: 0,
      roundWinnings: 0,
      phase: 'round_end',
      balance: newBalance,
    })
    setRoundResult('loss')
  }

  function handleBJPush() {
    // Return bet to player
    updateState({
      streak: 0,
      roundWinnings: 0,
      balance: state.balance + state.currentBet,
      phase: 'round_end',
    })
    setRoundResult('push')
  }

  // ── BONUS CALLBACKS ──────────────────────────────────────────────────────────
  function acceptBonus() {
    updateState({ phase: bonusGame })
  }

  function walkAwayFromBonus() {
    // Keep round winnings, skip bonus
    updateState({
      balance: state.balance + state.roundWinnings,
      phase: 'round_end',
    })
    setRoundResult('win')
  }

  function handleBonusWin(finalAmount) {
    const newBalance = state.balance + finalAmount
    updateState({ balance: newBalance, phase: 'round_end' })
    setRoundResult('win')
  }

  function handleBonusLoss() {
    const newBalance = Math.max(0, state.balance)
    updateState({ balance: newBalance, phase: 'round_end', roundWinnings: 0 })
    setRoundResult('loss')
  }

  // ── NEXT ROUND ───────────────────────────────────────────────────────────────
  function nextRound() {
    const needsRescue = state.balance <= 0 && !state.hasRescued
    updateState({
      phase: 'idle',
      currentBet: 0,
      activeModifier: null,
      roundWinnings: 0,
      ...(needsRescue ? { balance: 100, hasRescued: true } : {}),
    })
    setBetInput('')
    setBonusGame(null)
    setRoundResult(null)
  }

  return (
    <div>
      <HUD balance={state.balance} activeModifier={state.activeModifier} />

      {/* ── IDLE ── */}
      {state.phase === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Top: dealer + bet area */}
          <div>
            <Dealer messages={[
              state.hasRescued && state.balance === 100
                ? 'You have been fronted 100. Do not forget what you owe.'
                : 'Place your bet, or try your luck at a machine first.',
            ]} />

            <div style={{ margin: '10px 0' }}>
              <div style={{ color: '#666666', marginBottom: '10px', fontSize: '0.9em' }}>
                BET:{' '}
                <span style={{ color: betInput ? '#f0c040' : '#444', fontSize: '1.1em' }}>
                  {betInput ? `${betInput} chips` : '— select chips below —'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {[10, 25, 50, 100, 200, 500].map(chip => {
                  const current = parseInt(betInput) || 0
                  const disabled = chip > state.balance || current + chip > state.balance
                  const color = chip <= 25 ? '#80c080' : chip <= 100 ? '#c8c8a0' : '#f0c040'
                  return (
                    <button
                      key={chip}
                      onClick={() => setBetInput(String(current + chip))}
                      disabled={disabled}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${disabled ? '#333' : color}`,
                        color: disabled ? '#333' : color,
                        fontFamily: 'inherit',
                        fontSize: '1em',
                        padding: '6px 14px',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      +{chip}
                    </button>
                  )
                })}
                <button
                  onClick={() => setBetInput('')}
                  disabled={!betInput}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${betInput ? '#c03030' : '#333'}`,
                    color: betInput ? '#c03030' : '#333',
                    fontFamily: 'inherit',
                    fontSize: '1em',
                    padding: '6px 14px',
                    cursor: betInput ? 'pointer' : 'not-allowed',
                  }}
                >
                  CLEAR
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={handleBet}
                  disabled={!betInput || parseInt(betInput) <= 0 || parseInt(betInput) > state.balance}
                  style={btnStyle(betInput && parseInt(betInput) > 0 && parseInt(betInput) <= state.balance ? '#f0c040' : '#333')}
                >
                  BET &amp; PLAY
                </button>

                {state.streak >= 3 && (
                  <span style={{ color: '#f0c040', fontSize: '0.85em' }}>
                    STREAK: {state.streak} wins
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom: slot machine banner */}
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
            <div
              onClick={() => updateState({ phase: 'slot' })}
              style={{
                border: '1px solid #444',
                padding: '20px 48px',
                cursor: 'pointer',
                textAlign: 'center',
                userSelect: 'none',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#80c080'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#444'}
            >
              <div style={{ color: '#444', fontSize: '0.6em', letterSpacing: '0.3em', marginBottom: '14px' }}>
                ══ SLOT MACHINES ══
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '14px' }}>
                {['7', 'BAR', '★'].map((sym, i) => (
                  <div key={i} style={{
                    border: '1px solid #555',
                    width: '2.2em',
                    height: '2.2em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f0c040',
                    fontSize: '1.1em',
                    backgroundColor: '#111',
                  }}>
                    {sym}
                  </div>
                ))}
              </div>
              <div style={{ color: '#80c080', fontSize: '0.65em', letterSpacing: '0.25em' }}>
                ▶ INSERT COINS TO PLAY ◀
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── SLOT ── */}
      {state.phase === 'slot' && (
        <SlotMachine
          balance={state.balance}
          onSpin={handleSlotSpin}
          onSkip={() => {
            if (!betInput || parseInt(betInput) <= 0 || parseInt(betInput) > state.balance) {
              // Go back to idle for bet if no bet set yet
              updateState({ phase: 'idle' })
            } else {
              const bet = parseInt(betInput)
              updateState({ currentBet: bet, balance: state.balance - bet, phase: 'blackjack' })
            }
          }}
        />
      )}

      {/* ── BLACKJACK ── */}
      {state.phase === 'blackjack' && (
        <Blackjack
          gameState={state}
          activeModifier={state.activeModifier}
          onWin={handleBJWin}
          onLoss={handleBJLoss}
          onPush={handleBJPush}
        />
      )}

      {/* ── BONUS OFFER ── */}
      {state.phase === 'bonus_offer' && (
        <div>
          <Dealer messages={[
            `You won ${state.roundWinnings} chips.`,
            bonusGame === 'dice' && diceOffer ? diceOffer.dealerLine : '',
            bonusGame === 'roulette' ? 'One spin on the wheel. Double or nothing.' : '',
            bonusGame === 'poker' ? `A hand of poker. ${pokerVariant} duel.` : '',
            'Accept the offer, or walk away with your winnings.',
          ].filter(Boolean)} />

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button onClick={acceptBonus} style={btnStyle('#f0c040')}>ACCEPT</button>
            <button onClick={walkAwayFromBonus} style={btnStyle('#666666')}>WALK AWAY</button>
          </div>
        </div>
      )}

      {/* ── DICE ── */}
      {state.phase === 'dice' && diceOffer && (
        <DiceGame
          offer={diceOffer}
          roundWinnings={state.roundWinnings}
          hasLoadedDice={state.activeModifier?.loadedDice ?? false}
          onWin={handleBonusWin}
          onLoss={handleBonusLoss}
        />
      )}

      {/* ── ROULETTE ── */}
      {state.phase === 'roulette' && (
        <RouletteGame
          roundWinnings={state.roundWinnings}
          onWin={handleBonusWin}
          onLoss={handleBonusLoss}
        />
      )}

      {/* ── POKER ── */}
      {state.phase === 'poker' && (
        <PokerDuel
          variant={pokerVariant}
          roundWinnings={state.roundWinnings}
          hasPeekAdvantage={state.activeModifier?.peekAdvantage ?? false}
          onWin={handleBonusWin}
          onLoss={handleBonusLoss}
        />
      )}

      {/* ── ROUND END ── */}
      {state.phase === 'round_end' && (
        <div>
          <div style={{
            color: roundResult === 'win' ? '#f0c040' : roundResult === 'push' ? '#c8c8a0' : '#c03030',
            fontSize: '1.3em',
            marginBottom: '12px',
          }}>
            {roundResult === 'win' && `ROUND COMPLETE — BALANCE: ${state.balance.toLocaleString()} CHIPS`}
            {roundResult === 'loss' && `ROUND LOST — BALANCE: ${state.balance.toLocaleString()} CHIPS`}
            {roundResult === 'push' && `PUSH — BALANCE: ${state.balance.toLocaleString()} CHIPS`}
          </div>

          {state.balance <= 0 && (
            <div style={{ color: '#80c080', marginBottom: '12px' }}>
              &gt; You have nothing left. I will front you 100. Do not forget.
            </div>
          )}

          <button onClick={nextRound} style={btnStyle('#80c080')}>NEXT ROUND</button>
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
