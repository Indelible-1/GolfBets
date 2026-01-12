import { computeUserStats, getMatchResult, computeMatchStats } from '@/lib/analytics/userStats'
import type { Match, LedgerEntry, Bet } from '@/types'

const USER_ID = 'user1'
const OPPONENT_ID = 'opponent1'

function createMatch(overrides: Partial<Match> = {}): Match {
  const now = new Date()
  return {
    id: `match_${Math.random().toString(36).substr(2, 9)}`,
    courseName: 'Test Golf Club',
    courseId: null,
    teeTime: now,
    holes: 18,
    status: 'completed',
    currentHole: null,
    createdBy: USER_ID,
    scorerId: USER_ID,
    participantIds: [USER_ID, OPPONENT_ID],
    createdAt: now,
    updatedAt: now,
    startedAt: now,
    completedAt: now,
    version: 1,
    ...overrides,
  }
}

function createLedgerEntry(
  fromUserId: string,
  toUserId: string,
  amount: number,
  overrides: Partial<LedgerEntry> = {}
): LedgerEntry {
  const now = new Date()
  return {
    id: `ledger_${Math.random().toString(36).substr(2, 9)}`,
    fromUserId,
    toUserId,
    amount,
    betType: 'nassau',
    betId: 'bet1',
    description: 'Test bet',
    settled: false,
    settledAt: null,
    settledBy: null,
    createdAt: now,
    calculatedBy: 'system',
    ...overrides,
  }
}

function createBet(type: 'nassau' | 'skins' = 'nassau'): Bet {
  const now = new Date()
  return {
    id: `bet_${Math.random().toString(36).substr(2, 9)}`,
    type,
    unitValue: 5,
    scoringMode: 'net',
    nassauConfig:
      type === 'nassau'
        ? {
            frontAmount: 5,
            backAmount: 5,
            overallAmount: 5,
            autoPress: true,
            pressTrigger: 2,
            maxPresses: 3,
          }
        : null,
    skinsConfig:
      type === 'skins'
        ? {
            skinValue: 1,
            carryover: true,
            validation: true,
          }
        : null,
    createdAt: now,
    createdBy: USER_ID,
  }
}

