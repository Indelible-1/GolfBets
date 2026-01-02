import { getDoc, setDoc, updateDoc, query, where, getDocs, collection, doc, getFirestore, DocumentReference } from 'firebase/firestore'
import { Match, MatchStatus, Invite } from '@/types'
import { matchDoc, matchesCollection } from './collections'

// ============ READ ============

/**
 * Fetch match document by ID
 */
export async function getMatch(matchId: string): Promise<Match | null> {
  try {
    const snapshot = await getDoc(matchDoc(matchId))
    return snapshot.exists() ? snapshot.data() : null
  } catch (error) {
    console.error('Error fetching match:', error)
    throw error
  }
}

/**
 * Get all matches for a user (filters by participantIds array)
 * @param userId The user ID to query
 * @param statusFilter Optional status filter (pending, active, completed)
 */
export async function getUserMatches(
  userId: string,
  statusFilter?: MatchStatus,
): Promise<Match[]> {
  try {
    const q = query(
      matchesCollection(),
      where('participantIds', 'array-contains', userId),
    )

    const snapshot = await getDocs(q)
    let matches = snapshot.docs.map((doc) => doc.data())

    if (statusFilter) {
      matches = matches.filter((m) => m.status === statusFilter)
    }

    // Sort by teeTime descending (most recent first)
    return matches.sort((a, b) => b.teeTime.getTime() - a.teeTime.getTime())
  } catch (error) {
    console.error('Error fetching user matches:', error)
    throw error
  }
}

/**
 * Get all matches created by a user
 */
export async function getCreatedMatches(userId: string): Promise<Match[]> {
  try {
    const q = query(matchesCollection(), where('createdBy', '==', userId))
    const snapshot = await getDocs(q)
    const matches = snapshot.docs.map((doc) => doc.data())
    return matches.sort((a, b) => b.teeTime.getTime() - a.teeTime.getTime())
  } catch (error) {
    console.error('Error fetching created matches:', error)
    throw error
  }
}

// ============ CREATE ============

/**
 * Create new match (called by match creator)
 */
export async function createMatch(
  userId: string,
  data: {
    courseName: string
    teeTime: Date
    courseId?: string
    holes?: 9 | 18
  },
): Promise<Match> {
  const now = new Date()
  const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const match: Match = {
    id: matchId,
    courseName: data.courseName,
    courseId: data.courseId || null,
    teeTime: data.teeTime,
    holes: data.holes || 18,
    status: 'pending' as MatchStatus,
    currentHole: null,
    createdBy: userId,
    scorerId: userId,
    participantIds: [userId],
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    completedAt: null,
    version: 1,
  }

  try {
    await setDoc(matchDoc(matchId), match)
    return match
  } catch (error) {
    console.error('Error creating match:', error)
    throw error
  }
}

// ============ UPDATE ============

/**
 * Update match status (pending → active → completed)
 */
export async function updateMatchStatus(
  matchId: string,
  status: MatchStatus,
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    }

    if (status === 'active') {
      updates.startedAt = new Date()
    } else if (status === 'completed') {
      updates.completedAt = new Date()
    }

    await updateDoc(matchDoc(matchId), updates)
  } catch (error) {
    console.error('Error updating match status:', error)
    throw error
  }
}

/**
 * Add participant to match (updates participantIds array)
 */
