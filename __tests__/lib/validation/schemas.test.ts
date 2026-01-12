import {
  emailSchema,
  displayNameSchema,
  handicapSchema,
  teeBoxSchema,
  updateUserProfileSchema,
  createMatchSchema,
  updateMatchStatusSchema,
  scoreSchema,
  nassauConfigSchema,
  skinsConfigSchema,
  createBetSchema,
  createInviteSchema,
  safeValidate,
} from '@/lib/validation/schemas'

describe('emailSchema', () => {
  it('accepts valid emails', () => {
    const validEmails = ['user@example.com', 'test.user@domain.org', 'name+tag@company.co.uk']

    validEmails.forEach((email) => {
      const result = emailSchema.safeParse(email)
      expect(result.success).toBe(true)
    })
  })

  it('normalizes emails to lowercase', () => {
    const result = emailSchema.safeParse('USER@EXAMPLE.COM')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('user@example.com')
    }
  })

  it('trims whitespace from emails', () => {
    const result = emailSchema.safeParse('  user@example.com  ')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('user@example.com')
    }
  })

  it('rejects invalid email formats', () => {
    const invalidEmails = ['invalid', 'user@', '@example.com', 'user@example']

    invalidEmails.forEach((email) => {
      const result = emailSchema.safeParse(email)
      expect(result.success).toBe(false)
    })
  })

  it('rejects emails that are too short', () => {
    const result = emailSchema.safeParse('a@b')
    expect(result.success).toBe(false)
  })
})

describe('displayNameSchema', () => {
  it('accepts valid display names', () => {
    const validNames = ['John Doe', "O'Brien", 'Mary-Jane', 'Bob123']

    validNames.forEach((name) => {
      const result = displayNameSchema.safeParse(name)
      expect(result.success).toBe(true)
    })
  })

  it('rejects names with special characters', () => {
    const invalidNames = ['<script>alert(1)</script>', 'User@Admin', 'Test#Name', 'Name$Money']

    invalidNames.forEach((name) => {
      const result = displayNameSchema.safeParse(name)
      expect(result.success).toBe(false)
    })
  })

  it('rejects names that are too short', () => {
    const result = displayNameSchema.safeParse('A')
    expect(result.success).toBe(false)
  })

  it('rejects names that are too long', () => {
    const result = displayNameSchema.safeParse('A'.repeat(51))
    expect(result.success).toBe(false)
  })

  it('trims whitespace', () => {
    const result = displayNameSchema.safeParse('  John Doe  ')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('John Doe')
    }
  })
})

describe('handicapSchema', () => {
  it('accepts valid handicaps', () => {
    const validHandicaps = [0, 5, 10, 20, 54, 10.5]

    validHandicaps.forEach((handicap) => {
      const result = handicapSchema.safeParse(handicap)
      expect(result.success).toBe(true)
    })
  })

  it('accepts null handicap', () => {
    const result = handicapSchema.safeParse(null)
    expect(result.success).toBe(true)
  })

  it('rejects negative handicaps', () => {
    const result = handicapSchema.safeParse(-1)
    expect(result.success).toBe(false)
  })

  it('rejects handicaps over 54', () => {
    const result = handicapSchema.safeParse(55)
    expect(result.success).toBe(false)
  })
})

