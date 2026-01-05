import {
  recordBBBHole,
  createEmptyBBBResult,
  calculateBBBPoints,
  getPlayerBBBPoints,
  settleBBB,
  getBBBLeader,
  getRemainingPoints,
  canStillWin,
  getTotalPointsAwarded,
  getMaxPossiblePoints,
} from '@/lib/bets/sideBets/bingoBangoBongo'
import type { BBBHoleResult, SideBetConfig } from '@/lib/bets/sideBets/types'

describe('recordBBBHole', () => {
  it('records all three points', () => {
    const result = recordBBBHole(1, 'A', 'B', 'C')
    expect(result.holeNumber).toBe(1)
    expect(result.bingo).toBe('A')
    expect(result.bango).toBe('B')
    expect(result.bongo).toBe('C')
  })

  it('handles null values', () => {
    const result = recordBBBHole(1, 'A', null, null)
    expect(result.bingo).toBe('A')
    expect(result.bango).toBeNull()
    expect(result.bongo).toBeNull()
  })
})

describe('createEmptyBBBResult', () => {
  it('creates empty result', () => {
    const result = createEmptyBBBResult(5)
    expect(result.holeNumber).toBe(5)
    expect(result.bingo).toBeNull()
    expect(result.bango).toBeNull()
    expect(result.bongo).toBeNull()
  })
})

describe('calculateBBBPoints', () => {
  it('calculates points correctly', () => {
    const results: BBBHoleResult[] = [
      { holeNumber: 1, bingo: 'A', bango: 'B', bongo: 'A' },
      { holeNumber: 2, bingo: 'B', bango: 'A', bongo: 'B' },
    ]
    const points = calculateBBBPoints(results, ['A', 'B'])

    const playerA = points.find(p => p.playerId === 'A')!
    const playerB = points.find(p => p.playerId === 'B')!

    expect(playerA.bingoCount).toBe(1)
    expect(playerA.bangoCount).toBe(1)
    expect(playerA.bongoCount).toBe(1)
    expect(playerA.totalPoints).toBe(3)

    expect(playerB.bingoCount).toBe(1)
    expect(playerB.bangoCount).toBe(1)
    expect(playerB.bongoCount).toBe(1)
    expect(playerB.totalPoints).toBe(3)
  })

  it('handles player with no points', () => {
    const results: BBBHoleResult[] = [
      { holeNumber: 1, bingo: 'A', bango: 'A', bongo: 'A' },
    ]
    const points = calculateBBBPoints(results, ['A', 'B'])

    const playerB = points.find(p => p.playerId === 'B')!
    expect(playerB.totalPoints).toBe(0)
  })

  it('ignores points for non-participants', () => {
    const results: BBBHoleResult[] = [
      { holeNumber: 1, bingo: 'C', bango: 'A', bongo: 'A' },
    ]
    const points = calculateBBBPoints(results, ['A', 'B'])

    // C is not a participant, so bingo is ignored
    const total = points.reduce((sum, p) => sum + p.totalPoints, 0)
    expect(total).toBe(2) // Only bango and bongo for A
  })
})

describe('getPlayerBBBPoints', () => {
  it('returns point breakdown for a player', () => {
    const results: BBBHoleResult[] = [
      { holeNumber: 1, bingo: 'A', bango: 'B', bongo: 'A' },
      { holeNumber: 2, bingo: 'A', bango: 'A', bongo: 'B' },
    ]
    const points = getPlayerBBBPoints(results, 'A')

    expect(points.playerId).toBe('A')
    expect(points.bingoCount).toBe(2)
    expect(points.bangoCount).toBe(1)
    expect(points.bongoCount).toBe(1)
    expect(points.totalPoints).toBe(4)
  })
})

