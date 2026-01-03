# Backend Engineer Prompt v2 (Corrected)

> **Role:** Backend Engineer (Role #3)
> **Project:** GolfSettled MVP — Golf Side-Bet Tracker PWA
> **Duration:** Day 2-4
> **Dependencies:** Manager Engineer, Security Engineer
> **Last Updated:** 2026-01-03

---

## YOUR MISSION

You are the **Backend Engineer** responsible for enhancing the Firestore data layer, Cloud Functions, and server-side logic for match management and scoring.

**Key Difference:** Most foundational code already exists. Your role is to **review, enhance, and fill gaps** — not recreate from scratch.

**Your work is complete when:**
1. All CRUD operations work correctly with proper typing
2. Cloud Functions use v2 API and handle audit logging
3. Real-time hooks provide reliable data subscriptions
4. All tests pass with 80%+ coverage

---

## PREREQUISITES

Before starting, verify previous work:

```bash
cd /home/user/GolfBets

# Verify these pass
npm run dev          # Should start
npm run build        # Should build
npm run lint         # Should pass

# Verify Firebase emulators work
npm run emulators    # Should start Auth, Firestore, Functions

# Verify security rules exist
cat firestore.rules
```

---

## CURRENT CODEBASE STATE

### Already Implemented (DO NOT RECREATE)

| File | Status | Notes |
|------|--------|-------|
| `src/types/index.ts` | **Complete** | All 8 entity types + Firestore converter types |
| `src/lib/firebase.ts` | **Complete** | Firebase initialization with offline persistence |
| `src/lib/firestore/collections.ts` | **Complete** | Type-safe refs with converters |
| `src/lib/firestore/converters.ts` | **Complete** | Timestamp/Date conversion |
| `src/lib/firestore/users.ts` | Partial | Has getUser, createUser, updateUserActivity |
| `src/lib/firestore/matches.ts` | Partial | Has CRUD + invite functions |
| `src/lib/firestore/scores.ts` | Partial | Has basic CRUD |
| `src/lib/firestore/bets.ts` | Partial | Has basic CRUD |
| `src/lib/firestore/ledger.ts` | Partial | Has basic queries |
| `src/lib/firestore/invites.ts` | Partial | Separate file exists |
| `src/lib/firestore/participants.ts` | Partial | Has basic CRUD |
| `src/hooks/useAuth.ts` | **Complete** | Auth state + user sync |
| `src/hooks/useMatch.ts` | Partial | Needs real-time subscription |
| `src/hooks/useScores.ts` | Partial | Needs optimization |
| `src/hooks/useLedger.ts` | Partial | Needs balance calculations |
| `functions/src/index.ts` | Exists | Using v1 API (needs upgrade) |
| `functions/src/triggers/*.ts` | Exists | Using v1 API (needs upgrade) |

### Needs Implementation

| File | Priority | Notes |
|------|----------|-------|
| `src/lib/ledger/balances.ts` | **High** | Balance calculation logic |
| Cloud Functions v2 migration | **High** | Currently using deprecated v1 |
| `src/lib/firestore/index.ts` | Medium | Export barrel file |
| Real-time subscriptions | Medium | onSnapshot in hooks |

---

## CRITICAL PATTERNS

### Pattern 1: Type System

The codebase uses **Date in application types** and **Timestamp in Firestore types**. DO NOT change this.

```typescript
// Application types use Date (src/types/index.ts)
export interface User {
  createdAt: Date
  updatedAt: Date
}

// Firestore types use Timestamp
export type FirestoreUser = Omit<User, 'createdAt' | 'updatedAt'> & {
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Pattern 2: Collection References with Converters

All collection references use converters. DO NOT bypass this.

```typescript
// CORRECT - uses converter
export const matchesCollection = (): CollectionReference<Match> =>
  collection(getDb(), 'matches').withConverter(matchConverter)

// WRONG - no converter
export const matchesCollection = collection(db, 'matches') as CollectionReference<Match>
```

### Pattern 3: Import Paths

```typescript
// Firebase exports
import { auth, db, functions } from '@/lib/firebase'

// Types
import type { User, Match, Score } from '@/types'

// Firestore functions
import { matchDoc, matchesCollection } from '@/lib/firestore/collections'
```

---

## TASK CHECKLIST

### Phase 1: Review and Fix Existing Code

#### 1.1 — Verify Type Completeness

Check `src/types/index.ts` has all required types. Add if missing:

```typescript
// Add input types if not present
export interface UserCreateData {
  displayName: string
  email: string
  handicapIndex?: number | null
  avatarUrl?: string | null
  defaultTeeBox?: TeeBox
  notificationsEnabled?: boolean
}

export interface MatchCreateData {
  courseName: string
  courseId?: string | null
  teeTime: Date
  holes: 9 | 18
}

export interface ScoreCreateData {
  participantId: string
  holeNumber: number
  strokes: number
  putts?: number | null
  fairwayHit?: boolean | null
  greenInRegulation?: boolean | null
}
```

#### 1.2 — Create Barrel Export

**Create: `src/lib/firestore/index.ts`**

```typescript
// Collection references
export * from './collections'

// Converters
export * from './converters'

// Data access functions
export * from './users'
export * from './matches'
export * from './scores'
export * from './bets'
export * from './ledger'
export * from './invites'
export * from './participants'
```

---

### Phase 2: Enhance Data Access Functions

#### 2.1 — Update Users (src/lib/firestore/users.ts)

Add missing functions:

```typescript
import { query, where, getDocs } from 'firebase/firestore'
import { usersCollection } from './collections'

/**
 * Get multiple users by IDs
 * Note: Firestore 'in' queries limited to 30 items
 */
export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) return []

  const chunks: string[][] = []
  for (let i = 0; i < userIds.length; i += 30) {
    chunks.push(userIds.slice(i, i + 30))
  }

  const users: User[] = []
  for (const chunk of chunks) {
    const q = query(usersCollection(), where('__name__', 'in', chunk))
    const snap = await getDocs(q)
    snap.forEach(doc => {
      users.push(doc.data())
    })
  }

  return users
}
```

#### 2.2 — Enhance Scores (src/lib/firestore/scores.ts)

Add upsert with optimistic locking:

```typescript
/**
 * Create or update score for a hole
 * Uses composite key: participantId_holeNumber
 */
