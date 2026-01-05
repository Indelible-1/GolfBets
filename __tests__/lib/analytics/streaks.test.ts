import {
  computeStreaks,
  getCurrentStreak,
  isHotStreak,
  getStreakLabel,
  computeStreakFromNets,
} from '@/lib/analytics/streaks'
import type { MatchResult, Streak } from '@/lib/analytics/types'

function createMatchResult(net: number, daysAgo: number = 0): MatchResult {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return {
    matchId: `match_${Math.random().toString(36).substr(2, 9)}`,
    date,
    net,
    games: ['nassau'],
    opponentIds: ['opponent1'],
  }
}

describe('computeStreaks', () => {
  it('returns empty streak for no results', () => {
    const { currentStreak, longestWin, longestLoss } = computeStreaks([])

    expect(currentStreak.type).toBe('none')
    expect(currentStreak.count).toBe(0)
    expect(longestWin).toBe(0)
    expect(longestLoss).toBe(0)
  })

  it('tracks current win streak correctly', () => {
    const results = [
      createMatchResult(-10, 4), // loss
      createMatchResult(10, 3), // win
      createMatchResult(15, 2), // win
      createMatchResult(5, 1), // win
    ]

    const { currentStreak, longestWin } = computeStreaks(results)

    expect(currentStreak.type).toBe('win')
    expect(currentStreak.count).toBe(3)
    expect(longestWin).toBe(3)
  })

  it('tracks current loss streak correctly', () => {
    const results = [
      createMatchResult(10, 4), // win
      createMatchResult(-10, 3), // loss
      createMatchResult(-15, 2), // loss
      createMatchResult(-5, 1), // loss
    ]

    const { currentStreak, longestLoss } = computeStreaks(results)

    expect(currentStreak.type).toBe('loss')
    expect(currentStreak.count).toBe(3)
    expect(longestLoss).toBe(3)
  })

  it('pushes break longest streak counter but not current streak', () => {
    const results = [
      createMatchResult(10, 4), // win
      createMatchResult(10, 3), // win
      createMatchResult(0, 2), // push
      createMatchResult(10, 1), // win
    ]

    const { currentStreak, longestWin } = computeStreaks(results)

    // Current streak skips pushes (momentum continues)
    expect(currentStreak.type).toBe('win')
    expect(currentStreak.count).toBe(3) // All three wins, push skipped

    // Longest streak is broken by push
    expect(longestWin).toBe(2) // First two wins (push breaks the counter)
  })

  it('skips pushes when calculating current streak', () => {
    const results = [
      createMatchResult(10, 4), // win
      createMatchResult(10, 3), // win
      createMatchResult(0, 2), // push (skipped)
      createMatchResult(0, 1), // push (skipped)
    ]

    const { currentStreak } = computeStreaks(results)

    // Current streak looks back, skips pushes, finds wins
    expect(currentStreak.type).toBe('win')
    expect(currentStreak.count).toBe(2)
  })

  it('tracks longest win streak through history', () => {
    const results = [
      createMatchResult(10, 10), // win
      createMatchResult(10, 9), // win
      createMatchResult(10, 8), // win
      createMatchResult(10, 7), // win (4 win streak)
      createMatchResult(-10, 6), // loss (breaks streak)
      createMatchResult(10, 5), // win
      createMatchResult(10, 4), // win (2 win streak)
      createMatchResult(-10, 3), // loss
    ]

    const { longestWin, longestLoss } = computeStreaks(results)

    expect(longestWin).toBe(4)
    expect(longestLoss).toBe(1)
  })

  it('handles single result', () => {
    const results = [createMatchResult(10, 1)]

    const { currentStreak, longestWin } = computeStreaks(results)

    expect(currentStreak.type).toBe('win')
    expect(currentStreak.count).toBe(1)
    expect(longestWin).toBe(1)
  })
})

