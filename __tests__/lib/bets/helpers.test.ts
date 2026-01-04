import {
  createNassauBetData,
  createSkinsBetData,
  NASSAU_PRESETS,
  SKINS_PRESETS,
  estimateNassauTotal,
  estimateSkinsTotal,
} from '@/lib/bets/helpers'
import type { NassauConfig, SkinsConfig } from '@/types'

describe('createNassauBetData', () => {
  it('creates Nassau config with default settings', () => {
    const config = createNassauBetData(5)

    expect(config).toEqual({
      frontAmount: 5,
      backAmount: 5,
      overallAmount: 5,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 3,
    })
  })

  it('applies overrides correctly', () => {
    const config = createNassauBetData(10, {
      autoPress: false,
      pressTrigger: 3,
      maxPresses: 5,
    })

    expect(config.frontAmount).toBe(10)
    expect(config.autoPress).toBe(false)
    expect(config.pressTrigger).toBe(3)
    expect(config.maxPresses).toBe(5)
  })

  it('handles decimal amounts', () => {
    const config = createNassauBetData(0.25)

    expect(config.frontAmount).toBe(0.25)
    expect(config.backAmount).toBe(0.25)
    expect(config.overallAmount).toBe(0.25)
  })

  it('applies partial overrides without affecting other defaults', () => {
    const config = createNassauBetData(5, { maxPresses: 10 })

    expect(config.autoPress).toBe(true) // Default preserved
    expect(config.pressTrigger).toBe(2) // Default preserved
    expect(config.maxPresses).toBe(10) // Override applied
  })
})

describe('createSkinsBetData', () => {
  it('creates Skins config with default settings', () => {
    const config = createSkinsBetData(1)

    expect(config).toEqual({
      skinValue: 1,
      carryover: true,
      validation: true,
    })
  })

  it('applies overrides correctly', () => {
    const config = createSkinsBetData(2, {
      carryover: false,
      validation: false,
    })

    expect(config.skinValue).toBe(2)
    expect(config.carryover).toBe(false)
    expect(config.validation).toBe(false)
  })

  it('handles decimal amounts', () => {
    const config = createSkinsBetData(0.5)

    expect(config.skinValue).toBe(0.5)
  })
})

describe('NASSAU_PRESETS', () => {
  it('creates quarter preset correctly', () => {
    const config = NASSAU_PRESETS.quarter()

    expect(config.frontAmount).toBe(0.25)
    expect(config.backAmount).toBe(0.25)
    expect(config.overallAmount).toBe(0.25)
  })

  it('creates half preset correctly', () => {
    const config = NASSAU_PRESETS.half()

    expect(config.frontAmount).toBe(0.5)
    expect(config.backAmount).toBe(0.5)
    expect(config.overallAmount).toBe(0.5)
  })

  it('creates dollar preset correctly', () => {
    const config = NASSAU_PRESETS.dollar()

    expect(config.frontAmount).toBe(1)
    expect(config.backAmount).toBe(1)
    expect(config.overallAmount).toBe(1)
  })

  it('creates fiveDollar preset correctly', () => {
    const config = NASSAU_PRESETS.fiveDollar()

    expect(config.frontAmount).toBe(5)
    expect(config.backAmount).toBe(5)
    expect(config.overallAmount).toBe(5)
  })

  it('creates tenDollar preset correctly', () => {
    const config = NASSAU_PRESETS.tenDollar()

    expect(config.frontAmount).toBe(10)
    expect(config.backAmount).toBe(10)
    expect(config.overallAmount).toBe(10)
  })

  it('accepts overrides in presets', () => {
    const config = NASSAU_PRESETS.fiveDollar({ autoPress: false })

    expect(config.frontAmount).toBe(5)
    expect(config.autoPress).toBe(false)
  })
})

describe('SKINS_PRESETS', () => {
  it('creates quarter preset correctly', () => {
    const config = SKINS_PRESETS.quarter()

    expect(config.skinValue).toBe(0.25)
    expect(config.carryover).toBe(true)
  })

  it('creates half preset correctly', () => {
    const config = SKINS_PRESETS.half()

    expect(config.skinValue).toBe(0.5)
  })

  it('creates dollar preset correctly', () => {
    const config = SKINS_PRESETS.dollar()

    expect(config.skinValue).toBe(1)
  })

  it('creates fiveDollar preset correctly', () => {
    const config = SKINS_PRESETS.fiveDollar()

    expect(config.skinValue).toBe(5)
  })

  it('creates tenDollar preset correctly', () => {
    const config = SKINS_PRESETS.tenDollar()

    expect(config.skinValue).toBe(10)
  })

  it('accepts overrides in presets', () => {
    const config = SKINS_PRESETS.dollar({ carryover: false })

    expect(config.skinValue).toBe(1)
    expect(config.carryover).toBe(false)
  })
})

describe('estimateNassauTotal', () => {
  it('calculates total for 2 participants', () => {
    const config: NassauConfig = {
      frontAmount: 5,
      backAmount: 5,
      overallAmount: 5,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 3,
    }

    // Total per match = (5 + 5 + 5) = 15, times (2-1) opponents = 15
    const total = estimateNassauTotal(config, 2)
    expect(total).toBe(15)
  })

  it('calculates total for 4 participants', () => {
    const config: NassauConfig = {
      frontAmount: 5,
      backAmount: 5,
      overallAmount: 5,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 3,
    }

    // Total per match = 15, times (4-1) = 45
    const total = estimateNassauTotal(config, 4)
    expect(total).toBe(45)
  })

  it('handles different amounts for front/back/overall', () => {
    const config: NassauConfig = {
      frontAmount: 5,
      backAmount: 10,
      overallAmount: 15,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 3,
    }

    // Total = (5 + 10 + 15) = 30, times (2-1) = 30
    const total = estimateNassauTotal(config, 2)
    expect(total).toBe(30)
  })

  it('handles single participant (solo practice)', () => {
    const config: NassauConfig = {
      frontAmount: 5,
      backAmount: 5,
      overallAmount: 5,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 3,
    }

    // (1-1) = 0 opponents
    const total = estimateNassauTotal(config, 1)
    expect(total).toBe(0)
  })
})

describe('estimateSkinsTotal', () => {
  it('calculates total for 18 holes with 2 participants', () => {
    const config: SkinsConfig = {
      skinValue: 1,
      carryover: true,
      validation: true,
    }

    // 1 * 18 * (2-1) = 18
    const total = estimateSkinsTotal(config, 2, 18)
    expect(total).toBe(18)
  })

  it('calculates total for 9 holes with 4 participants', () => {
    const config: SkinsConfig = {
      skinValue: 2,
      carryover: true,
      validation: true,
    }

    // 2 * 9 * (4-1) = 54
    const total = estimateSkinsTotal(config, 4, 9)
    expect(total).toBe(54)
  })

  it('handles decimal skin values', () => {
    const config: SkinsConfig = {
      skinValue: 0.5,
      carryover: true,
      validation: true,
    }

    // 0.5 * 18 * (2-1) = 9
    const total = estimateSkinsTotal(config, 2, 18)
    expect(total).toBe(9)
  })

  it('handles single participant', () => {
    const config: SkinsConfig = {
      skinValue: 5,
      carryover: true,
      validation: true,
    }

    // 5 * 18 * (1-1) = 0
    const total = estimateSkinsTotal(config, 1, 18)
    expect(total).toBe(0)
  })
})
