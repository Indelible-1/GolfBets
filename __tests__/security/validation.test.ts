import {
  emailSchema,
  magicLinkSchema,
  displayNameSchema,
  handicapSchema,
} from '@/lib/validation/schemas'

describe('Email Validation', () => {
  it('accepts valid emails', () => {
    const result = emailSchema.safeParse('user@example.com')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('user@example.com')
    }
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
    const invalidEmails = [
      'invalid',
      'user@',
      '@example.com',
      'user@example',
    ]

    invalidEmails.forEach(email => {
      const result = emailSchema.safeParse(email)
      expect(result.success).toBe(false)
    })
  })

  it('rejects SQL injection attempts', () => {
    const result = emailSchema.safeParse("admin'--@test.com")
    expect(result.success).toBe(false)
  })

  it('rejects XSS attempts', () => {
    const result = emailSchema.safeParse('<script>alert(1)</script>@test.com')
    expect(result.success).toBe(false)
  })
})

describe('Magic Link Schema', () => {
  it('validates complete magic link request', () => {
    const result = magicLinkSchema.safeParse({
      email: 'test@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing email', () => {
    const result = magicLinkSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid email in magic link', () => {
    const result = magicLinkSchema.safeParse({
      email: 'invalid-email',
    })
    expect(result.success).toBe(false)
  })
})

describe('Display Name Validation', () => {
  it('accepts valid display names', () => {
    const validNames = [
      'John Doe',
      "O'Brien",
      'Mary-Jane',
      'Bob123',
    ]

    validNames.forEach(name => {
      const result = displayNameSchema.safeParse(name)
      expect(result.success).toBe(true)
    })
  })

  it('rejects names with special characters', () => {
    const invalidNames = [
      '<script>alert(1)</script>',
      'User@Admin',
      'Test#Name',
      'Name$Money',
    ]

    invalidNames.forEach(name => {
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
})

describe('Handicap Validation', () => {
  it('accepts valid handicaps', () => {
    const validHandicaps = [0, 5, 10, 20, 54]

    validHandicaps.forEach(handicap => {
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

  it('accepts decimal handicaps (golf handicaps can be e.g. 10.5)', () => {
    const result = handicapSchema.safeParse(10.5)
    expect(result.success).toBe(true)
  })
})