describe('getCurrentStreak', () => {
  it('returns none for empty results', () => {
    const streak = getCurrentStreak([])

    expect(streak.type).toBe('none')
    expect(streak.count).toBe(0)
    expect(streak.startDate).toBeNull()
  })

  it('gets win streak from end of results', () => {
    const results = [
      createMatchResult(-10, 3), // loss
      createMatchResult(10, 2), // win
      createMatchResult(10, 1), // win
    ]

    const streak = getCurrentStreak(results)

    expect(streak.type).toBe('win')
    expect(streak.count).toBe(2)
    expect(streak.startDate).not.toBeNull()
  })

  it('gets loss streak from end of results', () => {
    const results = [
      createMatchResult(10, 3), // win
      createMatchResult(-10, 2), // loss
      createMatchResult(-10, 1), // loss
    ]

    const streak = getCurrentStreak(results)

    expect(streak.type).toBe('loss')
    expect(streak.count).toBe(2)
  })

  it('stops at opposite result type', () => {
    const results = [
      createMatchResult(-10, 4), // loss
      createMatchResult(-10, 3), // loss
      createMatchResult(10, 2), // win (breaks loss streak)
      createMatchResult(10, 1), // win
    ]

    const streak = getCurrentStreak(results)

    expect(streak.type).toBe('win')
    expect(streak.count).toBe(2)
  })
})

describe('isHotStreak', () => {
  it('returns false for no streak', () => {
    const streak: Streak = { type: 'none', count: 0, startDate: null }
    expect(isHotStreak(streak)).toBe(false)
  })

  it('returns false for short streaks', () => {
    expect(isHotStreak({ type: 'win', count: 1, startDate: new Date() })).toBe(false)
    expect(isHotStreak({ type: 'win', count: 2, startDate: new Date() })).toBe(false)
    expect(isHotStreak({ type: 'loss', count: 2, startDate: new Date() })).toBe(false)
  })

  it('returns true for 3+ win streaks', () => {
    expect(isHotStreak({ type: 'win', count: 3, startDate: new Date() })).toBe(true)
    expect(isHotStreak({ type: 'win', count: 10, startDate: new Date() })).toBe(true)
  })

  it('returns true for 3+ loss streaks', () => {
    expect(isHotStreak({ type: 'loss', count: 3, startDate: new Date() })).toBe(true)
    expect(isHotStreak({ type: 'loss', count: 5, startDate: new Date() })).toBe(true)
  })
})

describe('getStreakLabel', () => {
  it('returns "No streak" for no streak', () => {
    expect(getStreakLabel({ type: 'none', count: 0, startDate: null })).toBe('No streak')
  })

  it('returns "No streak" for zero count', () => {
    expect(getStreakLabel({ type: 'win', count: 0, startDate: null })).toBe('No streak')
  })

  it('formats win streak correctly', () => {
    expect(getStreakLabel({ type: 'win', count: 3, startDate: new Date() })).toBe('🔥 3W')
    expect(getStreakLabel({ type: 'win', count: 10, startDate: new Date() })).toBe('🔥 10W')
  })

  it('formats loss streak correctly', () => {
    expect(getStreakLabel({ type: 'loss', count: 2, startDate: new Date() })).toBe('❄️ 2L')
    expect(getStreakLabel({ type: 'loss', count: 5, startDate: new Date() })).toBe('❄️ 5L')
  })
})

describe('computeStreakFromNets', () => {
  it('returns none for empty array', () => {
    const streak = computeStreakFromNets([])

    expect(streak.type).toBe('none')
    expect(streak.count).toBe(0)
  })

  it('computes win streak from net values', () => {
    const nets = [-10, 10, 15, 20] // L, W, W, W

    const streak = computeStreakFromNets(nets)

    expect(streak.type).toBe('win')
    expect(streak.count).toBe(3)
  })

  it('computes loss streak from net values', () => {
    const nets = [10, -10, -15, -20] // W, L, L, L

    const streak = computeStreakFromNets(nets)

    expect(streak.type).toBe('loss')
    expect(streak.count).toBe(3)
  })

  it('skips zeros (pushes)', () => {
    const nets = [10, 10, 0, 0] // W, W, P, P

    const streak = computeStreakFromNets(nets)

    expect(streak.type).toBe('win')
    expect(streak.count).toBe(2)
  })

  it('handles all pushes', () => {
    const nets = [0, 0, 0]

    const streak = computeStreakFromNets(nets)

    expect(streak.type).toBe('none')
    expect(streak.count).toBe(0)
  })
})
