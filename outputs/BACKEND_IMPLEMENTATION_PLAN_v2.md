# Backend Implementation Plan v2 (Corrected)

> **Project:** GolfSettled MVP — Golf Side-Bet Tracker PWA
> **Last Updated:** 2026-01-03
> **Status:** Ready for implementation

---

## Key Differences from v1

| Aspect | v1 (Original) | v2 (Corrected) |
|--------|---------------|----------------|
| Approach | Create all files | Update existing, create gaps only |
| Path | `/Users/neilfrye/docs/AI/SideBets` | `/home/user/GolfBets` |
| Types | Propose new types | Reference existing `src/types/index.ts` |
| Cloud Functions | v1 API | v2 API |
| Firebase SDK | Deprecated patterns | Current best practices |

---

## Current Codebase Inventory

### Complete (No Changes Needed)

| File | Status | Coverage |
|------|--------|----------|
| `src/types/index.ts` | Complete | All 8 entities + Firestore types |
| `src/lib/firebase.ts` | Complete | Initialization + offline |
| `src/lib/firestore/collections.ts` | Complete | All refs with converters |
| `src/lib/firestore/converters.ts` | Complete | 8 converters |
| `src/hooks/useAuth.ts` | Complete | Auth state + user sync |
| `firestore.rules` | Complete | Security rules |

### Partial (Needs Enhancement)

| File | Has | Needs |
|------|-----|-------|
| `src/lib/firestore/users.ts` | getUser, createUser, updateUserActivity | getUsersByIds |
| `src/lib/firestore/matches.ts` | CRUD, invites | Cleanup, better error handling |
| `src/lib/firestore/scores.ts` | Basic CRUD | upsertScore with locking |
| `src/lib/firestore/ledger.ts` | Basic queries | collectionGroup query |
| `src/hooks/useMatch.ts` | Basic fetch | Real-time subscriptions |
| `src/hooks/useLedger.ts` | Basic | Balance calculations |
| `functions/src/**` | v1 triggers | v2 migration |

### Missing (Needs Creation)

| File | Purpose |
|------|---------|
| `src/lib/firestore/index.ts` | Barrel export |
| `src/lib/ledger/balances.ts` | Balance calculations |
| `firestore.indexes.json` | Composite indexes for collectionGroup |

---

## Implementation Milestones

### Milestone 1: Foundation Cleanup (1-2 hours)

**Objective:** Create missing utility files and fix import paths.

**Tasks:**

1. **Create barrel export**
   ```bash
   # Create src/lib/firestore/index.ts
   ```
   ```typescript
   export * from './collections'
   export * from './converters'
   export * from './users'
   export * from './matches'
   export * from './scores'
   export * from './bets'
   export * from './ledger'
   export * from './invites'
   export * from './participants'
   ```

2. **Add composite indexes**
   ```bash
   # Create/update firestore.indexes.json
   ```
   ```json
   {
     "indexes": [],
     "fieldOverrides": [
       {
         "collectionGroup": "ledger",
         "fieldPath": "fromUserId",
         "indexes": [
           { "order": "ASCENDING", "queryScope": "COLLECTION_GROUP" }
         ]
       },
       {
         "collectionGroup": "ledger",
         "fieldPath": "toUserId",
         "indexes": [
           { "order": "ASCENDING", "queryScope": "COLLECTION_GROUP" }
         ]
       }
     ]
   }
   ```

3. **Add input types to `src/types/index.ts`**
   ```typescript
   // Add after existing types if not present
   export interface UserCreateData { ... }
   export interface MatchCreateData { ... }
   export interface ScoreCreateData { ... }
   export interface BetCreateData { ... }
   ```

**Success Criteria:**
- [ ] `npm run build` passes
- [ ] All imports resolve correctly
- [ ] No TypeScript errors

---

### Milestone 2: Enhance Data Access (2-3 hours)

**Objective:** Add missing functions to existing files.

**Tasks:**

1. **Add to `src/lib/firestore/users.ts`:**
   - `getUsersByIds(userIds: string[]): Promise<User[]>`

2. **Add to `src/lib/firestore/scores.ts`:**
   - `upsertScore(matchId, data, enteredBy): Promise<Score>`
   - `getDeviceId(): string` (helper)

