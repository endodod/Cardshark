const HAND_VALUES = {
  royal_flush: 9,
  straight_flush: 8,
  four_of_a_kind: 7,
  full_house: 6,
  flush: 5,
  straight: 4,
  three_of_a_kind: 3,
  two_pair: 2,
  one_pair: 1,
  high_card: 0,
}

const RANK_ORDER = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']

function rankIndex(rank) {
  return RANK_ORDER.indexOf(String(rank))
}

function evaluateFiveCards(cards) {
  const ranks = cards.map(c => rankIndex(c.rank)).sort((a, b) => a - b)
  const suits = cards.map(c => c.suit)

  const isFlush = suits.every(s => s === suits[0])
  const isStraight = (() => {
    // Check normal straight
    const normal = ranks.every((r, i) => i === 0 || r === ranks[i - 1] + 1)
    // Check A-low straight (A,2,3,4,5): ranks would be [0,1,2,3,12]
    const aceLow = JSON.stringify(ranks) === JSON.stringify([0, 1, 2, 3, 12])
    return normal || aceLow
  })()

  const rankCounts = {}
  for (const r of ranks) rankCounts[r] = (rankCounts[r] || 0) + 1
  const counts = Object.values(rankCounts).sort((a, b) => b - a)

  if (isFlush && isStraight) {
    const isRoyal = ranks[4] === 12 && ranks[3] === 11 && ranks[0] === 8
    return isRoyal ? 'royal_flush' : 'straight_flush'
  }
  if (counts[0] === 4) return 'four_of_a_kind'
  if (counts[0] === 3 && counts[1] === 2) return 'full_house'
  if (isFlush) return 'flush'
  if (isStraight) return 'straight'
  if (counts[0] === 3) return 'three_of_a_kind'
  if (counts[0] === 2 && counts[1] === 2) return 'two_pair'
  if (counts[0] === 2) return 'one_pair'
  return 'high_card'
}

function combinations(arr, k) {
  if (k === 0) return [[]]
  if (arr.length < k) return []
  const [first, ...rest] = arr
  const withFirst = combinations(rest, k - 1).map(combo => [first, ...combo])
  const withoutFirst = combinations(rest, k)
  return [...withFirst, ...withoutFirst]
}

export function evaluateBestHand(cards) {
  // Try all C(n,5) combinations, return the best
  const combos = combinations(cards, 5)
  let best = { rank: 'high_card', value: 0 }

  for (const combo of combos) {
    const rank = evaluateFiveCards(combo)
    const value = HAND_VALUES[rank]
    if (value > best.value) {
      best = { rank, value }
    }
  }

  return best
}
