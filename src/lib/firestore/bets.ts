import { getDoc, setDoc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { Bet, BetType, ScoringMode, NassauConfig, SkinsConfig } from '@/types'
import { betDoc, betsCollection } from './collections'

// ============ READ ============

/**
 * Fetch bet document by ID
 */
export async function getBet(matchId: string, betId: string): Promise<Bet | null> {
  try {
    const snapshot = await getDoc(betDoc(matchId, betId))
    return snapshot.exists() ? snapshot.data() : null
  } catch (error) {
    console.error('Error fetching bet:', error)
    throw error
  }
}

/**
 * Get all bets for a match
 */
export async function getMatchBets(matchId: string): Promise<Bet[]> {
  try {
    const snapshot = await getDocs(betsCollection(matchId))
    return snapshot.docs.map((doc) => doc.data())
  } catch (error) {
    console.error('Error fetching match bets:', error)
    throw error
  }
}

/**
 * Get bets of a specific type for a match
 */
export async function getMatchBetsByType(matchId: string, betType: BetType): Promise<Bet[]> {
  try {
    const bets = await getMatchBets(matchId)
    return bets.filter((bet) => bet.type === betType)
  } catch (error) {
    console.error('Error fetching bets by type:', error)
    throw error
  }
}

// ============ CREATE ============

/**
 * Create a new bet for a match
 * @param matchId Match ID
 * @param userId User ID creating the bet
 * @param data Bet configuration
 */
export async function createBet(
  matchId: string,
  userId: string,
  data: {
    type: BetType
    unitValue: number
    scoringMode: ScoringMode
    nassauConfig?: NassauConfig
    skinsConfig?: SkinsConfig
  }
): Promise<Bet> {
  const now = new Date()
  const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const bet: Bet = {
    id: betId,
    type: data.type,
    unitValue: data.unitValue,
    scoringMode: data.scoringMode,
    nassauConfig: data.nassauConfig ?? null,
    skinsConfig: data.skinsConfig ?? null,
    createdAt: now,
    createdBy: userId,
  }

  try {
    await setDoc(betDoc(matchId, betId), bet)
    return bet
  } catch (error) {
    console.error('Error creating bet:', error)
    throw error
  }
}

// ============ UPDATE ============

/**
 * Update bet configuration (only allowed when match is pending)
 * @param matchId Match ID
 * @param betId Bet ID
 * @param updates Partial bet updates
 */
export async function updateBet(
  matchId: string,
  betId: string,
  updates: Partial<Omit<Bet, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {}

    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.unitValue !== undefined) updateData.unitValue = updates.unitValue
    if (updates.scoringMode !== undefined) updateData.scoringMode = updates.scoringMode
    if (updates.nassauConfig !== undefined) updateData.nassauConfig = updates.nassauConfig
    if (updates.skinsConfig !== undefined) updateData.skinsConfig = updates.skinsConfig

    if (Object.keys(updateData).length === 0) return

    await updateDoc(betDoc(matchId, betId), updateData)
  } catch (error) {
    console.error('Error updating bet:', error)
    throw error
  }
}

// ============ DELETE ============

/**
 * Delete a bet (only allowed when match is pending)
 * @param matchId Match ID
 * @param betId Bet ID
 */
export async function deleteBet(matchId: string, betId: string): Promise<void> {
  try {
    await deleteDoc(betDoc(matchId, betId))
  } catch (error) {
    console.error('Error deleting bet:', error)
    throw error
  }
}
