import { validateGroupName, canDeleteGroup, canEditGroup, isGroupMember } from '@/lib/social/groups'
import type { Group } from '@/types'

const CREATOR_ID = 'creator123'
const MEMBER_ID = 'member456'
const NON_MEMBER_ID = 'nonmember789'

function createGroup(overrides: Partial<Group> = {}): Group {
  const now = new Date()
  return {
    id: 'group1',
    name: 'Test Group',
    createdBy: CREATOR_ID,
    memberIds: [CREATOR_ID, MEMBER_ID],
    createdAt: now,
    updatedAt: now,
    settings: {
      defaultBets: [],
      defaultCourse: null,
    },
    stats: {
      totalMatches: 0,
      lastMatchDate: null,
    },
    ...overrides,
  }
}

describe('validateGroupName', () => {
  it('accepts valid group names', () => {
    const validNames = ['Weekend Crew', 'The Foursome', 'Saturday Morning Golf', 'CC', 'A-Team']

    validNames.forEach((name) => {
      const result = validateGroupName(name)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  it('rejects names that are too short', () => {
    const result = validateGroupName('A')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('at least 2 characters')
  })

  it('rejects empty names', () => {
    const result = validateGroupName('')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('at least 2 characters')
  })

  it('rejects names that are too long', () => {
    const longName = 'A'.repeat(51)
    const result = validateGroupName(longName)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('less than 50 characters')
  })

  it('accepts name at exactly 50 characters', () => {
    const maxName = 'A'.repeat(50)
    const result = validateGroupName(maxName)
    expect(result.valid).toBe(true)
  })

  it('trims whitespace before validation', () => {
    const result = validateGroupName('  Valid Name  ')
    expect(result.valid).toBe(true)
  })

  it('rejects whitespace-only names after trimming', () => {
    const result = validateGroupName('   ')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('at least 2 characters')
  })
})

describe('canDeleteGroup', () => {
  it('allows creator to delete', () => {
    const group = createGroup()
    expect(canDeleteGroup(group, CREATOR_ID)).toBe(true)
  })

  it('disallows non-creator member to delete', () => {
    const group = createGroup()
    expect(canDeleteGroup(group, MEMBER_ID)).toBe(false)
  })

  it('disallows non-member to delete', () => {
    const group = createGroup()
    expect(canDeleteGroup(group, NON_MEMBER_ID)).toBe(false)
  })
})

describe('canEditGroup', () => {
  it('allows creator to edit', () => {
    const group = createGroup()
    expect(canEditGroup(group, CREATOR_ID)).toBe(true)
  })

  it('disallows non-creator member to edit', () => {
    const group = createGroup()
    expect(canEditGroup(group, MEMBER_ID)).toBe(false)
  })

  it('disallows non-member to edit', () => {
    const group = createGroup()
    expect(canEditGroup(group, NON_MEMBER_ID)).toBe(false)
  })
})

describe('isGroupMember', () => {
  it('returns true for creator', () => {
    const group = createGroup()
    expect(isGroupMember(group, CREATOR_ID)).toBe(true)
  })

  it('returns true for member', () => {
    const group = createGroup()
    expect(isGroupMember(group, MEMBER_ID)).toBe(true)
  })

  it('returns false for non-member', () => {
    const group = createGroup()
    expect(isGroupMember(group, NON_MEMBER_ID)).toBe(false)
  })

  it('handles empty member list', () => {
    const group = createGroup({ memberIds: [] })
    expect(isGroupMember(group, CREATOR_ID)).toBe(false)
  })
})
