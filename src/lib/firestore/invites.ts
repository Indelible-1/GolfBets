import { getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore'
import { Invite } from '@/types'
import { inviteDoc, invitesCollection } from './collections'
import { generateInviteToken } from '@/lib/utils'

// ============ READ ============

/**
 * Fetch invite by ID
 */
export async function getInvite(inviteId: string): Promise<Invite | null> {
  try {
    const snapshot = await getDoc(inviteDoc(inviteId))
    return snapshot.exists() ? snapshot.data() : null
  } catch (error) {
    console.error('Error fetching invite:', error)
    throw error
  }
}

/**
 * Fetch invite by token
 */
export async function getInviteByToken(token: string): Promise<Invite | null> {
  try {
    const q = query(invitesCollection(), where('token', '==', token))
    const snapshot = await getDocs(q)
    return snapshot.empty ? null : snapshot.docs[0].data()
  } catch (error) {
    console.error('Error fetching invite by token:', error)
    throw error
  }
}

/**
 * Get all active invites created by a user
 */
export async function getUserInvites(userId: string): Promise<Invite[]> {
  try {
    const q = query(invitesCollection(), where('createdBy', '==', userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => doc.data())
  } catch (error) {
    console.error('Error fetching user invites:', error)
    throw error
  }
}

/**
 * Get all active invites for a specific match
 */
export async function getMatchInvites(matchId: string): Promise<Invite[]> {
  try {
    const q = query(invitesCollection(), where('matchId', '==', matchId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => doc.data())
  } catch (error) {
    console.error('Error fetching match invites:', error)
    throw error
  }
}

// ============ CREATE ============

/**
 * Create a new invite link for a match
 * @param matchId Match ID to invite to
 * @param userId User ID creating the invite
 * @param options Optional invite configuration
 */
export async function createInvite(
  matchId: string,
  userId: string,
  options?: {
    maxUses?: number
    expiresInHours?: number
  }
): Promise<Invite> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + (options?.expiresInHours || 24) * 60 * 60 * 1000)
  const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const token = generateInviteToken()

  const invite: Invite = {
    id: inviteId,
    token,
    matchId,
    groupId: null,
    maxUses: options?.maxUses || 10,
    useCount: 0,
    expiresAt,
    createdBy: userId,
    createdAt: now,
  }

  try {
    await setDoc(inviteDoc(inviteId), invite)
    return invite
  } catch (error) {
    console.error('Error creating invite:', error)
    throw error
  }
}

// ============ VALIDATION ============

/**
 * Validate if an invite can still be used
 * Checks: expiration, max uses not exceeded, not revoked
 */
export function validateInvite(invite: Invite): {
  valid: boolean
  reason?: string
} {
  const now = new Date()

  if (now > invite.expiresAt) {
    return { valid: false, reason: 'Invite has expired' }
  }

  if (invite.useCount >= invite.maxUses) {
    return { valid: false, reason: 'Invite max uses exceeded' }
  }

  return { valid: true }
}

// ============ UPDATE ============

/**
 * Increment use count when invite is consumed
 * Called by Cloud Functions - consumeInvite
 */
export async function incrementInviteUseCount(inviteId: string): Promise<void> {
  try {
    const invite = await getInvite(inviteId)
    if (!invite) throw new Error('Invite not found')

    const validation = validateInvite(invite)
    if (!validation.valid) throw new Error(validation.reason)

    await updateDoc(inviteDoc(inviteId), {
      useCount: invite.useCount + 1,
    })
  } catch (error) {
    console.error('Error incrementing invite use count:', error)
    throw error
  }
}

/**
 * Revoke an invite (prevent further uses)
 * Sets maxUses to current useCount to prevent additional uses
 */
export async function revokeInvite(inviteId: string): Promise<void> {
  try {
    const invite = await getInvite(inviteId)
    if (!invite) throw new Error('Invite not found')

    await updateDoc(inviteDoc(inviteId), {
      maxUses: invite.useCount,
    })
  } catch (error) {
    console.error('Error revoking invite:', error)
    throw error
  }
}

/**
 * Update invite expiration time
 */
export async function updateInviteExpiration(inviteId: string, expiresAt: Date): Promise<void> {
  try {
    await updateDoc(inviteDoc(inviteId), {
      expiresAt,
    })
  } catch (error) {
    console.error('Error updating invite expiration:', error)
    throw error
  }
}
