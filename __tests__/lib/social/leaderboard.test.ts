import {
  calculateStandings,
  calculateStandingsFromLedger,
  filterMatchesByDateRange,
  filterLedgerByDateRange,
  formatRankChange,
  getRankEmoji,
  getRankLabel,
  formatWinLoss,
} from '@/lib/social/leaderboard'
import type { Match, LedgerEntry, User, SeasonStanding } from '@/types'

const USER_A = 'userA'
const USER_B = 'userB'
const USER_C = 'userC'

function createUser(id: string, displayName: string): User {
  const now = new Date()
  return {
    id,
    displayName,
    email: `${id}@test.com`,
    avatarUrl: null,
    handicapIndex: null,
    homeClub: null,
    defaultTeeBox: 'white',
    notificationsEnabled: true,
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
  }
}

function createMatch(
  participantIds: string[],
  settlement?: { entries: { participantId: string; balance: number }[] },
  overrides: Partial<Match> = {}
): Match & { settlement?: { entries: { participantId: string; balance: number }[] } } {
  const now = new Date()
  return {
    id: `match_${Math.random().toString(36).substr(2, 9)}`,
    courseName: 'Test Golf Club',
    courseId: null,
    teeTime: now,
    holes: 18,
    status: 'completed',
    currentHole: null,
    createdBy: USER_A,
    scorerId: USER_A,
    participantIds,
    createdAt: now,
    updatedAt: now,
    startedAt: now,
    completedAt: now,
    version: 1,
    settlement,
    ...overrides,
  }
}

function createLedgerEntry(
  fromUserId: string,
  toUserId: string,
  amount: number,
  createdAt: Date = new Date()
): LedgerEntry {
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
    createdAt,
    calculatedBy: 'system',
  }
}

describe('calculateStandings', () => {
  const users = new Map([
    [USER_A, createUser(USER_A, 'Player A')],
    [USER_B, createUser(USER_B, 'Player B')],
    [USER_C, createUser(USER_C, 'Player C')],
  ])
  const memberIds = [USER_A, USER_B, USER_C]

  it('returns standings for all members with zero values for no matches', () => {
    const standings = calculateStandings([], memberIds, users)

    expect(standings).toHaveLength(3)
    standings.forEach(s => {
      expect(s.netAmount).toBe(0)
      expect(s.matchesPlayed).toBe(0)
      expect(s.wins).toBe(0)
      expect(s.losses).toBe(0)
    })
  })

  it('ranks by net amount descending', () => {
    const matches = [
      createMatch([USER_A, USER_B], {
        entries: [
          { participantId: USER_A, balance: 20 },
          { participantId: USER_B, balance: -20 },
        ],
      }),
      createMatch([USER_A, USER_B], {
        entries: [
          { participantId: USER_A, balance: -10 },
          { participantId: USER_B, balance: 10 },
        ],
      }),
    ]

    // Include all 3 members - USER_C didn't play but should appear with $0
    const standings = calculateStandings(matches, [USER_A, USER_B, USER_C], users)

    expect(standings[0].playerId).toBe(USER_A)
    expect(standings[0].netAmount).toBe(10)
    expect(standings[0].rank).toBe(1)

    // USER_C (0) should be ranked between USER_A (+10) and USER_B (-10)
    expect(standings[1].playerId).toBe(USER_C)
    expect(standings[1].netAmount).toBe(0)

    expect(standings[2].playerId).toBe(USER_B)
    expect(standings[2].netAmount).toBe(-10)
  })

  it('handles ties correctly', () => {
    const matches = [
      createMatch([USER_A, USER_B, USER_C], {
        entries: [
          { participantId: USER_A, balance: 10 },
          { participantId: USER_B, balance: 10 },
          { participantId: USER_C, balance: -20 },
        ],
      }),
    ]

    const standings = calculateStandings(matches, memberIds, users)

    // A and B are tied for 1st
    expect(standings[0].rank).toBe(1)
    expect(standings[1].rank).toBe(1)
    // C is 3rd (not 2nd)
    expect(standings[2].rank).toBe(3)
  })

  it('calculates trend vs previous standings', () => {
    const prevStandings: SeasonStanding[] = [
      { playerId: USER_A, displayName: 'A', netAmount: 0, matchesPlayed: 0, wins: 0, losses: 0, rank: 2, trend: 'same' },
      { playerId: USER_B, displayName: 'B', netAmount: 0, matchesPlayed: 0, wins: 0, losses: 0, rank: 1, trend: 'same' },
    ]

    const matches = [
      createMatch([USER_A, USER_B], {
        entries: [
          { participantId: USER_A, balance: 100 },
          { participantId: USER_B, balance: -100 },
        ],
      }),
    ]

    const standings = calculateStandings(matches, [USER_A, USER_B], users, prevStandings)

    const standingA = standings.find(s => s.playerId === USER_A)
    const standingB = standings.find(s => s.playerId === USER_B)

    expect(standingA?.trend).toBe('up')
    expect(standingB?.trend).toBe('down')
  })

  it('excludes non-completed matches', () => {
    const matches = [
      createMatch([USER_A, USER_B], {
        entries: [
          { participantId: USER_A, balance: 50 },
          { participantId: USER_B, balance: -50 },
        ],
      }, { status: 'pending' }),
    ]

    const standings = calculateStandings(matches, memberIds, users)

    standings.forEach(s => {
      expect(s.netAmount).toBe(0)
      expect(s.matchesPlayed).toBe(0)
    })
  })

  it('counts wins and losses correctly', () => {
    const matches = [
      createMatch([USER_A, USER_B], {
        entries: [
          { participantId: USER_A, balance: 10 },
          { participantId: USER_B, balance: -10 },
        ],
      }),
      createMatch([USER_A, USER_B], {
        entries: [
          { participantId: USER_A, balance: 10 },
          { participantId: USER_B, balance: -10 },
        ],
      }),
      createMatch([USER_A, USER_B], {
        entries: [
          { participantId: USER_A, balance: -5 },
          { participantId: USER_B, balance: 5 },
        ],
      }),
    ]

    const standings = calculateStandings(matches, [USER_A, USER_B], users)

    const standingA = standings.find(s => s.playerId === USER_A)
    expect(standingA?.wins).toBe(2)
    expect(standingA?.losses).toBe(1)
    expect(standingA?.matchesPlayed).toBe(3)
  })
})

