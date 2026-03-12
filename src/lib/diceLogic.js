import { DICE_OFFERS } from '../constants/diceOffers.js'

export function rollDice(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1)
}

export function evaluateChallenge(rolls, challenge) {
  const total = rolls.reduce((sum, r) => sum + r, 0)

  if (challenge.condition === 'over') {
    const passed = total > challenge.target
    return {
      passed,
      total,
      description: `Rolled ${total}. Need over ${challenge.target}. ${passed ? 'PASS' : 'FAIL'}.`,
    }
  }

  if (challenge.condition === 'pair') {
    const passed = rolls.length >= 2 && rolls[0] === rolls[1]
    return {
      passed,
      total,
      description: `Rolled ${rolls.join(', ')}. ${passed ? 'PAIR — PASS' : 'No pair — FAIL'}.`,
    }
  }

  if (challenge.condition === 'triple') {
    const passed = rolls.length === 3 && rolls[0] === rolls[1] && rolls[1] === rolls[2]
    return {
      passed,
      total,
      description: `Rolled ${rolls.join(', ')}. ${passed ? 'THREE OF A KIND — PASS' : 'No triple — FAIL'}.`,
    }
  }

  return { passed: false, total, description: 'Unknown challenge.' }
}

export function selectDiceOffer() {
  return DICE_OFFERS[Math.floor(Math.random() * DICE_OFFERS.length)]
}
