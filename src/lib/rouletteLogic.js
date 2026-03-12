// European roulette: 0-36
// Red numbers: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])

export function spinWheel() {
  return Math.floor(Math.random() * 37) // 0-36
}

export function getColour(n) {
  if (n === 0) return 'green'
  return RED_NUMBERS.has(n) ? 'red' : 'black'
}

export function evaluateBet(n, bet) {
  const colour = getColour(n)

  if (bet.type === 'red') {
    return { won: colour === 'red', payout: 2 }
  }
  if (bet.type === 'black') {
    return { won: colour === 'black', payout: 2 }
  }
  if (bet.type === 'odd') {
    return { won: n !== 0 && n % 2 !== 0, payout: 2 }
  }
  if (bet.type === 'even') {
    return { won: n !== 0 && n % 2 === 0, payout: 2 }
  }
  if (bet.type === 'low') {
    return { won: n >= 1 && n <= 18, payout: 2 }
  }
  if (bet.type === 'high') {
    return { won: n >= 19 && n <= 36, payout: 2 }
  }
  if (bet.type === 'single') {
    return { won: n === bet.value, payout: 35 }
  }
  return { won: false, payout: 0 }
}

export function buildStrip(winningNumber) {
  // Build a strip of 41 numbers where the winning number lands at position 20 (center)
  const pool = Array.from({ length: 37 }, (_, i) => i) // 0-36
  // Double the pool so we have enough after removing the winner
  const doubled = [...pool, ...pool].filter(n => n !== winningNumber)
  const shuffled = doubled.sort(() => Math.random() - 0.5)
  const before = shuffled.slice(0, 20)
  const after = shuffled.slice(20, 40)
  return [...before, winningNumber, ...after]
}
