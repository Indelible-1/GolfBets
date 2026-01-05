import {
  settleAllSideBets,
  getDetailedSettlement,
  createDefaultSideBetConfigs,
  hasSideBetsEnabled,
  getEnabledSideBets,
  validateZeroSum,
} from '@/lib/bets/sideBets/settlement'
import type { HoleSideBets, SideBetConfig } from '@/lib/bets/sideBets/types'

describe('settleAllSideBets', () => {
  const coursePars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5]
  const participants = ['A', 'B']

  it('settles greenies only', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: true },
      { type: 'sandy', amount: 5, enabled: false },
      { type: 'bingo_bango_bongo', amount: 1, enabled: false },
    ]
    const sideBetResults: Record<number, HoleSideBets> = {
      3: { holeNumber: 3, greenie: 'A' },
      7: { holeNumber: 7, greenie: 'B' },
    }

    const payouts = settleAllSideBets(sideBetResults, configs, participants, coursePars)

    // Each wins one greenie, net zero
    expect(payouts.get('A')).toBe(0)
    expect(payouts.get('B')).toBe(0)
  })

  it('settles sandies only', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: false },
      { type: 'sandy', amount: 5, enabled: true },
      { type: 'bingo_bango_bongo', amount: 1, enabled: false },
    ]
    const sideBetResults: Record<number, HoleSideBets> = {
      5: { holeNumber: 5, sandy: { A: true, B: false } },
    }

    const payouts = settleAllSideBets(sideBetResults, configs, participants, coursePars)

    expect(payouts.get('A')).toBe(5)
    expect(payouts.get('B')).toBe(-5)
  })

  it('settles BBB only', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: false },
      { type: 'sandy', amount: 5, enabled: false },
      { type: 'bingo_bango_bongo', amount: 1, enabled: true },
    ]
    const sideBetResults: Record<number, HoleSideBets> = {
      1: { holeNumber: 1, bingo: 'A', bango: 'A', bongo: 'A' },
    }

    const payouts = settleAllSideBets(sideBetResults, configs, participants, coursePars)

    expect(payouts.get('A')).toBe(3)
    expect(payouts.get('B')).toBe(-3)
  })

  it('settles all side bets combined', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: true },
      { type: 'sandy', amount: 5, enabled: true },
      { type: 'bingo_bango_bongo', amount: 1, enabled: true },
    ]
    const sideBetResults: Record<number, HoleSideBets> = {
      3: { holeNumber: 3, greenie: 'A' }, // Greenie to A
      5: { holeNumber: 5, sandy: { A: true } }, // Sandy to A
      1: { holeNumber: 1, bingo: 'B', bango: 'B', bongo: 'B' }, // BBB all to B
    }

    const payouts = settleAllSideBets(sideBetResults, configs, participants, coursePars)

    // A: +5 (greenie) + 5 (sandy) - 3 (BBB) = +7
    // B: -5 (greenie) - 5 (sandy) + 3 (BBB) = -7
    expect(payouts.get('A')).toBe(7)
    expect(payouts.get('B')).toBe(-7)
  })

  it('skips disabled bets', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: false },
    ]
    const sideBetResults: Record<number, HoleSideBets> = {
      3: { holeNumber: 3, greenie: 'A' },
    }

    const payouts = settleAllSideBets(sideBetResults, configs, participants, coursePars)

    expect(payouts.get('A')).toBe(0)
    expect(payouts.get('B')).toBe(0)
  })

  it('handles empty results', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: true },
    ]
    const sideBetResults: Record<number, HoleSideBets> = {}

    const payouts = settleAllSideBets(sideBetResults, configs, participants, coursePars)

    expect(payouts.get('A')).toBe(0)
    expect(payouts.get('B')).toBe(0)
  })
})

describe('getDetailedSettlement', () => {
  const coursePars = [4, 4, 3, 5, 4, 4, 3, 4, 5]
  const participants = ['A', 'B']

  it('returns detailed breakdown for each bet type', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: true },
      { type: 'sandy', amount: 5, enabled: true },
    ]
    const sideBetResults: Record<number, HoleSideBets> = {
      3: { holeNumber: 3, greenie: 'A' },
      5: { holeNumber: 5, sandy: { A: true } },
    }

    const settlements = getDetailedSettlement(sideBetResults, configs, participants, coursePars)

    expect(settlements).toHaveLength(2)
    expect(settlements[0].type).toBe('greenie')
    expect(settlements[1].type).toBe('sandy')
  })

  it('includes player wins and amounts', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: true },
    ]
    const sideBetResults: Record<number, HoleSideBets> = {
      3: { holeNumber: 3, greenie: 'A' },
      7: { holeNumber: 7, greenie: 'A' },
    }

    const settlements = getDetailedSettlement(sideBetResults, configs, participants, coursePars)

    const greenieSettlement = settlements.find(s => s.type === 'greenie')!
    const playerAResult = greenieSettlement.results.find(r => r.playerId === 'A')!

    expect(playerAResult.wins).toBe(2)
    expect(playerAResult.amount).toBe(10)
  })
})

describe('createDefaultSideBetConfigs', () => {
  it('creates default configs with specified amount', () => {
    const configs = createDefaultSideBetConfigs(2)

    expect(configs).toHaveLength(3)
    expect(configs.every(c => c.amount === 2)).toBe(true)
    expect(configs.every(c => c.enabled === false)).toBe(true)
  })

  it('creates default configs with default amount', () => {
    const configs = createDefaultSideBetConfigs()

    expect(configs.every(c => c.amount === 1)).toBe(true)
  })
})

describe('hasSideBetsEnabled', () => {
  it('returns true when any side bet is enabled', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: true },
      { type: 'sandy', amount: 5, enabled: false },
    ]
    expect(hasSideBetsEnabled(configs)).toBe(true)
  })

  it('returns false when all side bets are disabled', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: false },
      { type: 'sandy', amount: 5, enabled: false },
    ]
    expect(hasSideBetsEnabled(configs)).toBe(false)
  })

  it('returns false for empty configs', () => {
    expect(hasSideBetsEnabled([])).toBe(false)
  })
})

describe('getEnabledSideBets', () => {
  it('returns list of enabled bet types', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: true },
      { type: 'sandy', amount: 5, enabled: false },
      { type: 'bingo_bango_bongo', amount: 1, enabled: true },
    ]
    const enabled = getEnabledSideBets(configs)

    expect(enabled).toEqual(['greenie', 'bingo_bango_bongo'])
  })

  it('returns empty array when none enabled', () => {
    const configs: SideBetConfig[] = [
      { type: 'greenie', amount: 5, enabled: false },
    ]
    expect(getEnabledSideBets(configs)).toEqual([])
  })
})

describe('validateZeroSum', () => {
  it('returns true for zero-sum payouts', () => {
    const payouts = new Map([
      ['A', 10],
      ['B', -5],
      ['C', -5],
    ])
    expect(validateZeroSum(payouts)).toBe(true)
  })

  it('returns false for non-zero-sum payouts', () => {
    const payouts = new Map([
      ['A', 10],
      ['B', -5],
    ])
    expect(validateZeroSum(payouts)).toBe(false)
  })

  it('handles floating point errors', () => {
    const payouts = new Map([
      ['A', 0.1 + 0.2], // 0.30000000000000004
      ['B', -0.3],
    ])
    expect(validateZeroSum(payouts)).toBe(true)
  })

  it('returns true for empty payouts', () => {
    expect(validateZeroSum(new Map())).toBe(true)
  })
})