export async function upsertScore(
  matchId: string,
  data: ScoreCreateData,
  enteredBy: string
): Promise<Score> {
  const scoreId = `${data.participantId}_${data.holeNumber}`
  const existing = await getScore(matchId, scoreId)

  if (existing) {
    // Update with version increment
    await updateDoc(scoreDoc(matchId, scoreId), {
      strokes: data.strokes,
      putts: data.putts ?? null,
      fairwayHit: data.fairwayHit ?? null,
      greenInRegulation: data.greenInRegulation ?? null,
      enteredBy,
      updatedAt: new Date(),
      version: existing.version + 1,
      deviceId: getDeviceId(),
      syncedAt: new Date(),
    })
    return (await getScore(matchId, scoreId))!
  }

  // Create new
  const score: Score = {
    id: scoreId,
    participantId: data.participantId,
    holeNumber: data.holeNumber,
    strokes: data.strokes,
    putts: data.putts ?? null,
    fairwayHit: data.fairwayHit ?? null,
    greenInRegulation: data.greenInRegulation ?? null,
    enteredBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    deviceId: getDeviceId(),
    syncedAt: new Date(),
  }

  await setDoc(scoreDoc(matchId, scoreId), score)
  return score
}

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'
  let deviceId = localStorage.getItem('golfbets_deviceId')
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem('golfbets_deviceId', deviceId)
  }
  return deviceId
}
```

---

### Phase 3: Create Balance Calculator

**Create: `src/lib/ledger/balances.ts`**

```typescript
import type { LedgerEntry, User } from '@/types'

export interface Balance {
  userId: string
  displayName: string
  amount: number  // Positive = they owe me, Negative = I owe them
}

/**
 * Calculate net balance between current user and all other users
 */
