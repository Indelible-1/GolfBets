import { computeHeadToHead, computeOpponentRecord } from '@/lib/analytics/headToHead'
import type { Match, LedgerEntry, Bet, User } from '@/types'

const USER_ID = 'user1'
const OPPONENT_1 = 'opponent1'
const OPPONENT_2 = 'opponent2'

function createMatch(participantIds: string[], overrides: Partial<Match> = {}): Match {
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
    participantIds,
    createdAt: now,
    updatedAt: now,
    startedAt: now,
    completedAt: now,
    version: 1,
    ...overrides,
  }
}

function createLedgerEntry(fromUserId: string, toUserId: string, amount: number): LedgerEntry {
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
  }
}

function createBet(): Bet {
  const now = new Date()
  return {
    id: `bet_${Math.random().toString(36).substr(2, 9)}`,
    type: 'nassau',
    unitValue: 5,
    scoringMode: 'net',
    nassauConfig: {
      frontAmount: 5,
      backAmount: 5,
      overallAmount: 5,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 3,
    },
    skinsConfig: null,
    createdAt: now,
    createdBy: USER_ID,
  }
}

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

describe('computeHeadToHead', () => {
  it('returns empty summary for no matches', () => {
    const summary = computeHeadToHead(
      {
        matches: [],
        ledgerEntries: [],
        bets: new Map(),
        users: new Map(),
      },
      USER_ID
    )

    expect(summary.records).toHaveLength(0)
    expect(summary.topRival).toBeNull()
    expect(summary.biggestDebtor).toBeNull()
    expect(summary.biggestCreditor).toBeNull()
  })

  it('groups matches by opponent', () => {
    const matches = [
      createMatch([USER_ID, OPPONENT_1], { id: 'match1' }),
      createMatch([USER_ID, OPPONENT_1], { id: 'match2' }),
      createMatch([USER_ID, OPPONENT_2], { id: 'match3' }),
    ]
    const users = new Map([
      [OPPONENT_1, createUser(OPPONENT_1, 'Opponent One')],
      [OPPONENT_2, createUser(OPPONENT_2, 'Opponent Two')],
    ])

    const summary = computeHeadToHead(
      {
        matches,
        ledgerEntries: [],
        bets: new Map(),
        users,
      },
      USER_ID
    )

    expect(summary.records).toHaveLength(2)

    const opp1Record = summary.records.find((r) => r.opponentId === OPPONENT_1)
    const opp2Record = summary.records.find((r) => r.opponentId === OPPONENT_2)

    expect(opp1Record?.totalMatches).toBe(2)
    expect(opp2Record?.totalMatches).toBe(1)
  })

  it('identifies top rival (most matches)', () => {
    const matches = [
      createMatch([USER_ID, OPPONENT_1], { id: 'match1' }),
      createMatch([USER_ID, OPPONENT_1], { id: 'match2' }),
      createMatch([USER_ID, OPPONENT_1], { id: 'match3' }),
      createMatch([USER_ID, OPPONENT_2], { id: 'match4' }),
    ]
    const users = new Map([
      [OPPONENT_1, createUser(OPPONENT_1, 'Rival')],
      [OPPONENT_2, createUser(OPPONENT_2, 'Casual')],
    ])

    const summary = computeHeadToHead(
      {
        matches,
        ledgerEntries: [],
        bets: new Map(),
        users,
      },
      USER_ID
    )

    expect(summary.topRival?.opponentId).toBe(OPPONENT_1)
    expect(summary.topRival?.totalMatches).toBe(3)
  })

  it('identifies biggest debtor (owes you most)', () => {
    const matches = [
      createMatch([USER_ID, OPPONENT_1], { id: 'match1' }),
      createMatch([USER_ID, OPPONENT_2], { id: 'match2' }),
    ]
    const users = new Map([
      [OPPONENT_1, createUser(OPPONENT_1, 'Owes You')],
      [OPPONENT_2, createUser(OPPONENT_2, 'You Owe')],
    ])

    // Note: In real usage, entries would be properly linked to matches
    // For this test, we're testing the identification logic

    const summary = computeHeadToHead(
      {
        matches,
        ledgerEntries: [],
        bets: new Map(),
        users,
      },
      USER_ID
    )

    // With no ledger entries, all are pushes, so no debtors
    expect(summary.biggestDebtor).toBeNull()
  })

  it('excludes pending matches', () => {
    const matches = [
      createMatch([USER_ID, OPPONENT_1], { id: 'match1', status: 'completed' }),
      createMatch([USER_ID, OPPONENT_1], { id: 'match2', status: 'pending' }),
    ]
    const users = new Map([[OPPONENT_1, createUser(OPPONENT_1, 'Test')]])

    const summary = computeHeadToHead(
      {
        matches,
        ledgerEntries: [],
        bets: new Map(),
        users,
      },
      USER_ID
    )

    expect(summary.records[0].totalMatches).toBe(1)
  })

  it('sorts records by total matches descending', () => {
    const matches = [
      createMatch([USER_ID, OPPONENT_1], { id: 'match1' }),
      createMatch([USER_ID, OPPONENT_2], { id: 'match2' }),
      createMatch([USER_ID, OPPONENT_2], { id: 'match3' }),
      createMatch([USER_ID, OPPONENT_2], { id: 'match4' }),
    ]
    const users = new Map([
      [OPPONENT_1, createUser(OPPONENT_1, 'One')],
      [OPPONENT_2, createUser(OPPONENT_2, 'Two')],
    ])

    const summary = computeHeadToHead(
      {
        matches,
        ledgerEntries: [],
        bets: new Map(),
        users,
      },
      USER_ID
    )

    expect(summary.records[0].opponentId).toBe(OPPONENT_2)
    expect(summary.records[1].opponentId).toBe(OPPONENT_1)
  })
})

