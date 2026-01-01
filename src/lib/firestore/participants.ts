import { getDoc, setDoc, updateDoc, getDocs } from 'firebase/firestore'
import { Participant, ParticipantStatus } from '@/types'
import { participantDoc, participantsCollection } from './collections'

// ============ READ ============

/**
 * Fetch participant document by ID
 */
export async function getParticipant(
  matchId: string,
  participantId: string,
): Promise<Participant | null> {
  try {
    const snapshot = await getDoc(participantDoc(matchId, participantId))
    return snapshot.exists() ? snapshot.data() : null
  } catch (error) {
    console.error('Error fetching participant:', error)
    throw error
  }
}

/**
 * Get all participants in a match
 */
export async function getMatchParticipants(matchId: string): Promise<Participant[]> {
  try {
    const snapshot = await getDocs(participantsCollection(matchId))
    return snapshot.docs.map((doc) => doc.data())
  } catch (error) {
    console.error('Error fetching match participants:', error)
    throw error
  }
}

/**
 * Get participants in a match by status
 */
export async function getParticipantsByStatus(
  matchId: string,
  status: ParticipantStatus,
): Promise<Participant[]> {
  try {
    const participants = await getMatchParticipants(matchId)
    return participants.filter((p) => p.status === status)
  } catch (error) {
    console.error('Error fetching participants by status:', error)
    throw error
  }
}

// ============ CREATE ============

/**
 * Create participant record (called when inviting/adding user to match)
 * @param matchId Match ID
 * @param userId User ID of the participant
 * @param data Optional handicap info
 */
export async function createParticipant(
  matchId: string,
  userId: string,
  data?: {
    displayName?: string
    courseHandicap?: number
  },
): Promise<Participant> {
  const now = new Date()
  const participant: Participant = {
    id: userId,
    userId,
    displayName: data?.displayName || 'Player',
    playingHandicap: null,
    teeBox: 'blue',
    courseHandicap: data?.courseHandicap || null,
    team: null,
    status: 'invited' as ParticipantStatus,
    invitedAt: now,
    confirmedAt: null,
  }

  try {
    await setDoc(participantDoc(matchId, userId), participant)
    return participant
  } catch (error) {
    console.error('Error creating participant:', error)
    throw error
  }
}

// ============ UPDATE ============

/**
 * Update participant status (invited → confirmed → completed)
 */
export async function updateParticipantStatus(
  matchId: string,
  participantId: string,
  status: ParticipantStatus,
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      status,
    }

    if (status === 'confirmed') {
      updates.confirmedAt = new Date()
    }

    await updateDoc(participantDoc(matchId, participantId), updates)
  } catch (error) {
    console.error('Error updating participant status:', error)
    throw error
  }
}

/**
 * Update participant's handicap and tee box
 */
export async function updateParticipantHandicap(
  matchId: string,
  participantId: string,
  handicapData: {
    handicapIndex?: number
    playingHandicap?: number
    teeBox?: string
  },
): Promise<void> {
  try {
    await updateDoc(participantDoc(matchId, participantId), handicapData)
  } catch (error) {
    console.error('Error updating participant handicap:', error)
    throw error
  }
}

/**
 * Update participant display name
 */
export async function updateParticipantDisplayName(
  matchId: string,
  participantId: string,
  displayName: string,
): Promise<void> {
  try {
    await updateDoc(participantDoc(matchId, participantId), { displayName })
  } catch (error) {
    console.error('Error updating participant display name:', error)
    throw error
  }
}