export function calculateBalances(
  currentUserId: string,
  entries: LedgerEntry[],
  users: Map<string, User>
): Balance[] {
  const balanceMap = new Map<string, number>()

  for (const entry of entries) {
    if (entry.settled) continue

    if (entry.fromUserId === currentUserId) {
      // I owe them
      const current = balanceMap.get(entry.toUserId) || 0
      balanceMap.set(entry.toUserId, current - entry.amount)
    } else if (entry.toUserId === currentUserId) {
      // They owe me
      const current = balanceMap.get(entry.fromUserId) || 0
      balanceMap.set(entry.fromUserId, current + entry.amount)
    }
  }

  return Array.from(balanceMap.entries())
    .map(([userId, amount]) => ({
      userId,
      displayName: users.get(userId)?.displayName || 'Unknown',
      amount,
    }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
}

/**
 * Get total amount others owe current user
 */
export function getTotalOwed(balances: Balance[]): number {
  return balances
    .filter(b => b.amount > 0)
    .reduce((sum, b) => sum + b.amount, 0)
}

/**
 * Get total amount current user owes others
 */
export function getTotalOwing(balances: Balance[]): number {
  return balances
    .filter(b => b.amount < 0)
    .reduce((sum, b) => sum + Math.abs(b.amount), 0)
}
```

---

### Phase 4: Upgrade Cloud Functions to v2

#### 4.1 — Update functions/package.json

```json
{
  "name": "golfbets-functions",
  "version": "0.2.0",
  "description": "Cloud Functions for GolfSettled MVP",
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "serve": "npm run build && firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log",
    "lint": "eslint src/ --ext .ts"
  },
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "eslint": "^8.50.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

#### 4.2 — Migrate Triggers to v2

**Update: `functions/src/triggers/onScoreWrite.ts`**

```typescript
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import { AuditEntry } from '../types'

const db = getFirestore()

export const onScoreWrite = onDocumentWritten(
  'matches/{matchId}/scores/{scoreId}',
  async (event) => {
    const { matchId, scoreId } = event.params
    const before = event.data?.before?.data()
    const after = event.data?.after?.data()

    let action: 'create' | 'update' | 'delete'
    if (!before && after) action = 'create'
    else if (before && !after) action = 'delete'
    else action = 'update'

    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date()

    const auditEntry: AuditEntry = {
      id: auditId,
      entityType: 'score',
      entityId: scoreId,
      action,
      oldValues: before ? JSON.parse(JSON.stringify(before)) : null,
      newValues: after ? JSON.parse(JSON.stringify(after)) : null,
      changedBy: after?.enteredBy || before?.enteredBy || 'system',
      changedAt: now,
      reason: null,
      deviceId: after?.deviceId || before?.deviceId || 'unknown',
    }

    await db.doc(`matches/${matchId}/audit/${auditId}`).set(auditEntry)
    logger.info(`Audit: ${action} score ${scoreId} in match ${matchId}`)
  }
)
```

#### 4.3 — Migrate Callable Functions to v2

**Update: `functions/src/callable/consumeInvite.ts`**

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'

const db = getFirestore()

export const consumeInvite = onCall(async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in')
  }

  const { token } = request.data
  if (!token || typeof token !== 'string') {
    throw new HttpsError('invalid-argument', 'Token required')
  }

  // Find invite by token
  const invitesSnap = await db
    .collection('invites')
    .where('token', '==', token)
    .limit(1)
    .get()

  if (invitesSnap.empty) {
    throw new HttpsError('not-found', 'Invite not found')
  }

  const inviteDoc = invitesSnap.docs[0]
  const invite = inviteDoc.data()

  // Validate invite
  if (invite.useCount >= invite.maxUses) {
    throw new HttpsError('resource-exhausted', 'Invite has reached maximum uses')
  }

  const now = new Date()
  const expiresAt = invite.expiresAt.toDate()
  if (now > expiresAt) {
    throw new HttpsError('deadline-exceeded', 'Invite has expired')
  }

  // Increment use count atomically
  await inviteDoc.ref.update({
    useCount: FieldValue.increment(1),
  })

  logger.info(`Invite ${inviteDoc.id} consumed by user ${request.auth.uid}`)

  return {
    matchId: invite.matchId,
    groupId: invite.groupId,
  }
})
```

#### 4.4 — Update Index File

**Update: `functions/src/index.ts`**

```typescript
import { initializeApp } from 'firebase-admin/app'

// Initialize Firebase Admin
initializeApp()

// Export v2 triggers
export { onScoreWrite } from './triggers/onScoreWrite'
export { onBetWrite } from './triggers/onBetWrite'

// Export v2 callable functions
export { consumeInvite } from './callable/consumeInvite'
export { healthCheck } from './callable/healthCheck'
```

---

### Phase 5: Enhance React Hooks

#### 5.1 — Add Real-time to useMatch

**Update: `src/hooks/useMatch.ts`**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { matchDoc, participantsCollection, betsCollection, scoresCollection } from '@/lib/firestore/collections'
import type { Match, Participant, Bet, Score } from '@/types'

interface UseMatchReturn {
  match: Match | null
  participants: Participant[]
  bets: Bet[]
  scores: Score[]
  loading: boolean
  error: Error | null
  refresh: () => void
}

export function useMatch(matchId: string | null): UseMatchReturn {
  const [match, setMatch] = useState<Match | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [bets, setBets] = useState<Bet[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!matchId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Real-time subscription to match document
    const unsubMatch = onSnapshot(
      matchDoc(matchId),
      (snap) => {
        if (snap.exists()) {
          setMatch(snap.data())
        } else {
          setMatch(null)
        }
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    // Real-time subscription to participants
    const unsubParticipants = onSnapshot(
      participantsCollection(matchId),
      (snap) => {
        setParticipants(snap.docs.map(doc => doc.data()))
      }
    )

    // Real-time subscription to bets
    const unsubBets = onSnapshot(
      betsCollection(matchId),
      (snap) => {
        setBets(snap.docs.map(doc => doc.data()))
      }
    )

    // Real-time subscription to scores
    const unsubScores = onSnapshot(
      scoresCollection(matchId),
      (snap) => {
        setScores(snap.docs.map(doc => doc.data()))
      }
    )

    return () => {
      unsubMatch()
      unsubParticipants()
      unsubBets()
      unsubScores()
    }
  }, [matchId])

  const refresh = useCallback(() => {
    // Subscriptions auto-refresh; this is a no-op for API compatibility
  }, [])

  return {
    match,
    participants,
    bets,
    scores,
    loading,
    error,
    refresh,
  }
}
```

