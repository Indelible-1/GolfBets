import { getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore'
import { Match, MatchStatus } from '@/types'
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
