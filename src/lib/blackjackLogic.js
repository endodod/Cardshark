const SUITS = ['spades', 'clubs', 'hearts', 'diamonds']
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

function cardValue(rank) {
  if (['J', 'Q', 'K'].includes(rank)) return 10
  if (rank === 'A') return 11
  return parseInt(rank, 10)
}

export function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit, value: cardValue(rank) })
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function dealCard(deck) {
  const [card, ...remainingDeck] = deck
  return { card, remainingDeck }
}

export function scoreHand(cards) {
  let total = 0
  let aces = 0

  for (const card of cards) {
    total += card.value
    if (card.rank === 'A') aces++
  }

  // Reduce aces from 11 to 1 if bust
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }

  return total
}

export function isBlackjack(cards) {
  return cards.length === 2 && scoreHand(cards) === 21
}

export function isBust(cards) {
  return scoreHand(cards) > 21
}

export function determineOutcome(playerCards, dealerCards) {
  const playerScore = scoreHand(playerCards)
  const dealerScore = scoreHand(dealerCards)

  if (isBlackjack(playerCards) && !isBlackjack(dealerCards)) return 'player_blackjack'
  if (isBust(playerCards)) return 'dealer_win'
  if (isBust(dealerCards)) return 'player_win'
  if (isBlackjack(dealerCards) && !isBlackjack(playerCards)) return 'dealer_win'
  if (playerScore > dealerScore) return 'player_win'
  if (dealerScore > playerScore) return 'dealer_win'
  return 'push'
}