#### 5.2 — Enhance useLedger with Balances

**Update: `src/hooks/useLedger.ts`**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LedgerEntry, User } from '@/types'
import { getUserLedger, settleLedgerEntry } from '@/lib/firestore/ledger'
import { getUsersByIds } from '@/lib/firestore/users'
import { calculateBalances, getTotalOwed, getTotalOwing, Balance } from '@/lib/ledger/balances'
import { useAuth } from './useAuth'

interface UseLedgerReturn {
  entries: LedgerEntry[]
  unsettledEntries: LedgerEntry[]
  balances: Balance[]
  totalOwed: number
  totalOwing: number
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  settle: (matchId: string, entryId: string) => Promise<void>
}

export function useLedger(): UseLedgerReturn {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const ledgerData = await getUserLedger(user.id)
      setEntries(ledgerData)

      // Get unique user IDs from entries
      const userIds = new Set<string>()
      ledgerData.forEach(entry => {
        userIds.add(entry.fromUserId)
        userIds.add(entry.toUserId)
      })
      userIds.delete(user.id)

      // Fetch user data for names
      const users = await getUsersByIds(Array.from(userIds))
      const userMap = new Map(users.map(u => [u.id, u]))

      // Calculate balances
      const calculatedBalances = calculateBalances(user.id, ledgerData, userMap)
      setBalances(calculatedBalances)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch ledger'))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSettle = useCallback(async (matchId: string, entryId: string) => {
    await settleLedgerEntry(matchId, entryId)
    await fetchData()
  }, [fetchData])

  const unsettledEntries = entries.filter(e => !e.settled)

  return {
    entries,
    unsettledEntries,
    balances,
    totalOwed: getTotalOwed(balances),
    totalOwing: getTotalOwing(balances),
    loading,
    error,
    refresh: fetchData,
    settle: handleSettle,
  }
}
```

---

## RULES FOR THIS ROLE

1. **DO NOT** recreate files that already exist
2. **DO NOT** change the type system (Date vs Timestamp pattern)
3. **DO NOT** bypass collection converters
4. **DO** use existing patterns from the codebase
5. **DO** upgrade Cloud Functions to v2 API
6. **DO** add real-time subscriptions where needed
7. **DO** ensure all functions work with Firebase emulator

---

## HANDOFF CHECKLIST

Before declaring complete, verify ALL:

### Data Access
- [ ] All CRUD operations work with converters
- [ ] getUsersByIds handles chunking correctly
- [ ] upsertScore uses optimistic locking
- [ ] Balance calculations are accurate

### Cloud Functions
- [ ] All functions use v2 API
- [ ] `npm run build` in functions/ passes
- [ ] Audit logging triggers work
- [ ] Health check responds

### Hooks
- [ ] useMatch has real-time subscriptions
- [ ] useScores updates in real-time
- [ ] useLedger calculates balances

### Code Quality
- [ ] `npm run lint` passes
- [ ] `npm run build` passes (root)
- [ ] Tests pass with 80%+ coverage

---

## PR TEMPLATE

**Title:** `[BACKEND] Enhance Firestore layer and upgrade Cloud Functions to v2`

**Body:**
```markdown
## Summary
Enhanced existing Firestore data layer and upgraded Cloud Functions to v2 API.

## Changed
- Added barrel export for firestore functions
- Added getUsersByIds for batch user fetching
- Added upsertScore with optimistic locking
- Created balance calculation utilities
- Upgraded Cloud Functions from v1 to v2 API
- Added real-time subscriptions to hooks

## Testing
- [x] All functions compile
- [x] Emulator tests pass
- [x] Types are correct
- [x] Real-time updates work

## Notes
- Did NOT recreate existing files
- Followed existing converter pattern
- Maintained Date/Timestamp separation
```

---

## START NOW

1. Review existing code in `src/lib/firestore/`
2. Identify gaps vs. this checklist
3. Add missing functions (don't recreate)
4. Upgrade Cloud Functions to v2
5. Add real-time subscriptions to hooks
6. Create balance calculator
7. Test everything with emulator
8. Complete handoff checklist
9. Create PR
