// Modifier shape:
// { id, label, description, type ('buff'|'curse'|'powerup'),
//   payoutMultiplier, dealerStandsOn, freeDoubleDown,
//   extraStartCard, loadedDice, peekAdvantage,
//   noSplit, blindCard }

export const MODIFIERS = [
  {
    id: 'payout_1_5x',
    label: '1.5x PAYOUT',
    description: 'Hand pays 1.5x',
    type: 'buff',
    payoutMultiplier: 1.5,
  },
  {
    id: 'payout_2x',
    label: '2x PAYOUT',
    description: 'Hand pays 2x',
    type: 'buff',
    payoutMultiplier: 2,
  },
  {
    id: 'payout_3x',
    label: '3x PAYOUT',
    description: 'Hand pays 3x',
    type: 'buff',
    payoutMultiplier: 3,
  },
  {
    id: 'dealer_stands_15',
    label: 'DEALER STANDS 15',
    description: 'Dealer must stand on 15+',
    type: 'buff',
    dealerStandsOn: 15,
  },
  {
    id: 'free_double',
    label: 'FREE DOUBLE',
    description: 'Double down costs no extra chips',
    type: 'buff',
    freeDoubleDown: true,
  },
  {
    id: 'extra_card',
    label: 'EXTRA CARD',
    description: 'Player dealt 3 cards to start',
    type: 'buff',
    extraStartCard: true,
  },
  {
    id: 'loaded_dice',
    label: 'LOADED DICE',
    description: 'One free reroll in the dice bonus game',
    type: 'powerup',
    loadedDice: true,
  },
  {
    id: 'peek_advantage',
    label: 'PEEK ADVANTAGE',
    description: 'See one dealer hole card in poker duel',
    type: 'powerup',
    peekAdvantage: true,
  },
  {
    id: 'jackpot',
    label: 'JACKPOT',
    description: 'Instant +500 chips, skip the hand',
    type: 'powerup',
    jackpot: true,
  },
  {
    id: 'curse_one_eye',
    label: 'ONE EYE',
    description: 'You can only see one of your own cards',
    type: 'curse',
    blindCard: true,
  },
  {
    id: 'curse_no_split',
    label: 'NO SPLIT',
    description: 'Splitting disabled this round',
    type: 'curse',
    noSplit: true,
  },
]

export function getModifierById(id) {
  return MODIFIERS.find((m) => m.id === id) || null
}
