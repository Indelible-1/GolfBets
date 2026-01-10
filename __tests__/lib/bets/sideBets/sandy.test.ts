import {
  recordSandy,
  validateSandy,
  createSandyResult,
  settleSandies,
  countSandies,
  getHoleSandies,
  getSuccessfulSandies,
  holeSandyMade,
} from '@/lib/bets/sideBets/sandy'
import type { SandyResult, SideBetConfig } from '@/lib/bets/sideBets/types'

describe('recordSandy', () => {
  it('records a successful sandy with par', () => {
    const result = recordSandy(5, 'player1', true, 4, 4)
    expect(result.holeNumber).toBe(5)
    expect(result.playerId).toBe('player1')
    expect(result.success).toBe(true)
    expect(result.scoreRelativeToPar).toBe(0)
  })

  it('records a successful sandy with birdie', () => {
    const result = recordSandy(5, 'player1', true, 4, 3)
    expect(result.success).toBe(true)
    expect(result.scoreRelativeToPar).toBe(-1)
  })

  it('invalidates sandy claim if score over par', () => {
    const result = recordSandy(5, 'player1', true, 4, 5)
    expect(result.success).toBe(false)
    expect(result.scoreRelativeToPar).toBe(1)
  })

  it('records no sandy when not claimed', () => {
    const result = recordSandy(5, 'player1', false, 4, 4)
    expect(result.success).toBe(false)
  })
})

describe('validateSandy', () => {
  it('validates sandy with par', () => {
    expect(validateSandy(true, 4, 4)).toBe(true)
  })

  it('validates sandy with birdie', () => {
    expect(validateSandy(true, 4, 3)).toBe(true)
  })

  it('invalidates sandy with bogey', () => {
    expect(validateSandy(true, 4, 5)).toBe(false)
  })

  it('invalidates when not claimed', () => {
    expect(validateSandy(false, 4, 4)).toBe(false)
  })
})

describe('createSandyResult', () => {
  it('creates a sandy result', () => {
    const result = createSandyResult(10, 'player1', true)
    expect(result.holeNumber).toBe(10)
    expect(result.playerId).toBe('player1')
    expect(result.success).toBe(true)
    expect(result.scoreRelativeToPar).toBe(0)
  })
})

describe('settleSandies', () => {
  const config: SideBetConfig = { type: 'sandy', amount: 5, enabled: true }

  it('settles correctly in 2-player match', () => {
    const results: SandyResult[] = [
      { holeNumber: 1, playerId: 'A', success: true, scoreRelativeToPar: 0 },
      { holeNumber: 5, playerId: 'B', success: true, scoreRelativeToPar: -1 },
      { holeNumber: 10, playerId: 'A', success: true, scoreRelativeToPar: 0 },
    ]
    const payouts = settleSandies(results, config, ['A', 'B'])

    // A: 2 sandies * $5 * 1 opponent = +$10
    // B: 1 sandy * $5 * 1 opponent = +$5
    // Net: A +$10 - $5 = +$5, B +$5 - $10 = -$5
    expect(payouts.get('A')).toBe(5)
    expect(payouts.get('B')).toBe(-5)
  })

  it('only counts successful sandies', () => {
    const results: SandyResult[] = [
      { holeNumber: 1, playerId: 'A', success: true, scoreRelativeToPar: 0 },
      { holeNumber: 5, playerId: 'A', success: false, scoreRelativeToPar: 1 },
    ]
    const payouts = settleSandies(results, config, ['A', 'B'])

    // Only 1 successful sandy
    expect(payouts.get('A')).toBe(5)
    expect(payouts.get('B')).toBe(-5)
  })

  it('handles no sandies', () => {
    const results: SandyResult[] = []
    const payouts = settleSandies(results, config, ['A', 'B'])

    expect(payouts.get('A')).toBe(0)
    expect(payouts.get('B')).toBe(0)
  })

  it('settles correctly in 4-player match', () => {
    const results: SandyResult[] = [
      { holeNumber: 1, playerId: 'A', success: true, scoreRelativeToPar: 0 },
    ]
    const payouts = settleSandies(results, config, ['A', 'B', 'C', 'D'])

    // A wins from 3 opponents: +$15
    expect(payouts.get('A')).toBe(15)
    expect(payouts.get('B')).toBe(-5)
    expect(payouts.get('C')).toBe(-5)
    expect(payouts.get('D')).toBe(-5)
  })
})

describe('countSandies', () => {
  it('counts sandies for a player', () => {
    const results: SandyResult[] = [
      { holeNumber: 1, playerId: 'A', success: true, scoreRelativeToPar: 0 },
      { holeNumber: 5, playerId: 'A', success: false, scoreRelativeToPar: 1 },
      { holeNumber: 10, playerId: 'A', success: true, scoreRelativeToPar: 0 },
      { holeNumber: 15, playerId: 'B', success: true, scoreRelativeToPar: 0 },
    ]
    expect(countSandies(results, 'A')).toBe(2)
    expect(countSandies(results, 'B')).toBe(1)
  })
})

describe('getHoleSandies', () => {
  it('returns sandies for a specific hole', () => {
    const results: SandyResult[] = [
      { holeNumber: 1, playerId: 'A', success: true, scoreRelativeToPar: 0 },
      { holeNumber: 1, playerId: 'B', success: false, scoreRelativeToPar: 1 },
      { holeNumber: 5, playerId: 'A', success: true, scoreRelativeToPar: 0 },
    ]
    const hole1Sandies = getHoleSandies(results, 1)
    expect(hole1Sandies).toHaveLength(2)
  })
})

describe('getSuccessfulSandies', () => {
  it('returns only successful sandies', () => {
    const results: SandyResult[] = [
      { holeNumber: 1, playerId: 'A', success: true, scoreRelativeToPar: 0 },
      { holeNumber: 5, playerId: 'A', success: false, scoreRelativeToPar: 1 },
      { holeNumber: 10, playerId: 'B', success: true, scoreRelativeToPar: 0 },
    ]
    const successful = getSuccessfulSandies(results)
    expect(successful).toHaveLength(2)
    expect(successful.every((s) => s.success)).toBe(true)
  })
})

describe('holeSandyMade', () => {
  it('returns true if any player made a sandy on the hole', () => {
    const results: SandyResult[] = [
      { holeNumber: 1, playerId: 'A', success: false, scoreRelativeToPar: 1 },
      { holeNumber: 1, playerId: 'B', success: true, scoreRelativeToPar: 0 },
    ]
    expect(holeSandyMade(results, 1)).toBe(true)
  })

  it('returns false if no one made a sandy on the hole', () => {
    const results: SandyResult[] = [
      { holeNumber: 1, playerId: 'A', success: false, scoreRelativeToPar: 1 },
      { holeNumber: 1, playerId: 'B', success: false, scoreRelativeToPar: 2 },
    ]
    expect(holeSandyMade(results, 1)).toBe(false)
  })
})