3. **Add to `src/lib/firestore/ledger.ts`:**
   - `getUserLedgerCrossMatch(userId): Promise<LedgerEntry[]>` (collectionGroup)

4. **Clean up `src/lib/firestore/matches.ts`:**
   - Remove redundant imports
   - Consolidate invite logic
   - Add consistent error handling

**Key Implementation Notes:**

```typescript
// getUsersByIds - handle Firestore 30-item limit
export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) return []

  // Chunk into groups of 30
  const chunks: string[][] = []
  for (let i = 0; i < userIds.length; i += 30) {
    chunks.push(userIds.slice(i, i + 30))
  }

  const users: User[] = []
  for (const chunk of chunks) {
    const q = query(usersCollection(), where('__name__', 'in', chunk))
    const snap = await getDocs(q)
    snap.forEach(doc => users.push(doc.data()))
  }

  return users
}
```

```typescript
// upsertScore - composite key + optimistic locking
export async function upsertScore(
  matchId: string,
  data: ScoreCreateData,
  enteredBy: string
): Promise<Score> {
  const scoreId = `${data.participantId}_${data.holeNumber}`
  // ... implementation
}
```

**Success Criteria:**
- [ ] getUsersByIds handles >30 users
- [ ] upsertScore prevents duplicate scores per hole
- [ ] collectionGroup query returns cross-match ledger

---

### Milestone 3: Balance Calculator (1-2 hours)

**Objective:** Create pure functions for balance calculations.

**Create: `src/lib/ledger/balances.ts`**

```typescript
import type { LedgerEntry, User } from '@/types'

export interface Balance {
  userId: string
  displayName: string
  amount: number  // Positive = they owe me, Negative = I owe them
}

export function calculateBalances(
  currentUserId: string,
  entries: LedgerEntry[],
  users: Map<string, User>
): Balance[] { ... }

export function getTotalOwed(balances: Balance[]): number { ... }

export function getTotalOwing(balances: Balance[]): number { ... }

export function getNetBalance(balances: Balance[]): number { ... }
```

**Unit Tests:** `__tests__/lib/ledger/balances.test.ts`

```typescript
describe('calculateBalances', () => {
  it('returns empty array for no entries', () => { ... })
  it('calculates positive balance when others owe user', () => { ... })
  it('calculates negative balance when user owes others', () => { ... })
  it('nets out multiple entries between same users', () => { ... })
  it('excludes settled entries', () => { ... })
})
```

**Success Criteria:**
- [ ] Pure functions (no side effects)
- [ ] 100% test coverage for balance calculations
- [ ] Correctly handles settled vs unsettled

---

### Milestone 4: Cloud Functions v2 Migration (2-3 hours)

**Objective:** Upgrade all Cloud Functions from v1 to v2 API.

**Tasks:**

1. **Update `functions/package.json`:**
   ```json
   {
     "dependencies": {
       "firebase-admin": "^12.0.0",
       "firebase-functions": "^5.0.0"
     }
   }
   ```

2. **Migrate `functions/src/triggers/onScoreWrite.ts`:**
   ```typescript
   // FROM (v1)
   import * as functions from 'firebase-functions'
   export const onScoreWrite = functions.firestore
     .document('matches/{matchId}/scores/{scoreId}')
     .onWrite(...)

   // TO (v2)
   import { onDocumentWritten } from 'firebase-functions/v2/firestore'
   export const onScoreWrite = onDocumentWritten(
     'matches/{matchId}/scores/{scoreId}',
     async (event) => { ... }
   )
   ```

3. **Migrate `functions/src/triggers/onBetWrite.ts`:** Same pattern

4. **Migrate `functions/src/callable/consumeInvite.ts`:**
   ```typescript
   // FROM (v1)
   import * as functions from 'firebase-functions'
   export const consumeInvite = functions.https.onCall(...)

   // TO (v2)
   import { onCall, HttpsError } from 'firebase-functions/v2/https'
   export const consumeInvite = onCall(async (request) => {
     if (!request.auth) {
       throw new HttpsError('unauthenticated', '...')
     }
     // ...
   })
   ```

