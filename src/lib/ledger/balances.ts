import { LedgerEntry } from '@/types'

/**
 * Balance for a single user in a transaction
 */
export interface UserBalance {
  userId: string
  amount: number // Positive = owed money, negative = owes money
}

/**
 * Net balance between two specific users (who owes whom)
 */
export interface PairwiseBalance {
  userId: string
  otherUserId: string
  amount: number // Positive = userId owes otherUserId, negative = otherUserId owes userId
}

/**
 * Calculate the net balance for a user across ledger entries
 * Positive = user is owed money, negative = user owes money
 * @param userId User to calculate balance for
 * @param entries Ledger entries to include
 * @returns Net balance amount
 */
export function calculateUserBalance(userId: string, entries: LedgerEntry[]): number {
  return entries.reduce((balance, entry) => {
    // If user is receiving money (toUserId)
    if (entry.toUserId === userId) {
      return balance + entry.amount
    }
    // If user is paying money (fromUserId)
    if (entry.fromUserId === userId) {
      return balance - entry.amount
    }
    return balance
  }, 0)
}

/**
 * Calculate balances for all participants in a match
 * Returns who owes whom and how much
 * @param entries Ledger entries for the match
 * @returns Map of userId -> net balance
 */
export function calculateMatchBalances(entries: LedgerEntry[]): Map<string, number> {
  const balances = new Map<string, number>()

  // Initialize all users with 0 balance
  entries.forEach((entry) => {
    if (!balances.has(entry.fromUserId)) balances.set(entry.fromUserId, 0)
    if (!balances.has(entry.toUserId)) balances.set(entry.toUserId, 0)
  })

  // Calculate balances
  entries.forEach((entry) => {
    const fromBalance = balances.get(entry.fromUserId) || 0
    const toBalance = balances.get(entry.toUserId) || 0

    balances.set(entry.fromUserId, fromBalance - entry.amount)
    balances.set(entry.toUserId, toBalance + entry.amount)
  })

  return balances
}

/**
 * Get unsettled balance for all users in a match
 * Only includes entries where settled === false
 * @param entries Ledger entries for the match
 * @returns Map of userId -> unsettled balance
 */
export function calculateUnsettledBalances(entries: LedgerEntry[]): Map<string, number> {
  const unsettledEntries = entries.filter((entry) => !entry.settled)
  return calculateMatchBalances(unsettledEntries)
}

/**
 * Calculate who owes money (debtors) in a match
 * Returns users with negative balance and how much they owe
 * @param balances Balance map from calculateMatchBalances()
 * @returns Array of { userId, amount owed }
 */
export function getDebtors(balances: Map<string, number>): UserBalance[] {
  return Array.from(balances.entries())
    .filter(([, amount]) => amount < 0)
    .map(([userId, amount]) => ({
      userId,
      amount: Math.abs(amount),
    }))
    .sort((a, b) => b.amount - a.amount) // Sort descending by amount
}

/**
 * Calculate who is owed money (creditors) in a match
 * Returns users with positive balance and how much they're owed
 * @param balances Balance map from calculateMatchBalances()
 * @returns Array of { userId, amount owed }
 */
export function getCreditors(balances: Map<string, number>): UserBalance[] {
  return Array.from(balances.entries())
    .filter(([, amount]) => amount > 0)
    .map(([userId, amount]) => ({
      userId,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount) // Sort descending by amount
}

/**
 * Calculate net balance between two specific users
 * Positive = first user owes second user
 * Negative = second user owes first user
 * @param userId1 First user ID
 * @param userId2 Second user ID
 * @param entries Ledger entries to consider
 * @returns Net amount between users
 */
export function calculatePairwiseBalance(
  userId1: string,
  userId2: string,
  entries: LedgerEntry[]
): number {
  const relevantEntries = entries.filter(
    (entry) =>
      (entry.fromUserId === userId1 && entry.toUserId === userId2) ||
      (entry.fromUserId === userId2 && entry.toUserId === userId1)
  )

  let balance = 0
  relevantEntries.forEach((entry) => {
    if (entry.fromUserId === userId1 && entry.toUserId === userId2) {
      balance += entry.amount // userId1 owes userId2
    } else {
      balance -= entry.amount // userId2 owes userId1
    }
  })

  return balance
}

/**
 * Get all pairwise balances for unsettled entries in a match
 * Useful for settlement UI to show who owes whom
 * @param entries Ledger entries for the match
 * @returns Array of unique pairwise balances
 */
export function getPairwiseBalances(entries: LedgerEntry[]): PairwiseBalance[] {
  const unsettledEntries = entries.filter((entry) => !entry.settled)
  const pairwises = new Map<string, number>()

  // Create a key for each unique pair
  unsettledEntries.forEach((entry) => {
    const key = [entry.fromUserId, entry.toUserId].sort().join('|')
    const existing = pairwises.get(key) || 0

    if (entry.fromUserId < entry.toUserId) {
      pairwises.set(key, existing + entry.amount)
    } else {
      pairwises.set(key, existing - entry.amount)
    }
  })

  // Convert to PairwiseBalance array
  return Array.from(pairwises.entries())
    .map(([key, amount]) => {
      const [userId1, userId2] = key.split('|')
      return {
        userId: userId1,
        otherUserId: userId2,
        amount,
      }
    })
    .filter((pair) => pair.amount !== 0) // Exclude settled pairs
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)) // Sort by magnitude
}

/**
 * Check if a user has any unsettled debts in a match
 * @param userId User to check
 * @param entries Ledger entries for the match
 * @returns true if user owes money, false otherwise
 */
export function userHasUnsettledDebts(userId: string, entries: LedgerEntry[]): boolean {
  const unsettledEntries = entries.filter((entry) => !entry.settled)
  const balance = calculateUserBalance(userId, unsettledEntries)
  return balance < 0
}
