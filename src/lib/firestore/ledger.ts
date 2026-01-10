import {
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  collectionGroup,
  getFirestore,
  Firestore,
} from 'firebase/firestore'
import { LedgerEntry } from '@/types'
import { ledgerEntryDoc, ledgerCollection } from './collections'

let db: Firestore | undefined

function getDb(): Firestore {
  if (!db) {
    db = getFirestore()
  }
  return db
}

// ============ READ ============

/**
 * Fetch ledger entry by ID
 */
export async function getLedgerEntry(
  matchId: string,
  entryId: string
): Promise<LedgerEntry | null> {
  try {
    const snapshot = await getDoc(ledgerEntryDoc(matchId, entryId))
    return snapshot.exists() ? snapshot.data() : null
  } catch (error) {
    console.error('Error fetching ledger entry:', error)
    throw error
  }
}

/**
 * Get all ledger entries for a match
 */
export async function getMatchLedger(matchId: string): Promise<LedgerEntry[]> {
  try {
    const snapshot = await getDocs(ledgerCollection(matchId))
    return snapshot.docs.map((doc) => doc.data())
  } catch (error) {
    console.error('Error fetching match ledger:', error)
    throw error
  }
}

/**
 * Get all ledger entries for a user across all matches (unsettled)
 * Uses collectionGroup to query ledger subcollections across all matches
 */
export async function getUserLedger(userId: string): Promise<LedgerEntry[]> {
  try {
    // Query where user is either creditor or debtor
    const fromUserQuery = query(
      collectionGroup(getDb(), 'ledger'),
      where('fromUserId', '==', userId)
    )
    const toUserQuery = query(collectionGroup(getDb(), 'ledger'), where('toUserId', '==', userId))

    const [fromSnapshots, toSnapshots] = await Promise.all([
      getDocs(fromUserQuery),
      getDocs(toUserQuery),
    ])

    const entries = [
      ...fromSnapshots.docs.map((doc) => doc.data() as LedgerEntry),
      ...toSnapshots.docs.map((doc) => doc.data() as LedgerEntry),
    ]

    return entries
  } catch (error) {
    console.error('Error fetching user ledger:', error)
    throw error
  }
}

/**
 * Get unsettled ledger entries for a user (only unsettled: true)
 */
export async function getUserPendingSettlements(userId: string): Promise<LedgerEntry[]> {
  try {
    const entries = await getUserLedger(userId)
    return entries.filter((entry) => !entry.settled)
  } catch (error) {
    console.error('Error fetching pending settlements:', error)
    throw error
  }
}

/**
 * Get settled ledger entries for a user (only settled: true)
 */
export async function getUserSettledEntries(userId: string): Promise<LedgerEntry[]> {
  try {
    const entries = await getUserLedger(userId)
    return entries.filter((entry) => entry.settled)
  } catch (error) {
    console.error('Error fetching settled entries:', error)
    throw error
  }
}

/**
 * Get unsettled entries for a specific match
 */
export async function getMatchUnsettledEntries(matchId: string): Promise<LedgerEntry[]> {
  try {
    const ledger = await getMatchLedger(matchId)
    return ledger.filter((entry) => !entry.settled)
  } catch (error) {
    console.error('Error fetching unsettled match entries:', error)
    throw error
  }
}

// ============ CREATE ============

/**
 * Create a ledger entry when bets are calculated
 * Called by Cloud Functions after match completion
 * @param matchId Match ID
 * @param data Ledger entry data
 */
export async function createLedgerEntry(
  matchId: string,
  data: {
    fromUserId: string
    toUserId: string
    amount: number
    betType: string
    betId: string
    description: string
    calculatedBy: string
  }
): Promise<LedgerEntry> {
  const now = new Date()
  const entryId = `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const entry: LedgerEntry = {
    id: entryId,
    fromUserId: data.fromUserId,
    toUserId: data.toUserId,
    amount: data.amount,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    betType: data.betType as any,
    betId: data.betId,
    description: data.description,
    settled: false,
    settledAt: null,
    settledBy: null,
    createdAt: now,
    calculatedBy: data.calculatedBy,
  }

  try {
    await setDoc(ledgerEntryDoc(matchId, entryId), entry)
    return entry
  } catch (error) {
    console.error('Error creating ledger entry:', error)
    throw error
  }
}

// ============ UPDATE ============

/**
 * Mark ledger entry as settled (paid)
 * @param matchId Match ID
 * @param entryId Entry ID
 * @param settledByUserId User who marked it settled (typically the payer)
 */
export async function markLedgerEntrySettled(
  matchId: string,
  entryId: string,
  settledByUserId: string
): Promise<void> {
  try {
    const now = new Date()
    const updateData: Record<string, unknown> = {
      settled: true,
      settledAt: now,
      settledBy: settledByUserId,
    }

    await updateDoc(ledgerEntryDoc(matchId, entryId), updateData)
  } catch (error) {
    console.error('Error marking ledger entry settled:', error)
    throw error
  }
}

/**
 * Batch mark multiple ledger entries as settled
 */
export async function batchMarkSettled(
  matchId: string,
  entryIds: string[],
  settledByUserId: string
): Promise<void> {
  try {
    const now = new Date()
    const updateData: Record<string, unknown> = {
      settled: true,
      settledAt: now,
      settledBy: settledByUserId,
    }

    const updatePromises = entryIds.map((entryId) =>
      updateDoc(ledgerEntryDoc(matchId, entryId), updateData)
    )

    await Promise.all(updatePromises)
  } catch (error) {
    console.error('Error batch marking entries settled:', error)
    throw error
  }
}