describe('settleBBB', () => {
  const config: SideBetConfig = { type: 'bingo_bango_bongo', amount: 1, enabled: true }

  it('settles point differential correctly', () => {
    const results: BBBHoleResult[] = [
      { holeNumber: 1, bingo: 'A', bango: 'A', bongo: 'A' },
      { holeNumber: 2, bingo: 'B', bango: 'B', bongo: 'A' },
    ]
    const payouts = settleBBB(results, config, ['A', 'B'])

    // A has 4 points, B has 2 points = 2 point diff
    expect(payouts.get('A')).toBe(2)
    expect(payouts.get('B')).toBe(-2)
  })

  it('handles tie (no exchange)', () => {
    const results: BBBHoleResult[] = [
      { holeNumber: 1, bingo: 'A', bango: 'B', bongo: 'A' },
      { holeNumber: 2, bingo: 'B', bango: 'A', bongo: 'B' },
    ]
    const payouts = settleBBB(results, config, ['A', 'B'])

    // Both have 3 points
    expect(payouts.get('A')).toBe(0)
    expect(payouts.get('B')).toBe(0)
  })

  it('settles 3-player match correctly', () => {
    const results: BBBHoleResult[] = [
      { holeNumber: 1, bingo: 'A', bango: 'A', bongo: 'A' }, // A: 3
      { holeNumber: 2, bingo: 'B', bango: 'B', bongo: 'C' }, // B: 2, C: 1
    ]
    const payouts = settleBBB(results, config, ['A', 'B', 'C'])

    // A: 3, B: 2, C: 1
    // A vs B: A wins $1
    // A vs C: A wins $2
    // B vs C: B wins $1
    // Net: A +$3, B +$0, C -$3
    expect(payouts.get('A')).toBe(3)
    expect(payouts.get('B')).toBe(0)
    expect(payouts.get('C')).toBe(-3)
  })

  it('handles no points', () => {
    const results: BBBHoleResult[] = []
    const payouts = settleBBB(results, config, ['A', 'B'])

    expect(payouts.get('A')).toBe(0)
    expect(payouts.get('B')).toBe(0)
  })

  it('uses correct amount per point', () => {
    const expensiveConfig: SideBetConfig = { type: 'bingo_bango_bongo', amount: 5, enabled: true }
    const results: BBBHoleResult[] = [
      { holeNumber: 1, bingo: 'A', bango: 'A', bongo: 'A' },
    ]
    const payouts = settleBBB(results, expensiveConfig, ['A', 'B'])

    // A has 3 points, B has 0 = 3 point diff * $5 = $15
    expect(payouts.get('A')).toBe(15)
    expect(payouts.get('B')).toBe(-15)
  })
})

describe('getBBBLeader', () => {
  it('returns leader with most points', () => {
    const results: BBBHoleResult[] = [
      { holeNumber: 1, bingo: 'A', bango: 'A', bongo: 'B' },
    ]
    const leader = getBBBLeader(results, ['A', 'B'])

    expect(leader?.playerId).toBe('A')
    expect(leader?.points).toBe(2)
  })

  it('returns null when no points awarded', () => {
    const results: BBBHoleResult[] = []
    const leader = getBBBLeader(results, ['A', 'B'])

    expect(leader).toBeNull()
  })

  it('returns null for empty participant list', () => {
    const results: BBBHoleResult[] = []
    const leader = getBBBLeader(results, [])

    expect(leader).toBeNull()
  })
})

describe('getRemainingPoints', () => {
  it('calculates remaining points for 18 holes', () => {
    expect(getRemainingPoints(0, 18)).toBe(54)
    expect(getRemainingPoints(9, 18)).toBe(27)
    expect(getRemainingPoints(18, 18)).toBe(0)
  })

  it('calculates remaining points for 9 holes', () => {
    expect(getRemainingPoints(0, 9)).toBe(27)
    expect(getRemainingPoints(5, 9)).toBe(12)
    expect(getRemainingPoints(9, 9)).toBe(0)
  })
})

describe('canStillWin', () => {
  it('returns true when player can catch leader', () => {
    // Player has 10 points, leader has 15, 5 holes remaining (15 max points)
    expect(canStillWin(10, 15, 5)).toBe(true) // 10 + 15 = 25 > 15
  })

  it('returns false when impossible to catch leader', () => {
    // Player has 10 points, leader has 30, 5 holes remaining (15 max points)
    expect(canStillWin(10, 30, 5)).toBe(false) // 10 + 15 = 25 < 30
  })

  it('returns true when tied with holes remaining', () => {
    expect(canStillWin(20, 20, 1)).toBe(true)
  })
})

describe('getTotalPointsAwarded', () => {
  it('counts all awarded points', () => {
    const results: BBBHoleResult[] = [
      { holeNumber: 1, bingo: 'A', bango: 'B', bongo: 'A' },
      { holeNumber: 2, bingo: 'A', bango: null, bongo: 'B' },
    ]
    expect(getTotalPointsAwarded(results)).toBe(5)
  })

  it('returns 0 for empty results', () => {
    expect(getTotalPointsAwarded([])).toBe(0)
  })
})

describe('getMaxPossiblePoints', () => {
  it('calculates max points for 18 holes', () => {
    expect(getMaxPossiblePoints(18)).toBe(54)
  })

  it('calculates max points for 9 holes', () => {
    expect(getMaxPossiblePoints(9)).toBe(27)
  })
})