describe('computeUserStats', () => {
  it('returns empty stats for no matches', () => {
    const stats = computeUserStats([], [], new Map(), USER_ID)

    expect(stats.totalMatches).toBe(0)
    expect(stats.wins).toBe(0)
    expect(stats.losses).toBe(0)
    expect(stats.pushes).toBe(0)
    expect(stats.winRate).toBe(0)
    expect(stats.netLifetime).toBe(0)
    expect(stats.favoriteGame).toBeNull()
  })

  it('returns empty stats for only pending matches', () => {
    const matches = [createMatch({ status: 'pending' })]

    const stats = computeUserStats(matches, [], new Map(), USER_ID)

    expect(stats.totalMatches).toBe(0)
  })

  it('calculates wins correctly', () => {
    const match = createMatch()
    // User wins $10
    const entries = [createLedgerEntry(OPPONENT_ID, USER_ID, 10)]
    const bets = new Map([[match.id, [createBet()]]])

    const stats = computeUserStats([match], entries, bets, USER_ID)

    expect(stats.wins).toBe(1)
    expect(stats.losses).toBe(0)
    expect(stats.winRate).toBe(1)
    expect(stats.totalWon).toBe(10)
    expect(stats.netLifetime).toBe(10)
  })

  it('calculates losses correctly', () => {
    const match = createMatch()
    // User loses $15
    const entries = [createLedgerEntry(USER_ID, OPPONENT_ID, 15)]
    const bets = new Map([[match.id, [createBet()]]])

    const stats = computeUserStats([match], entries, bets, USER_ID)

    expect(stats.wins).toBe(0)
    expect(stats.losses).toBe(1)
    expect(stats.winRate).toBe(0)
    expect(stats.totalLost).toBe(15)
    expect(stats.netLifetime).toBe(-15)
  })

  it('calculates pushes correctly', () => {
    const match = createMatch()
    // No ledger entries = push
    const entries: LedgerEntry[] = []
    const bets = new Map([[match.id, [createBet()]]])

    const stats = computeUserStats([match], entries, bets, USER_ID)

    expect(stats.wins).toBe(0)
    expect(stats.losses).toBe(0)
    expect(stats.pushes).toBe(1)
    expect(stats.winRate).toBe(0) // 0 wins / 0 (wins + losses)
  })

  it('calculates win rate excluding pushes', () => {
    const matches = [
      createMatch({ id: 'match1' }),
      createMatch({ id: 'match2' }),
      createMatch({ id: 'match3' }),
    ]
    // Use a Map to properly associate entries with matches
    const entriesByMatch = new Map<string, LedgerEntry[]>([
      ['match1', [createLedgerEntry(OPPONENT_ID, USER_ID, 10)]], // Win
      ['match2', [createLedgerEntry(USER_ID, OPPONENT_ID, 10)]], // Loss
      ['match3', []], // Push
    ])
    const bets = new Map([
      ['match1', [createBet()]],
      ['match2', [createBet()]],
      ['match3', [createBet()]],
    ])

    const stats = computeUserStats(matches, entriesByMatch, bets, USER_ID)

    expect(stats.wins).toBe(1)
    expect(stats.losses).toBe(1)
    expect(stats.pushes).toBe(1)
    expect(stats.winRate).toBeCloseTo(0.5, 2) // 1 / (1 + 1)
  })

  it('tracks biggest win and loss', () => {
    const matches = [
      createMatch({ id: 'match1' }),
      createMatch({ id: 'match2' }),
      createMatch({ id: 'match3' }),
    ]
    // Use a Map to properly associate entries with matches
    const entriesByMatch = new Map<string, LedgerEntry[]>([
      ['match1', [createLedgerEntry(OPPONENT_ID, USER_ID, 50)]], // Big win
      ['match2', [createLedgerEntry(USER_ID, OPPONENT_ID, 25)]], // Small loss
      ['match3', [createLedgerEntry(OPPONENT_ID, USER_ID, 10)]], // Small win
    ])
    const bets = new Map([
      ['match1', [createBet()]],
      ['match2', [createBet()]],
      ['match3', [createBet()]],
    ])

    const stats = computeUserStats(matches, entriesByMatch, bets, USER_ID)

    expect(stats.biggestWin).toBe(50)
    expect(stats.biggestLoss).toBe(25)
  })

  it('calculates average payout', () => {
    const matches = [createMatch({ id: 'match1' }), createMatch({ id: 'match2' })]
    // Use a Map to properly associate entries with matches
    const entriesByMatch = new Map<string, LedgerEntry[]>([
      ['match1', [createLedgerEntry(OPPONENT_ID, USER_ID, 20)]], // +20
      ['match2', [createLedgerEntry(USER_ID, OPPONENT_ID, 10)]], // -10
    ])
    const bets = new Map([
      ['match1', [createBet()]],
      ['match2', [createBet()]],
    ])

    const stats = computeUserStats(matches, entriesByMatch, bets, USER_ID)

    expect(stats.avgPayout).toBe(5) // (20 - 10) / 2
  })

  it('tracks favorite game type', () => {
    const matches = [
      createMatch({ id: 'match1' }),
      createMatch({ id: 'match2' }),
      createMatch({ id: 'match3' }),
    ]
    const entries: LedgerEntry[] = []
    const bets = new Map([
      ['match1', [createBet('nassau')]],
      ['match2', [createBet('nassau')]],
      ['match3', [createBet('skins')]],
    ])

    const stats = computeUserStats(matches, entries, bets, USER_ID)

    expect(stats.favoriteGame).toBe('nassau')
    expect(stats.matchesByGame['nassau']).toBe(2)
    expect(stats.matchesByGame['skins']).toBe(1)
  })

  it('counts active days', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const matches = [
      createMatch({ id: 'match1', teeTime: today }),
      createMatch({ id: 'match2', teeTime: today }), // Same day
      createMatch({ id: 'match3', teeTime: yesterday }), // Different day
    ]
    const entries: LedgerEntry[] = []
    const bets = new Map([
      ['match1', [createBet()]],
      ['match2', [createBet()]],
      ['match3', [createBet()]],
    ])

    const stats = computeUserStats(matches, entries, bets, USER_ID)

    expect(stats.activeDays).toBe(2)
  })
})