export async function addParticipantToMatch(
  matchId: string,
  userId: string,
): Promise<void> {
  try {
    const match = await getMatch(matchId)
    if (!match) {
      throw new Error('Match not found')
    }

    // Avoid duplicates
    if (match.participantIds.includes(userId)) {
      return
    }

    await updateDoc(matchDoc(matchId), {
      participantIds: [...match.participantIds, userId],
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error adding participant to match:', error)
    throw error
  }
}

/**
 * Remove participant from match (only if pending status)
 */
export async function removeParticipantFromMatch(
  matchId: string,
  userId: string,
): Promise<void> {
  try {
    const match = await getMatch(matchId)
    if (!match) {
      throw new Error('Match not found')
    }

    if (match.status !== 'pending') {
      throw new Error('Cannot remove participants from active or completed matches')
    }

    await updateDoc(matchDoc(matchId), {
      participantIds: match.participantIds.filter((id) => id !== userId),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error removing participant from match:', error)
    throw error
  }
}

// ============ INVITES ============

/**
 * Generate a unique token for invite URL
 */
function generateInviteToken(): string {
  return `invite_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Create an invite for a match
 * @param matchId Match to invite players to
 * @param createdBy User creating the invite
 * @returns Invite object with shareable token
 */
export async function createMatchInvite(
  matchId: string,
  createdBy: string,
): Promise<Invite> {
  try {
    const match = await getMatch(matchId)
    if (!match) {
      throw new Error('Match not found')
    }

    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const token = generateInviteToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const invite: Invite = {
      id: inviteId,
      token,
      matchId,
      groupId: null,
      maxUses: 50,
      useCount: 0,
      createdBy,
      createdAt: new Date(),
      expiresAt,
    }

    const inviteRef = doc(getFirestore(), `matches/${matchId}/invites`, inviteId)
    await setDoc(inviteRef, invite)

    return invite
  } catch (error) {
    console.error('Error creating match invite:', error)
    throw error
  }
}

/**
 * Find match by invite token
 * @param token Invite token from URL
 * @returns Match object if found and valid
 */
export async function getMatchByInviteToken(token: string): Promise<Match | null> {
  try {
    // Query all matches for this invite token
    // This is inefficient at scale but fine for MVP
    const matchesSnap = await getDocs(matchesCollection())

    for (const matchSnap of matchesSnap.docs) {
      const invitesRef = collection(matchSnap.ref, 'invites')
      const inviteQuery = query(invitesRef, where('token', '==', token))
      const invitesSnap = await getDocs(inviteQuery)

      if (invitesSnap.size > 0) {
        const invite = invitesSnap.docs[0].data() as Invite

        // Check if expired or maxed out
        if (invite.expiresAt < new Date()) {
          throw new Error('Invite has expired')
        }
        if (invite.useCount >= invite.maxUses) {
          throw new Error('Invite has reached max uses')
        }

        return matchSnap.data() as Match
      }
    }

    return null
  } catch (error) {
    console.error('Error finding match by invite token:', error)
    throw error
  }
}

/**
 * Accept an invite and add user to match
 * @param token Invite token
 * @param userId User accepting invite
 */
export async function acceptMatchInvite(token: string, userId: string): Promise<Match> {
  try {
    // Find the match and invite
    const matchesSnap = await getDocs(matchesCollection())
    let match: Match | null = null
    let inviteId: string | null = null
    let matchRef: DocumentReference<Match> | null = null

    for (const matchSnap of matchesSnap.docs) {
      const invitesRef = collection(matchSnap.ref, 'invites')
      const inviteQuery = query(invitesRef, where('token', '==', token))
      const invitesSnap = await getDocs(inviteQuery)

      if (invitesSnap.size > 0) {
        match = matchSnap.data() as Match
        matchRef = matchSnap.ref
        inviteId = invitesSnap.docs[0].id
        break
      }
    }

    if (!match || !inviteId || !matchRef) {
      throw new Error('Invalid invite token')
    }

    // Check if expired or maxed out
    if (match.completedAt && match.status === 'completed') {
      throw new Error('Cannot join completed matches')
    }

    // Add participant if not already added
    if (!match.participantIds.includes(userId)) {
      match.participantIds.push(userId)
      await updateDoc(matchRef, {
        participantIds: match.participantIds,
        updatedAt: new Date(),
      })
    }

    // Increment useCount
    const inviteRef = doc(matchRef, 'invites', inviteId)
    await updateDoc(inviteRef, {
      useCount: (await getDoc(inviteRef)).data()?.useCount + 1 || 1,
    })

    return match
  } catch (error) {
    console.error('Error accepting match invite:', error)
    throw error
  }
}
