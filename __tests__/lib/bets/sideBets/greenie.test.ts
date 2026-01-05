import {
  isGreenieEligible,
  determineGreenieWinner,
  createGreenieResult,
  settleGreenies,
  getPar3Holes,
  countGreenies,
  getTotalGreenies,
} from '@/lib/bets/sideBets/greenie'
import type { GreenieResult, SideBetConfig } from '@/lib/bets/sideBets/types'

describe('isGreenieEligible', () => {
  it('returns true for par 3', () => {
    expect(isGreenieEligible(3)).toBe(true)
  })

  it('returns false for par 4', () => {
    expect(isGreenieEligible(4)).toBe(false)
  })

  it('returns false for par 5', () => {
    expect(isGreenieEligible(5)).toBe(false)
  })
})

describe('determineGreenieWinner', () => {
  it('returns null winner for non-par-3 holes', () => {
    const result = determineGreenieWinner(1, 4)
    expect(result.winnerId).toBeNull()
  })

  it('returns null winner for par 3 without proximity data', () => {
    const result = determineGreenieWinner(3, 3)
    expect(result.winnerId).toBeNull()
    expect(result.par).toBe(3)
    expect(result.holeNumber).toBe(3)
  })

  it('returns closest player as winner with proximity data', () => {
    const proximities = new Map([
      ['player1', 10],
      ['player2', 5],
      ['player3', 15],
    ])
    const result = determineGreenieWinner(3, 3, proximities)
    expect(result.winnerId).toBe('player2')
  })

  it('returns null winner on tie', () => {
    const proximities = new Map([
      ['player1', 10],
      ['player2', 10],
    ])
    const result = determineGreenieWinner(3, 3, proximities)
    expect(result.winnerId).toBeNull()
  })

  it('returns null winner when no one hits the green', () => {
    const proximities = new Map<string, number>()
    const result = determineGreenieWinner(3, 3, proximities)
    expect(result.winnerId).toBeNull()
  })
})

describe('createGreenieResult', () => {
  it('creates a greenie result with winner', () => {
    const result = createGreenieResult(7, 'player1')
    expect(result.holeNumber).toBe(7)
    expect(result.winnerId).toBe('player1')
    expect(result.par).toBe(3)
  })

  it('creates a greenie result without winner', () => {
    const result = createGreenieResult(12, null)
    expect(result.holeNumber).toBe(12)
    expect(result.winnerId).toBeNull()
  })
})

describe('settleGreenies', () => {
  const config: SideBetConfig = { type: 'greenie', amount: 5, enabled: true }

  it('settles correctly in 2-player match', () => {
    const results: GreenieResult[] = [
      { holeNumber: 3, winnerId: 'A', par: 3 },
      { holeNumber: 7, winnerId: 'B', par: 3 },
      { holeNumber: 12, winnerId: 'A', par: 3 },
    ]
    const payouts = settleGreenies(results, config, ['A', 'B'])

    // A wins 2, B wins 1
    // A: +2*5 - 1*5 = +5
    // B: -2*5 + 1*5 = -5
    expect(payouts.get('A')).toBe(5)
    expect(payouts.get('B')).toBe(-5)
  })

  it('settles correctly in 4-player match', () => {
    const results: GreenieResult[] = [
      { holeNumber: 3, winnerId: 'A', par: 3 },
    ]
    const payouts = settleGreenies(results, config, ['A', 'B', 'C', 'D'])

    // A wins 1 greenie from 3 players: +15
    // B, C, D each pay $5: -5 each
    expect(payouts.get('A')).toBe(15)
    expect(payouts.get('B')).toBe(-5)
    expect(payouts.get('C')).toBe(-5)
    expect(payouts.get('D')).toBe(-5)
  })

  it('handles no greenies won', () => {
    const results: GreenieResult[] = [
      { holeNumber: 3, winnerId: null, par: 3 },
      { holeNumber: 7, winnerId: null, par: 3 },
    ]
    const payouts = settleGreenies(results, config, ['A', 'B'])

    expect(payouts.get('A')).toBe(0)
    expect(payouts.get('B')).toBe(0)
  })

  it('handles single player (no payout)', () => {
    const results: GreenieResult[] = [
      { holeNumber: 3, winnerId: 'A', par: 3 },
    ]
    const payouts = settleGreenies(results, config, ['A'])

    expect(payouts.get('A')).toBe(0)
  })

  it('handles decimal amounts', () => {
    const decimalConfig: SideBetConfig = { type: 'greenie', amount: 0.5, enabled: true }
    const results: GreenieResult[] = [
      { holeNumber: 3, winnerId: 'A', par: 3 },
    ]
    const payouts = settleGreenies(results, decimalConfig, ['A', 'B'])

    expect(payouts.get('A')).toBe(0.5)
    expect(payouts.get('B')).toBe(-0.5)
  })
})

describe('getPar3Holes', () => {
  it('identifies par 3 holes correctly', () => {
    const pars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5]
    const par3s = getPar3Holes(pars)
    expect(par3s).toEqual([3, 7, 12, 16])
  })

  it('returns empty array when no par 3s', () => {
    const pars = [4, 4, 4, 5, 4, 4, 4, 4, 5]
    const par3s = getPar3Holes(pars)
    expect(par3s).toEqual([])
  })
})

describe('countGreenies', () => {
  it('counts greenies for a player', () => {
    const results: GreenieResult[] = [
      { holeNumber: 3, winnerId: 'A', par: 3 },
      { holeNumber: 7, winnerId: 'B', par: 3 },
      { holeNumber: 12, winnerId: 'A', par: 3 },
      { holeNumber: 16, winnerId: null, par: 3 },
    ]
    expect(countGreenies(results, 'A')).toBe(2)
    expect(countGreenies(results, 'B')).toBe(1)
    expect(countGreenies(results, 'C')).toBe(0)
  })
})

describe('getTotalGreenies', () => {
  it('counts total par 3s in course', () => {
    const pars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5]
    expect(getTotalGreenies(pars)).toBe(4)
  })
})