describe('teeBoxSchema', () => {
  it('accepts valid tee boxes', () => {
    const validTees = ['championship', 'blue', 'white', 'red']

    validTees.forEach((tee) => {
      const result = teeBoxSchema.safeParse(tee)
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid tee boxes', () => {
    const result = teeBoxSchema.safeParse('yellow')
    expect(result.success).toBe(false)
  })
})

describe('updateUserProfileSchema', () => {
  it('accepts valid profile updates', () => {
    const result = updateUserProfileSchema.safeParse({
      displayName: 'John Doe',
      handicapIndex: 15,
      homeClub: 'Pebble Beach',
      defaultTeeBox: 'white',
      notificationsEnabled: true,
    })

    expect(result.success).toBe(true)
  })

  it('accepts partial updates', () => {
    const result = updateUserProfileSchema.safeParse({
      displayName: 'John Doe',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid display name', () => {
    const result = updateUserProfileSchema.safeParse({
      displayName: '<script>',
    })

    expect(result.success).toBe(false)
  })
})

describe('createMatchSchema', () => {
  it('accepts valid match creation data', () => {
    const futureDate = new Date()
    futureDate.setHours(futureDate.getHours() + 1)

    const result = createMatchSchema.safeParse({
      courseName: 'Pebble Beach',
      teeTime: futureDate.toISOString(),
      holes: 18,
    })

    expect(result.success).toBe(true)
  })

  it('accepts 9 hole matches', () => {
    const futureDate = new Date()
    futureDate.setHours(futureDate.getHours() + 1)

    const result = createMatchSchema.safeParse({
      courseName: 'Short Course',
      teeTime: futureDate.toISOString(),
      holes: 9,
    })

    expect(result.success).toBe(true)
  })

  it('rejects empty course name', () => {
    const futureDate = new Date()
    futureDate.setHours(futureDate.getHours() + 1)

    const result = createMatchSchema.safeParse({
      courseName: '',
      teeTime: futureDate.toISOString(),
      holes: 18,
    })

    expect(result.success).toBe(false)
  })

  it('rejects invalid hole count', () => {
    const futureDate = new Date()
    futureDate.setHours(futureDate.getHours() + 1)

    const result = createMatchSchema.safeParse({
      courseName: 'Test Course',
      teeTime: futureDate.toISOString(),
      holes: 12, // Only 9 or 18 allowed
    })

    expect(result.success).toBe(false)
  })

  it('rejects past tee time', () => {
    const pastDate = new Date()
    pastDate.setHours(pastDate.getHours() - 1)

    const result = createMatchSchema.safeParse({
      courseName: 'Test Course',
      teeTime: pastDate.toISOString(),
      holes: 18,
    })

    expect(result.success).toBe(false)
  })
})

describe('updateMatchStatusSchema', () => {
  it('accepts valid status values', () => {
    const validStatuses = ['pending', 'active', 'completed', 'cancelled']

    validStatuses.forEach((status) => {
      const result = updateMatchStatusSchema.safeParse({ status })
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid status', () => {
    const result = updateMatchStatusSchema.safeParse({ status: 'invalid' })
    expect(result.success).toBe(false)
  })
})

describe('scoreSchema', () => {
  it('accepts valid score', () => {
    const result = scoreSchema.safeParse({
      participantId: 'participant-1',
      holeNumber: 1,
      strokes: 4,
      putts: 2,
      fairwayHit: true,
      greenInRegulation: true,
    })

    expect(result.success).toBe(true)
  })

  it('accepts minimal score (only required fields)', () => {
    const result = scoreSchema.safeParse({
      participantId: 'participant-1',
      holeNumber: 1,
      strokes: 4,
    })

    expect(result.success).toBe(true)
  })

  it('rejects strokes less than 1', () => {
    const result = scoreSchema.safeParse({
      participantId: 'participant-1',
      holeNumber: 1,
      strokes: 0,
    })

    expect(result.success).toBe(false)
  })

  it('rejects strokes greater than 20', () => {
    const result = scoreSchema.safeParse({
      participantId: 'participant-1',
      holeNumber: 1,
      strokes: 21,
    })

    expect(result.success).toBe(false)
  })

  it('rejects invalid hole number', () => {
    const result = scoreSchema.safeParse({
      participantId: 'participant-1',
      holeNumber: 0,
      strokes: 4,
    })

    expect(result.success).toBe(false)

    const result2 = scoreSchema.safeParse({
      participantId: 'participant-1',
      holeNumber: 19,
      strokes: 4,
    })

    expect(result2.success).toBe(false)
  })

  it('rejects putts greater than 10', () => {
    const result = scoreSchema.safeParse({
      participantId: 'participant-1',
      holeNumber: 1,
      strokes: 4,
      putts: 11,
    })

    expect(result.success).toBe(false)
  })
})

describe('nassauConfigSchema', () => {
  it('accepts valid Nassau config', () => {
    const result = nassauConfigSchema.safeParse({
      frontAmount: 5,
      backAmount: 5,
      overallAmount: 5,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 3,
    })

    expect(result.success).toBe(true)
  })

  it('rejects amounts less than 0.01', () => {
    const result = nassauConfigSchema.safeParse({
      frontAmount: 0,
      backAmount: 5,
      overallAmount: 5,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 3,
    })

    expect(result.success).toBe(false)
  })

  it('rejects amounts greater than 1000', () => {
    const result = nassauConfigSchema.safeParse({
      frontAmount: 1001,
      backAmount: 5,
      overallAmount: 5,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 3,
    })

    expect(result.success).toBe(false)
  })

  it('rejects invalid pressTrigger', () => {
    const result = nassauConfigSchema.safeParse({
      frontAmount: 5,
      backAmount: 5,
      overallAmount: 5,
      autoPress: true,
      pressTrigger: 0, // Must be 1-9
      maxPresses: 3,
    })

    expect(result.success).toBe(false)
  })
})

describe('skinsConfigSchema', () => {
  it('accepts valid Skins config', () => {
    const result = skinsConfigSchema.safeParse({
      skinValue: 1,
      carryover: true,
      validation: true,
    })

    expect(result.success).toBe(true)
  })

  it('rejects skinValue less than 0.01', () => {
    const result = skinsConfigSchema.safeParse({
      skinValue: 0,
      carryover: true,
      validation: true,
    })

    expect(result.success).toBe(false)
  })
})

describe('createBetSchema', () => {
  it('accepts valid Nassau bet', () => {
    const result = createBetSchema.safeParse({
      type: 'nassau',
      unitValue: 5,
      scoringMode: 'gross',
      nassauConfig: {
        frontAmount: 5,
        backAmount: 5,
        overallAmount: 5,
        autoPress: true,
        pressTrigger: 2,
        maxPresses: 3,
      },
    })

    expect(result.success).toBe(true)
  })

  it('accepts valid Skins bet', () => {
    const result = createBetSchema.safeParse({
      type: 'skins',
      unitValue: 1,
      scoringMode: 'net',
      skinsConfig: {
        skinValue: 1,
        carryover: true,
        validation: true,
      },
    })

    expect(result.success).toBe(true)
  })

  it('accepts match_play and stroke_play types', () => {
    const matchPlay = createBetSchema.safeParse({
      type: 'match_play',
      unitValue: 10,
      scoringMode: 'gross',
    })

    const strokePlay = createBetSchema.safeParse({
      type: 'stroke_play',
      unitValue: 10,
      scoringMode: 'gross',
    })

    expect(matchPlay.success).toBe(true)
    expect(strokePlay.success).toBe(true)
  })

  it('rejects invalid bet type', () => {
    const result = createBetSchema.safeParse({
      type: 'invalid',
      unitValue: 5,
      scoringMode: 'gross',
    })

    expect(result.success).toBe(false)
  })
})

describe('createInviteSchema', () => {
  it('accepts valid match invite', () => {
    const result = createInviteSchema.safeParse({
      matchId: 'match-123',
    })

    expect(result.success).toBe(true)
  })

  it('accepts valid group invite', () => {
    const result = createInviteSchema.safeParse({
      groupId: 'group-123',
    })

    expect(result.success).toBe(true)
  })

  it('accepts custom limits', () => {
    const result = createInviteSchema.safeParse({
      matchId: 'match-123',
      maxUses: 5,
      expiresInDays: 14,
    })

    expect(result.success).toBe(true)
  })

  it('rejects when neither matchId nor groupId provided', () => {
    const result = createInviteSchema.safeParse({
      maxUses: 10,
    })

    expect(result.success).toBe(false)
  })

  it('rejects maxUses over 100', () => {
    const result = createInviteSchema.safeParse({
      matchId: 'match-123',
      maxUses: 101,
    })

    expect(result.success).toBe(false)
  })

  it('rejects expiresInDays over 30', () => {
    const result = createInviteSchema.safeParse({
      matchId: 'match-123',
      expiresInDays: 31,
    })

    expect(result.success).toBe(false)
  })
})

describe('safeValidate', () => {
  it('returns success with data for valid input', () => {
    const result = safeValidate(emailSchema, 'test@example.com')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('test@example.com')
    }
  })

  it('returns failure with errors for invalid input', () => {
    const result = safeValidate(emailSchema, 'invalid-email')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('email')
    }
  })

  it('returns multiple errors when applicable', () => {
    const result = safeValidate(scoreSchema, {
      participantId: '',
      holeNumber: 0,
      strokes: 0,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(1)
    }
  })
})
