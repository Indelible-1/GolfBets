import {
  getSeasonDates,
  isSeasonActive,
  getSeasonProgress,
} from '@/lib/social/seasons'
import type { Season } from '@/types'

function createSeason(overrides: Partial<Season> = {}): Season {
  const now = new Date()
  const { start, end, name } = getSeasonDates('monthly', now)
  return {
    id: 'season1',
    groupId: 'group1',
    name,
    period: 'monthly',
    startDate: start,
    endDate: end,
    status: 'active',
    standings: [],
    ...overrides,
  }
}

describe('getSeasonDates', () => {
  describe('monthly', () => {
    it('returns first and last day of month', () => {
      const refDate = new Date('2024-06-15')
      const { start, end, name } = getSeasonDates('monthly', refDate)

      expect(start.getFullYear()).toBe(2024)
      expect(start.getMonth()).toBe(5) // June (0-indexed)
      expect(start.getDate()).toBe(1)

      expect(end.getFullYear()).toBe(2024)
      expect(end.getMonth()).toBe(5)
      expect(end.getDate()).toBe(30) // June has 30 days

      expect(name).toBe('June 2024')
    })

    it('handles December correctly', () => {
      const refDate = new Date('2024-12-15')
      const { start, end, name } = getSeasonDates('monthly', refDate)

      expect(start.getMonth()).toBe(11) // December
      expect(end.getDate()).toBe(31)
      expect(name).toBe('December 2024')
    })

    it('handles February in leap year', () => {
      const refDate = new Date('2024-02-15') // 2024 is a leap year
      const { start, end } = getSeasonDates('monthly', refDate)

      expect(start.getDate()).toBe(1)
      expect(end.getDate()).toBe(29) // Leap year February
    })

    it('handles February in non-leap year', () => {
      const refDate = new Date('2023-02-15')
      const { end } = getSeasonDates('monthly', refDate)

      expect(end.getDate()).toBe(28)
    })
  })

  describe('quarterly', () => {
    it('returns Q1 dates for January', () => {
      const refDate = new Date('2024-01-15')
      const { start, end, name } = getSeasonDates('quarterly', refDate)

      expect(start.getMonth()).toBe(0) // January
      expect(start.getDate()).toBe(1)
      expect(end.getMonth()).toBe(2) // March
      expect(end.getDate()).toBe(31)
      expect(name).toBe('Q1 2024')
    })

    it('returns Q2 dates for May', () => {
      const refDate = new Date('2024-05-15')
      const { start, end, name } = getSeasonDates('quarterly', refDate)

      expect(start.getMonth()).toBe(3) // April
      expect(end.getMonth()).toBe(5) // June
      expect(name).toBe('Q2 2024')
    })

    it('returns Q3 dates for August', () => {
      const refDate = new Date('2024-08-15')
      const { start, end, name } = getSeasonDates('quarterly', refDate)

      expect(start.getMonth()).toBe(6) // July
      expect(end.getMonth()).toBe(8) // September
      expect(name).toBe('Q3 2024')
    })

    it('returns Q4 dates for November', () => {
      const refDate = new Date('2024-11-15')
      const { start, end, name } = getSeasonDates('quarterly', refDate)

      expect(start.getMonth()).toBe(9) // October
      expect(end.getMonth()).toBe(11) // December
      expect(name).toBe('Q4 2024')
    })
  })

  describe('yearly', () => {
    it('returns full year dates', () => {
      const refDate = new Date('2024-06-15')
      const { start, end, name } = getSeasonDates('yearly', refDate)

      expect(start.getMonth()).toBe(0)
      expect(start.getDate()).toBe(1)
      expect(end.getMonth()).toBe(11)
      expect(end.getDate()).toBe(31)
      expect(name).toBe('2024')
    })
  })

  describe('custom', () => {
    it('falls back to monthly behavior', () => {
      const refDate = new Date('2024-06-15')
      const { start, end, name } = getSeasonDates('custom', refDate)

      expect(start.getMonth()).toBe(5)
      expect(end.getMonth()).toBe(5)
      expect(name).toBe('Custom Season')
    })
  })
})

describe('isSeasonActive', () => {
  it('returns true for active season within date range', () => {
    const now = new Date()
    const season = createSeason({
      status: 'active',
      startDate: new Date(now.getTime() - 86400000), // Yesterday
      endDate: new Date(now.getTime() + 86400000), // Tomorrow
    })

    expect(isSeasonActive(season)).toBe(true)
  })

  it('returns false for completed season', () => {
    const now = new Date()
    const season = createSeason({
      status: 'completed',
      startDate: new Date(now.getTime() - 86400000),
      endDate: new Date(now.getTime() + 86400000),
    })

    expect(isSeasonActive(season)).toBe(false)
  })

  it('returns false for active season before start date', () => {
    const now = new Date()
    const season = createSeason({
      status: 'active',
      startDate: new Date(now.getTime() + 86400000), // Tomorrow
      endDate: new Date(now.getTime() + 2 * 86400000), // Day after
    })

    expect(isSeasonActive(season)).toBe(false)
  })

  it('returns false for active season after end date', () => {
    const now = new Date()
    const season = createSeason({
      status: 'active',
      startDate: new Date(now.getTime() - 2 * 86400000), // 2 days ago
      endDate: new Date(now.getTime() - 86400000), // Yesterday
    })

    expect(isSeasonActive(season)).toBe(false)
  })
})

describe('getSeasonProgress', () => {
  it('returns 0 at start of season', () => {
    const now = new Date()
    const season = createSeason({
      startDate: now,
      endDate: new Date(now.getTime() + 30 * 86400000), // 30 days from now
    })

    const progress = getSeasonProgress(season)
    expect(progress).toBeCloseTo(0, 0)
  })

  it('returns 100 at end of season', () => {
    const now = new Date()
    const season = createSeason({
      startDate: new Date(now.getTime() - 30 * 86400000), // 30 days ago
      endDate: now,
    })

    const progress = getSeasonProgress(season)
    expect(progress).toBeCloseTo(100, 0)
  })

  it('returns 50 at midpoint', () => {
    const now = new Date()
    const season = createSeason({
      startDate: new Date(now.getTime() - 15 * 86400000), // 15 days ago
      endDate: new Date(now.getTime() + 15 * 86400000), // 15 days from now
    })

    const progress = getSeasonProgress(season)
    expect(progress).toBeCloseTo(50, 1)
  })

  it('caps at 100 when past end date', () => {
    const now = new Date()
    const season = createSeason({
      startDate: new Date(now.getTime() - 60 * 86400000),
      endDate: new Date(now.getTime() - 30 * 86400000),
    })

    const progress = getSeasonProgress(season)
    expect(progress).toBe(100)
  })

  it('returns 0 when before start date', () => {
    const now = new Date()
    const season = createSeason({
      startDate: new Date(now.getTime() + 30 * 86400000),
      endDate: new Date(now.getTime() + 60 * 86400000),
    })

    const progress = getSeasonProgress(season)
    expect(progress).toBe(0)
  })
})