describe('getMatchResult', () => {
  it('calculates positive net (win)', () => {
    const match = createMatch()
    const entries = [
      createLedgerEntry(OPPONENT_ID, USER_ID, 10),
      createLedgerEntry(OPPONENT_ID, USER_ID, 5),
    ]
    const bets = [createBet()]

    const result = getMatchResult(match, entries, bets, USER_ID)

    expect(result.net).toBe(15)
    expect(result.matchId).toBe(match.id)
    expect(result.opponentIds).toContain(OPPONENT_ID)
  })

  it('calculates negative net (loss)', () => {
    const match = createMatch()
    const entries = [createLedgerEntry(USER_ID, OPPONENT_ID, 20)]
    const bets = [createBet()]

    const result = getMatchResult(match, entries, bets, USER_ID)

    expect(result.net).toBe(-20)
  })

  it('calculates mixed entries correctly', () => {
    const match = createMatch()
    const entries = [
      createLedgerEntry(OPPONENT_ID, USER_ID, 15), // User receives 15
      createLedgerEntry(USER_ID, OPPONENT_ID, 10), // User pays 10
    ]
    const bets = [createBet()]

    const result = getMatchResult(match, entries, bets, USER_ID)

    expect(result.net).toBe(5) // 15 - 10
  })

  it('includes game types from bets', () => {
    const match = createMatch()
    const entries: LedgerEntry[] = []
    const bets = [createBet('nassau'), createBet('skins')]

    const result = getMatchResult(match, entries, bets, USER_ID)

    expect(result.games).toContain('nassau')
    expect(result.games).toContain('skins')
  })
})

describe('computeMatchStats', () => {
  it('returns win result for positive net', () => {
    const match = createMatch()
    const entries = [createLedgerEntry(OPPONENT_ID, USER_ID, 10)]

    const stats = computeMatchStats(match, entries, USER_ID)

    expect(stats.result).toBe('win')
    expect(stats.net).toBe(10)
    expect(stats.totalWon).toBe(10)
    expect(stats.totalLost).toBe(0)
  })

  it('returns loss result for negative net', () => {
    const match = createMatch()
    const entries = [createLedgerEntry(USER_ID, OPPONENT_ID, 15)]

    const stats = computeMatchStats(match, entries, USER_ID)

    expect(stats.result).toBe('loss')
    expect(stats.net).toBe(-15)
    expect(stats.totalWon).toBe(0)
    expect(stats.totalLost).toBe(15)
  })

  it('returns push result for zero net', () => {
    const match = createMatch()
    const entries: LedgerEntry[] = []

    const stats = computeMatchStats(match, entries, USER_ID)

    expect(stats.result).toBe('push')
    expect(stats.net).toBe(0)
  })

  it('handles complex entry scenarios', () => {
    const match = createMatch()
    const entries = [
      createLedgerEntry(OPPONENT_ID, USER_ID, 20), // Won $20
      createLedgerEntry(USER_ID, OPPONENT_ID, 5), // Lost $5
    ]

    const stats = computeMatchStats(match, entries, USER_ID)

    expect(stats.result).toBe('win')
    expect(stats.net).toBe(15)
    expect(stats.totalWon).toBe(20)
    expect(stats.totalLost).toBe(5)
  })
})