describe('calculateStandingsFromLedger', () => {
  const users = new Map([
    [USER_A, createUser(USER_A, 'Player A')],
    [USER_B, createUser(USER_B, 'Player B')],
  ])

  it('calculates net amounts from ledger entries', () => {
    const entries = [
      createLedgerEntry(USER_B, USER_A, 25), // A wins 25 from B
      createLedgerEntry(USER_A, USER_B, 10), // A loses 10 to B
    ]

    const standings = calculateStandingsFromLedger(entries, [USER_A, USER_B], users)

    const standingA = standings.find(s => s.playerId === USER_A)
    const standingB = standings.find(s => s.playerId === USER_B)

    expect(standingA?.netAmount).toBe(15) // 25 - 10
    expect(standingB?.netAmount).toBe(-15) // -25 + 10
  })

  it('only counts entries between group members', () => {
    const outsider = 'outsider'
    const entries = [
      createLedgerEntry(USER_B, USER_A, 25), // Within group
      createLedgerEntry(outsider, USER_A, 100), // From outsider - should be ignored
    ]

    const standings = calculateStandingsFromLedger(entries, [USER_A, USER_B], users)

    const standingA = standings.find(s => s.playerId === USER_A)
    expect(standingA?.netAmount).toBe(25) // Only the 25 from within group
  })
})

describe('filterMatchesByDateRange', () => {
  it('filters matches within date range', () => {
    const jan1 = new Date('2024-01-01')
    const jan15 = new Date('2024-01-15')
    const jan31 = new Date('2024-01-31')
    const feb15 = new Date('2024-02-15')

    const matches = [
      createMatch([USER_A, USER_B], undefined, { teeTime: jan1, id: '1' }),
      createMatch([USER_A, USER_B], undefined, { teeTime: jan15, id: '2' }),
      createMatch([USER_A, USER_B], undefined, { teeTime: feb15, id: '3' }),
    ]

    const filtered = filterMatchesByDateRange(matches, jan1, jan31)

    expect(filtered).toHaveLength(2)
    expect(filtered.map(m => m.id)).toEqual(['1', '2'])
  })
})

describe('filterLedgerByDateRange', () => {
  it('filters ledger entries within date range', () => {
    const jan1 = new Date('2024-01-01')
    const jan15 = new Date('2024-01-15')
    const jan31 = new Date('2024-01-31')
    const feb15 = new Date('2024-02-15')

    const entries = [
      createLedgerEntry(USER_A, USER_B, 10, jan1),
      createLedgerEntry(USER_A, USER_B, 20, jan15),
      createLedgerEntry(USER_A, USER_B, 30, feb15),
    ]

    const filtered = filterLedgerByDateRange(entries, jan1, jan31)

    expect(filtered).toHaveLength(2)
    expect(filtered.map(e => e.amount)).toEqual([10, 20])
  })
})

describe('display helpers', () => {
  it('formatRankChange returns correct symbols', () => {
    expect(formatRankChange({ trend: 'up' } as SeasonStanding)).toBe('↑')
    expect(formatRankChange({ trend: 'down' } as SeasonStanding)).toBe('↓')
    expect(formatRankChange({ trend: 'same' } as SeasonStanding)).toBe('–')
  })

  it('getRankEmoji returns medals for top 3', () => {
    expect(getRankEmoji(1)).toBe('🥇')
    expect(getRankEmoji(2)).toBe('🥈')
    expect(getRankEmoji(3)).toBe('🥉')
    expect(getRankEmoji(4)).toBe('')
  })

  it('getRankLabel adds correct suffix', () => {
    expect(getRankLabel(1)).toBe('1st')
    expect(getRankLabel(2)).toBe('2nd')
    expect(getRankLabel(3)).toBe('3rd')
    expect(getRankLabel(4)).toBe('4th')
    expect(getRankLabel(11)).toBe('11th')
    expect(getRankLabel(21)).toBe('21st')
    expect(getRankLabel(22)).toBe('22nd')
  })

  it('formatWinLoss returns W-L format', () => {
    const standing: SeasonStanding = {
      playerId: 'test',
      displayName: 'Test',
      netAmount: 0,
      matchesPlayed: 10,
      wins: 7,
      losses: 3,
      rank: 1,
      trend: 'same',
    }
    expect(formatWinLoss(standing)).toBe('7-3')
  })
})