5. **Update `functions/src/index.ts`:**
   ```typescript
   import { initializeApp } from 'firebase-admin/app'
   initializeApp()

   export { onScoreWrite } from './triggers/onScoreWrite'
   export { onBetWrite } from './triggers/onBetWrite'
   export { consumeInvite } from './callable/consumeInvite'
   export { healthCheck } from './callable/healthCheck'
   ```

**Testing:**
```bash
cd functions
npm install
npm run build
npm run serve  # Test with emulator
```

**Success Criteria:**
- [ ] `functions/npm run build` passes
- [ ] All functions deploy to emulator
- [ ] Audit entries created on score/bet changes
- [ ] consumeInvite increments useCount

---

### Milestone 5: React Hooks Enhancement (2-3 hours)

**Objective:** Add real-time subscriptions and balance integration.

**Tasks:**

1. **Enhance `src/hooks/useMatch.ts`:**
   - Add `onSnapshot` for match document
   - Add `onSnapshot` for participants, bets, scores
   - Return unsubscribe cleanup

2. **Enhance `src/hooks/useScores.ts`:**
   - Add `onSnapshot` for real-time score updates
   - Add `saveScore` that calls `upsertScore`

3. **Enhance `src/hooks/useLedger.ts`:**
   - Integrate balance calculations
   - Return `balances`, `totalOwed`, `totalOwing`
   - Add `settle` function

**Key Pattern:**
```typescript
useEffect(() => {
  if (!matchId) return

  const unsubscribe = onSnapshot(
    matchDoc(matchId),
    (snap) => {
      if (snap.exists()) {
        setMatch(snap.data())
      }
    },
    (error) => {
      setError(error)
    }
  )

  return () => unsubscribe()
}, [matchId])
```

**Success Criteria:**
- [ ] Match data updates in real-time across tabs
- [ ] Score changes reflect immediately
- [ ] Ledger shows accurate balances
- [ ] No memory leaks (cleanup on unmount)

---

## Testing Strategy

### Unit Tests

| Module | Tests |
|--------|-------|
| `src/lib/ledger/balances.ts` | calculateBalances, totals, netting |
| `src/lib/firestore/*.ts` | Mock Firestore, verify data shapes |

### Integration Tests (Emulator)

| Test | Description |
|------|-------------|
| Match lifecycle | Create → Add participants → Start → Score → Complete |
| Score conflicts | Two tabs update same hole simultaneously |
| Invite flow | Create invite → Consume → Join match |
| Ledger settlement | Create entries → Calculate balances → Settle |

### Manual Tests

1. **Offline support:**
   - Enter scores while offline
   - Verify sync when online

2. **Real-time updates:**
   - Open match in two tabs
   - Enter score in one, verify update in other

3. **Balance accuracy:**
   - Create bet, enter scores
   - Verify ledger entries created
   - Verify balance calculations

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] `npm run build` succeeds (root)
- [ ] `npm run build` succeeds (functions)
- [ ] Emulator tests pass

### Deploy Sequence
1. Deploy indexes: `firebase deploy --only firestore:indexes`
2. Deploy rules: `firebase deploy --only firestore:rules`
3. Deploy functions: `firebase deploy --only functions`
4. Verify in Firebase Console

### Post-Deployment
- [ ] Health check endpoint responds
- [ ] Audit entries created on score changes
- [ ] Invite consumption works
- [ ] Real-time updates work in production

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing code | Review diffs carefully, test before merge |
| Cloud Functions v2 issues | Test thoroughly in emulator first |
| collectionGroup index delays | Deploy indexes early, wait for build |
| Real-time subscription leaks | Verify cleanup in useEffect |

---

## Timeline Summary

| Milestone | Estimated Time | Dependencies |
|-----------|----------------|--------------|
| M1: Foundation | 1-2 hours | None |
| M2: Data Access | 2-3 hours | M1 |
| M3: Balance Calculator | 1-2 hours | M2 |
| M4: Cloud Functions | 2-3 hours | M1 |
| M5: React Hooks | 2-3 hours | M2, M3 |
| **Total** | **8-13 hours** | |

---

## Notes

- **MVP Focus:** Don't over-engineer. Get it working first.
- **Existing Code:** Respect patterns already in place.
- **Testing:** Test each milestone before moving on.
- **Documentation:** Update CHANGELOG.md and ROADMAP.md after completion.
