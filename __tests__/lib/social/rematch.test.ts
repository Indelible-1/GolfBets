import {
  createRematchConfig,
  canRematch,
  modifyRematchConfig,
  updateRematchParticipants,
  updateRematchTeeTime,
  updateRematchCourse,
  getRematchSummary,
  isRematchModified,
} from '@/lib/social/rematch'
import type { Match, Bet, RematchConfig } from '@/types'

const USER_A = 'userA'
const USER_B = 'userB'
const USER_C = 'userC'

function createMatch(overrides: Partial<Match> = {}): Match {
  const now = new Date()
  return {
    id: 'match1',
    courseName: 'Test Golf Club',
    courseId: null,
    teeTime: now,
    holes: 18,
    status: 'completed',
    currentHole: null,
    createdBy: USER_A,
    scorerId: USER_A,
    participantIds: [USER_A, USER_B],
    createdAt: now,
    updatedAt: now,
    startedAt: now,
    completedAt: now,
    version: 1,
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
    nassauConfig: type === 'nassau' ? {
      frontAmount: 5,
      backAmount: 5,
      overallAmount: 5,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 3,
    } : null,
    skinsConfig: type === 'skins' ? {
      skinValue: 2,
      carryover: true,
      validation: false,
    } : null,
    createdAt: now,
    createdBy: USER_A,
  }
}

describe('canRematch', () => {
  it('allows rematch for completed match with bets', () => {
    const match = createMatch({ status: 'completed' })
    const bets = [createBet()]

    const result = canRematch(match, bets)

    expect(result.canRematch).toBe(true)
    expect(result.reason).toBeUndefined()
  })

  it('disallows rematch for pending match', () => {
    const match = createMatch({ status: 'pending' })
    const bets = [createBet()]

    const result = canRematch(match, bets)

    expect(result.canRematch).toBe(false)
    expect(result.reason).toBe('Match is not completed')
  })

  it('disallows rematch for active match', () => {
    const match = createMatch({ status: 'active' })
    const bets = [createBet()]

    const result = canRematch(match, bets)

    expect(result.canRematch).toBe(false)
    expect(result.reason).toBe('Match is not completed')
  })

  it('disallows rematch with less than 2 participants', () => {
    const match = createMatch({ participantIds: [USER_A] })
    const bets = [createBet()]

    const result = canRematch(match, bets)

    expect(result.canRematch).toBe(false)
    expect(result.reason).toBe('Not enough participants')
  })

  it('disallows rematch with no bets', () => {
    const match = createMatch()

    const result = canRematch(match, [])

    expect(result.canRematch).toBe(false)
    expect(result.reason).toBe('No bet configuration found')
  })
})

describe('createRematchConfig', () => {
  it('creates config with original match data', () => {
    const match = createMatch({
      id: 'original-match',
      courseName: 'Augusta National',
      participantIds: [USER_A, USER_B, USER_C],
    })
    const bets = [createBet('nassau'), createBet('skins')]

    const config = createRematchConfig(match, bets)

    expect(config.originalMatchId).toBe('original-match')
    expect(config.courseName).toBe('Augusta National')
    expect(config.participantIds).toEqual([USER_A, USER_B, USER_C])
    expect(config.bets).toHaveLength(2)
    expect(config.teeTime).toBeNull()
  })

  it('clones bets with new IDs', () => {
    const match = createMatch()
    const originalBet = createBet()
    const originalId = originalBet.id

    const config = createRematchConfig(match, [originalBet])

    expect(config.bets[0].id).not.toBe(originalId)
    expect(config.bets[0].type).toBe(originalBet.type)
    expect(config.bets[0].unitValue).toBe(originalBet.unitValue)
  })

  it('preserves bet configuration', () => {
    const match = createMatch()
    const bet = createBet('nassau')

    const config = createRematchConfig(match, [bet])

    expect(config.bets[0].nassauConfig).toEqual(bet.nassauConfig)
  })
})

