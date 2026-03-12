export const GAME_PHASES = {
  BOOT: 'boot',
  IDLE: 'idle',
  SLOT: 'slot',
  BLACKJACK: 'blackjack',
  BONUS_OFFER: 'bonus_offer',
  DICE: 'dice',
  ROULETTE: 'roulette',
  POKER: 'poker',
  ROUND_END: 'round_end',
}

export const initialState = {
  phase: 'boot',
  balance: 500,
  currentBet: 0,
  activeModifier: null,
  roundWinnings: 0,
  streak: 0,
  sessionOfferCount: 0,
}