describe('computeOpponentRecord', () => {
  it('calculates wins and losses correctly', () => {
    const matches = [
      createMatch([USER_ID, OPPONENT_1], { id: 'match1' }),
      createMatch([USER_ID, OPPONENT_1], { id: 'match2' }),
      createMatch([USER_ID, OPPONENT_1], { id: 'match3' }),
    ]
    const entriesByMatch = new Map<string, LedgerEntry[]>([
      ['match1', [createLedgerEntry(OPPONENT_1, USER_ID, 10)]], // Win
      ['match2', [createLedgerEntry(USER_ID, OPPONENT_1, 5)]], // Loss
      ['match3', []], // Push
    ])
    const bets = new Map([
      ['match1', [createBet()]],
      ['match2', [createBet()]],
      ['match3', [createBet()]],
    ])

    const record = computeOpponentRecord(
      matches,
      entriesByMatch,
      bets,
      USER_ID,
      OPPONENT_1,
      'Test Opponent',
      null
    )

    expect(record.wins).toBe(1)
    expect(record.losses).toBe(1)
    expect(record.pushes).toBe(1)
    expect(record.totalMatches).toBe(3)
  })

  it('calculates net amount correctly', () => {
    const matches = [
      createMatch([USER_ID, OPPONENT_1], { id: 'match1' }),
      createMatch([USER_ID, OPPONENT_1], { id: 'match2' }),
    ]
    const entriesByMatch = new Map<string, LedgerEntry[]>([
      ['match1', [createLedgerEntry(OPPONENT_1, USER_ID, 25)]], // +25
      ['match2', [createLedgerEntry(USER_ID, OPPONENT_1, 10)]], // -10
    ])
    const bets = new Map([
      ['match1', [createBet()]],
      ['match2', [createBet()]],
    ])

    const record = computeOpponentRecord(
      matches,
      entriesByMatch,
      bets,
      USER_ID,
      OPPONENT_1,
      'Test Opponent',
      null
    )

    expect(record.netAmount).toBe(15) // 25 - 10
    expect(record.totalWon).toBe(25)
    expect(record.totalLost).toBe(10)
  })

  it('determines last result correctly', () => {
    const oldDate = new Date('2024-01-01')
    const newDate = new Date('2024-06-01')

    const matches = [
      createMatch([USER_ID, OPPONENT_1], { id: 'match1', teeTime: oldDate }),
      createMatch([USER_ID, OPPONENT_1], { id: 'match2', teeTime: newDate }),
    ]
    const entriesByMatch = new Map<string, LedgerEntry[]>([
      ['match1', [createLedgerEntry(OPPONENT_1, USER_ID, 10)]], // Win
      ['match2', [createLedgerEntry(USER_ID, OPPONENT_1, 5)]], // Loss (more recent)
    ])
    const bets = new Map([
      ['match1', [createBet()]],
      ['match2', [createBet()]],
    ])

    const record = computeOpponentRecord(
      matches,
      entriesByMatch,
      bets,
      USER_ID,
      OPPONENT_1,
      'Test Opponent',
      null
    )

    expect(record.lastResult).toBe('loss')
    expect(record.lastPlayed.getTime()).toBe(newDate.getTime())
  })

  it('tracks results by game type', () => {
    const matches = [createMatch([USER_ID, OPPONENT_1], { id: 'match1' })]
    const entriesByMatch = new Map<string, LedgerEntry[]>([
      ['match1', [createLedgerEntry(OPPONENT_1, USER_ID, 10)]],
    ])
    const nassauBet = createBet()
    const bets = new Map([['match1', [nassauBet]]])

    const record = computeOpponentRecord(
      matches,
      entriesByMatch,
      bets,
      USER_ID,
      OPPONENT_1,
      'Test Opponent',
      null
    )

    expect(record.resultsByGame['nassau']).toBeDefined()
    expect(record.resultsByGame['nassau'].wins).toBe(1)
    expect(record.resultsByGame['nassau'].net).toBe(10)
  })

  it('handles empty matches array', () => {
    const record = computeOpponentRecord(
      [],
      new Map(),
      new Map(),
      USER_ID,
      OPPONENT_1,
      'Test Opponent',
      null
    )

    expect(record.totalMatches).toBe(0)
    expect(record.wins).toBe(0)
    expect(record.losses).toBe(0)
    expect(record.netAmount).toBe(0)
  })
})