describe('modifyRematchConfig', () => {
  it('modifies specified fields while preserving originalMatchId', () => {
    const config: RematchConfig = {
      originalMatchId: 'original',
      participantIds: [USER_A, USER_B],
      courseName: 'Old Course',
      bets: [],
      teeTime: null,
    }

    const modified = modifyRematchConfig(config, {
      courseName: 'New Course',
    })

    expect(modified.originalMatchId).toBe('original')
    expect(modified.courseName).toBe('New Course')
    expect(modified.participantIds).toEqual([USER_A, USER_B])
  })
})

describe('updateRematchParticipants', () => {
  it('adds new participants', () => {
    const config: RematchConfig = {
      originalMatchId: 'test',
      participantIds: [USER_A, USER_B],
      courseName: 'Test',
      bets: [],
      teeTime: null,
    }

    const updated = updateRematchParticipants(config, [USER_C], [])

    expect(updated.participantIds).toEqual([USER_A, USER_B, USER_C])
  })

  it('removes participants', () => {
    const config: RematchConfig = {
      originalMatchId: 'test',
      participantIds: [USER_A, USER_B, USER_C],
      courseName: 'Test',
      bets: [],
      teeTime: null,
    }

    const updated = updateRematchParticipants(config, [], [USER_C])

    expect(updated.participantIds).toEqual([USER_A, USER_B])
  })

  it('does not add duplicates', () => {
    const config: RematchConfig = {
      originalMatchId: 'test',
      participantIds: [USER_A, USER_B],
      courseName: 'Test',
      bets: [],
      teeTime: null,
    }

    const updated = updateRematchParticipants(config, [USER_A, USER_B, USER_C], [])

    expect(updated.participantIds).toEqual([USER_A, USER_B, USER_C])
  })
})

describe('updateRematchTeeTime', () => {
  it('sets tee time', () => {
    const config: RematchConfig = {
      originalMatchId: 'test',
      participantIds: [USER_A, USER_B],
      courseName: 'Test',
      bets: [],
      teeTime: null,
    }
    const newTime = new Date('2024-06-15T08:00:00')

    const updated = updateRematchTeeTime(config, newTime)

    expect(updated.teeTime).toEqual(newTime)
  })
})

describe('updateRematchCourse', () => {
  it('sets course name', () => {
    const config: RematchConfig = {
      originalMatchId: 'test',
      participantIds: [USER_A, USER_B],
      courseName: 'Old Course',
      bets: [],
      teeTime: null,
    }

    const updated = updateRematchCourse(config, 'Pebble Beach')

    expect(updated.courseName).toBe('Pebble Beach')
  })
})

describe('getRematchSummary', () => {
  it('returns formatted summary', () => {
    const config: RematchConfig = {
      originalMatchId: 'test',
      participantIds: [USER_A, USER_B, USER_C],
      courseName: 'Augusta National',
      bets: [createBet('nassau'), createBet('skins')],
      teeTime: null,
    }

    const summary = getRematchSummary(config)

    expect(summary).toContain('3 players')
    expect(summary).toContain('Augusta National')
    expect(summary).toContain('nassau')
    expect(summary).toContain('skins')
  })
})

describe('isRematchModified', () => {
  it('returns false for unmodified config', () => {
    const match = createMatch({
      courseName: 'Test Course',
      participantIds: [USER_A, USER_B],
    })
    const bets = [createBet('nassau')]
    const config = createRematchConfig(match, bets)

    const modified = isRematchModified(config, match, bets)

    expect(modified).toBe(false)
  })

  it('returns true for different course', () => {
    const match = createMatch({ courseName: 'Original Course' })
    const bets = [createBet()]
    const config = createRematchConfig(match, bets)
    config.courseName = 'Different Course'

    const modified = isRematchModified(config, match, bets)

    expect(modified).toBe(true)
  })

  it('returns true for different participants', () => {
    const match = createMatch({ participantIds: [USER_A, USER_B] })
    const bets = [createBet()]
    const config = createRematchConfig(match, bets)
    config.participantIds = [USER_A, USER_B, USER_C]

    const modified = isRematchModified(config, match, bets)

    expect(modified).toBe(true)
  })

  it('returns true for different bet types', () => {
    const match = createMatch()
    const originalBets = [createBet('nassau')]
    const config = createRematchConfig(match, originalBets)
    config.bets = [createBet('skins')]

    const modified = isRematchModified(config, match, originalBets)

    expect(modified).toBe(true)
  })
})
