import { getDoc, getDocs, runTransaction } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Score } from '@/types'
import { scoreDoc, scoresCollection } from './collections'

// ============ READ ============

/**
 * Fetch score document by composite ID (participantId_holeNumber)
 */
export async function getScore(matchId: string, scoreId: string): Promise<Score | null> {
  try {
    const snapshot = await getDoc(scoreDoc(matchId, scoreId))
    return snapshot.exists() ? snapshot.data() : null
  } catch (error) {
    console.error('Error fetching score:', error)
    throw error
  }
}

/**
 * Get all scores for a specific hole across all participants
 */
export async function getScoresForHole(matchId: string, holeNumber: number): Promise<Score[]> {
  try {
    const snapshot = await getDocs(scoresCollection(matchId))
    return snapshot.docs.map((doc) => doc.data()).filter((score) => score.holeNumber === holeNumber)
  } catch (error) {
    console.error('Error fetching scores for hole:', error)
    throw error
  }
}

/**
 * Get all scores for a specific participant (their scorecard)
 */
export async function getScoresForParticipant(
  matchId: string,
  participantId: string
): Promise<Score[]> {
  try {
    const snapshot = await getDocs(scoresCollection(matchId))
    const scores = snapshot.docs
      .map((doc) => doc.data())
      .filter((score) => score.participantId === participantId)
    return scores.sort((a, b) => a.holeNumber - b.holeNumber)
  } catch (error) {
    console.error('Error fetching participant scores:', error)
    throw error
  }
}

/**
 * Get all scores for a match
 */
export async function getAllMatchScores(matchId: string): Promise<Score[]> {
  try {
    const snapshot = await getDocs(scoresCollection(matchId))
    const scores = snapshot.docs.map((doc) => doc.data())
    return scores.sort((a, b) => {
      if (a.participantId !== b.participantId) {
        return a.participantId.localeCompare(b.participantId)
      }
      return a.holeNumber - b.holeNumber
    })
  } catch (error) {
    console.error('Error fetching all match scores:', error)
    throw error
  }
}

// ============ CREATE/UPDATE ============

/**
 * Create or update score with optimistic locking to prevent conflicts
 *
 * Key features:
 * - Composite ID: `participantId_holeNumber` prevents duplicates
 * - Version field prevents concurrent update conflicts
 * - deviceId tracks which device entered the score (for offline sync)
 * - syncedAt tracks when it was successfully persisted
 *
 * @param matchId Match ID
 * @param participantId Participant ID
 * @param data Score data (strokes, putts, fairway, GIR)
 * @param expectedVersion Version to compare against (for optimistic locking)
 */
export async function createOrUpdateScore(
  matchId: string,
  participantId: string,
  data: {
    holeNumber: number
    strokes: number
    putts?: number | null
    fairwayHit?: boolean | null
    greenInRegulation?: boolean | null
    enteredBy: string
    deviceId: string
  },
  expectedVersion?: number
): Promise<Score> {
  const scoreId = `${participantId}_${data.holeNumber}`

  try {
    const result = await runTransaction(db, async (transaction) => {
      const scoreRef = scoreDoc(matchId, scoreId)
      const snapshot = await transaction.get(scoreRef)
      const now = new Date()

      if (snapshot.exists()) {
        // Update existing score
        const existingScore = snapshot.data()

        // Optimistic locking: check version matches
        if (expectedVersion !== undefined && existingScore.version !== expectedVersion) {
          throw new Error(
            `Version mismatch: expected ${expectedVersion}, got ${existingScore.version}`
          )
        }

        const updatedScore: Score = {
          ...existingScore,
          strokes: data.strokes,
          putts: data.putts ?? existingScore.putts,
          fairwayHit: data.fairwayHit ?? existingScore.fairwayHit,
          greenInRegulation: data.greenInRegulation ?? existingScore.greenInRegulation,
          enteredBy: data.enteredBy,
          updatedAt: now,
          version: existingScore.version + 1,
          syncedAt: now,
        }

        const updateData: Record<string, unknown> = {
          strokes: updatedScore.strokes,
          putts: updatedScore.putts,
          fairwayHit: updatedScore.fairwayHit,
          greenInRegulation: updatedScore.greenInRegulation,
          enteredBy: updatedScore.enteredBy,
          updatedAt: updatedScore.updatedAt,
          version: updatedScore.version,
          syncedAt: updatedScore.syncedAt,
        }
        transaction.update(scoreRef, updateData)
        return updatedScore
      } else {
        // Create new score
        const newScore: Score = {
          id: scoreId,
          participantId,
          holeNumber: data.holeNumber,
          strokes: data.strokes,
          putts: data.putts ?? null,
          fairwayHit: data.fairwayHit ?? null,
          greenInRegulation: data.greenInRegulation ?? null,
          enteredBy: data.enteredBy,
          createdAt: now,
          updatedAt: now,
          version: 1,
          deviceId: data.deviceId,
          syncedAt: now,
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transaction.set(scoreRef, newScore as any)
        return newScore
      }
    })

    return result
  } catch (error) {
    console.error('Error creating/updating score:', error)
    throw error
  }
}

/**
 * Batch update scores (useful for offline sync)
 * Each score must include its current version for conflict detection
 */
export async function batchUpdateScores(
  matchId: string,
  scores: Array<Score & { expectedVersion: number }>
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      for (const scoreItem of scores) {
        const { expectedVersion } = scoreItem
        const scoreRef = scoreDoc(matchId, scoreItem.id)
        const snapshot = await transaction.get(scoreRef)

        if (snapshot.exists()) {
          const existing = snapshot.data()
          if (existing.version !== expectedVersion) {
            throw new Error(
              `Version mismatch for ${scoreItem.id}: expected ${expectedVersion}, got ${existing.version}`
            )
          }
        }

        const updateData: Record<string, unknown> = {
          version: expectedVersion + 1,
          updatedAt: new Date(),
          syncedAt: new Date(),
        }
        transaction.update(scoreRef, updateData)
      }
    })
  } catch (error) {
    console.error('Error batch updating scores:', error)
    throw error
  }
}
