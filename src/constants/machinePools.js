// Weighted pools per machine.
// Rusty: minor buffs, occasional curses, rare big buff. Includes curse_one_eye and curse_no_split.
// Classic: decent multipliers, rare curses, some strong buffs. No curses.
// High Roller: strong multipliers, powerful modifiers, NO curses.
//
// Usage: sum all weights, pick random 0..sum, walk down pool.

export const MACHINE_POOLS = {
  rusty: [
    { modifierId: 'payout_1_5x',     weight: 35 },
    { modifierId: 'dealer_stands_15', weight: 20 },
    { modifierId: 'extra_card',       weight: 15 },
    { modifierId: 'payout_2x',        weight: 8  },
    { modifierId: 'jackpot',          weight: 2  },
    { modifierId: 'curse_one_eye',    weight: 10 },
    { modifierId: 'curse_no_split',   weight: 10 },
  ],
  classic: [
    { modifierId: 'payout_2x',        weight: 30 },
    { modifierId: 'payout_1_5x',      weight: 20 },
    { modifierId: 'dealer_stands_15', weight: 15 },
    { modifierId: 'free_double',      weight: 12 },
    { modifierId: 'extra_card',       weight: 10 },
    { modifierId: 'loaded_dice',      weight: 8  },
    { modifierId: 'payout_3x',        weight: 3  },
    { modifierId: 'jackpot',          weight: 2  },
  ],
  highroller: [
    { modifierId: 'payout_3x',        weight: 25 },
    { modifierId: 'payout_2x',        weight: 20 },
    { modifierId: 'free_double',      weight: 15 },
    { modifierId: 'peek_advantage',   weight: 15 },
    { modifierId: 'loaded_dice',      weight: 13 },
    { modifierId: 'dealer_stands_15', weight: 8  },
    { modifierId: 'jackpot',          weight: 4  },
  ],
}

export const MACHINE_COSTS = {
  rusty: 10,
  classic: 50,
  highroller: 150,
}

export const MACHINE_LABELS = {
  rusty: 'Rusty One-Armed Bandit',
  classic: 'Classic Vegas Machine',
  highroller: 'High Roller Machine',
}

export const MACHINE_DESCRIPTIONS = {
  rusty: 'Minor buffs, occasional curses, rare big buff',
  classic: 'Decent multipliers, rare curses, some strong buffs',
  highroller: 'Strong multipliers, powerful modifiers, no curses',
}
