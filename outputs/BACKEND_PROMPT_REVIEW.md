# Backend Prompt Review

> **Reviewer:** Claude
> **Date:** 2026-01-03
> **Files Reviewed:**
> - `outputs/prompts/BACKEND_ENGINEER_PROMPT.md`
> - `outputs/BACKEND_IMPLEMENTATION_PLAN.md`

---

## Executive Summary

Both documents contain useful structure and guidance, but have **significant issues** that would cause confusion or errors if followed directly:

| Issue Category | Severity | Count |
|----------------|----------|-------|
| Wrong file paths | Critical | 5 |
| Duplicate code proposals | High | 8 |
| Outdated API patterns | High | 4 |
| Type inconsistencies | Medium | 3 |
| Missing context | Medium | 6 |

---

## Critical Issues

### 1. Wrong File Paths (BOTH DOCUMENTS)

**Problem:** Documents reference `/Users/neilfrye/docs/AI/SideBets` but the actual codebase is at `/home/user/GolfBets`.

**Affected Lines:**
- BACKEND_ENGINEER_PROMPT.md: Line 23-24, 36
- BACKEND_IMPLEMENTATION_PLAN.md: Multiple references

**Fix:** Replace all path references:
```diff
- cd /Users/neilfrye/docs/AI/SideBets
+ cd /home/user/GolfBets
```

---

### 2. Proposing Files That Already Exist

**Problem:** The prompt proposes creating files that already exist in the codebase, which would cause overwrites or conflicts.

| Proposed File | Already Exists As | Status |
|---------------|-------------------|--------|
| `src/types/database.ts` | `src/types/index.ts` | Complete |
| `src/lib/firestore/collections.ts` | Same path | Complete |
| `src/lib/firestore/users.ts` | Same path | Exists |
| `src/lib/firestore/matches.ts` | Same path | Exists |
| `src/lib/firestore/scores.ts` | Same path | Exists |
| `src/lib/firestore/bets.ts` | Same path | Exists |
| `src/lib/firestore/ledger.ts` | Same path | Exists |
| `src/lib/firestore/invites.ts` | Same path | Exists |
| `src/hooks/useAuth.ts` | Same path | Complete |
| `src/hooks/useMatch.ts` | Same path | Exists |
| `src/hooks/useScores.ts` | Same path | Exists |
| `src/hooks/useLedger.ts` | Same path | Exists |
| `functions/src/index.ts` | Same path | Exists |

**Fix:** The prompts should:
1. Acknowledge existing files
2. Provide **diff-style updates** instead of full file replacements
3. Focus on gaps, not recreation

---

### 3. Type System Inconsistencies

**Problem:** BACKEND_ENGINEER_PROMPT.md proposes types with `Timestamp` fields, but the existing codebase uses `Date` with separate Firestore converter types.

**Existing Pattern (src/types/index.ts):**
```typescript
// Application types use Date
export interface User {
  createdAt: Date
  updatedAt: Date
}

// Separate Firestore types use Timestamp
export type FirestoreUser = Omit<User, 'createdAt' | 'updatedAt'> & {
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Prompt Proposes:**
```typescript
// Prompt mixes concerns - BAD
export interface User {
  createdAt: Timestamp  // Wrong - should be Date
  updatedAt: Timestamp
}
```

**Why This Matters:** The codebase uses `converters.ts` to handle Timestamp/Date conversion at the Firestore boundary. The prompt ignores this pattern.

**Fix:** Remove all Timestamp references from the proposed types. They should use `Date` and rely on existing converters.

---

### 4. Outdated Firebase APIs

**Problem:** Several deprecated or outdated patterns are used.

#### 4.1 Cloud Functions v1 Instead of v2

**Prompt Uses (v1 - deprecated):**
```typescript
import * as functions from 'firebase-functions'

export const onScoreWrite = functions.firestore
  .document('matches/{matchId}/scores/{scoreId}')
  .onWrite(...)
```

**Should Use (v2):**
```typescript
import { onDocumentWritten } from 'firebase-functions/v2/firestore'

export const onScoreWrite = onDocumentWritten(
  'matches/{matchId}/scores/{scoreId}',
  async (event) => { ... }
)
```

#### 4.2 Deprecated IndexedDB Persistence API

**Current (deprecated):**
```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore'
enableIndexedDbPersistence(db)
```

**Should Use:**
```typescript
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'

const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
})
```

---

### 5. Import Path Mismatches

**Problem:** Prompt references imports that don't match actual codebase structure.

| Prompt Import | Actual Import |
|---------------|---------------|
| `import { auth } from '@/lib/auth/config'` | `import { auth } from '@/lib/firebase'` |
| `import { generateInviteToken } from '@/lib/utils'` | Function exists in `matches.ts` locally |

---

### 6. Incorrect addParticipant Implementation

**Problem:** The proposed `addParticipant` function (lines 670-700) has convoluted logic with unnecessary dynamic imports and incorrect patterns.

**Prompt Code (problematic):**
```typescript
export async function addParticipant(matchId: string, data: ParticipantCreateData): Promise<Participant> {
  const participantRef = participantsCollection(matchId)
  const participantDoc = matchDoc(matchId).parent.parent?.collection('matches').doc(matchId).collection('participants').doc(data.userId)

  // Unnecessary dynamic import
  const { doc: firestoreDoc, setDoc: firestoreSetDoc } = await import('firebase/firestore')
  // ...
}
```

**Actual Pattern (from existing codebase):**
```typescript
export async function createParticipant(
  matchId: string,
  data: ParticipantCreateData
): Promise<Participant> {
  const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const docRef = participantDoc(matchId, participantId)
  await setDoc(docRef, participantData)
  return { id: participantId, ...participantData }
}
```

---

## High Severity Issues

### 7. Missing Converter Pattern Integration

**Problem:** The prompt creates collection references without converters, but the existing codebase uses converters for all collections.

**Existing Pattern:**
```typescript
export const matchesCollection = (): CollectionReference<Match> =>
  collection(getDb(), 'matches').withConverter(matchConverter)
```

**Prompt Ignores This:**
```typescript
export const matchesCollection = collection(db, 'matches') as CollectionReference<Match>
```

**Impact:** Type safety is lost at Firestore boundary; Timestamp/Date conversion won't work.

---

### 8. Redundant Function Implementations

**Problem:** Prompt proposes functions that already exist with different signatures.

| Prompt Function | Existing Function | Difference |
|-----------------|-------------------|------------|
| `createMatch(data)` | `createMatch(userId, data)` | Different signature |
| `updateMatch(id, data)` | `updateMatchStatus(id, status)` | More specific existing function |
| `addParticipant(id, data)` | `addParticipantToMatch(id, userId)` | Different approach |

---

### 9. Cloud Functions Callable Pattern Issues

**Problem:** The `createLedgerEntries` callable function in the prompt bypasses security by allowing any participant to create ledger entries.

**Security Concern:**
```typescript
// Anyone in match can create arbitrary ledger entries - BAD
if (!match.participantIds.includes(context.auth.uid)) {
  throw new functions.https.HttpsError('permission-denied', ...)
}
// No validation of entry amounts, no verification of bet results
```

**Should Be:** Ledger entries should only be created by:
1. Cloud Functions after verifying bet calculations
2. With validation of amounts against actual bet results
3. With additional verification (e.g., scorer confirmation)

---

## Medium Severity Issues

### 10. Missing Error Handling Consistency

**Problem:** Some functions have try/catch, others don't. No consistent error handling pattern.

**Example (inconsistent):**
```typescript
// Has error handling
export async function getUser(userId: string): Promise<User | null> {
  const snap = await getDoc(userDoc(userId))  // No try/catch
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as User
}
```

**Existing Pattern:**
```typescript
export async function getMatch(matchId: string): Promise<Match | null> {
  try {
    const snapshot = await getDoc(matchDoc(matchId))
    return snapshot.exists() ? snapshot.data() : null
  } catch (error) {
    console.error('Error fetching match:', error)
    throw error
  }
}
```

---

### 11. Missing matchId in Subcollection Types

**Problem:** Prompt types for Score, Bet, LedgerEntry don't include `matchId` field, but functions expect it.

**In Types:**
```typescript
export interface Score {
  id: string
  participantId: string
  holeNumber: number
  // No matchId!
}
```

**In Functions:**
```typescript
return { id: doc.id, matchId, ...doc.data() } as Score  // Adds matchId
```

---

### 12. Invite Storage Location Mismatch

**Problem:** Prompt stores invites in root `invites` collection, but `matches.ts` stores them as subcollection `matches/{matchId}/invites`.

**Prompt:**
```typescript
export const invitesCollection = collection(db, 'invites')
```

**Existing Code:**
```typescript
const inviteRef = doc(getFirestore(), `matches/${matchId}/invites`, inviteId)
```

**Impact:** Queries will fail; invites won't be found.

---

## BACKEND_IMPLEMENTATION_PLAN.md Specific Issues

### 13. Doesn't Acknowledge Existing Code

**Problem:** Plan says "Files to Create" but most files already exist.

**Fix:** Add "Existing Files" section and change to "Files to Update":
```markdown
### Existing Files (Review and Update)
- `src/types/index.ts` - Already complete
- `src/lib/firestore/collections.ts` - Already complete with converters
- `src/lib/firestore/*.ts` - Already exist, may need updates

### Files to Create
- `src/lib/ledger/balances.ts` - New file for balance calculations
```

---

### 14. Missing Composite Index Requirements

**Problem:** Plan mentions `collectionGroup` queries but doesn't specify required indexes.

**Required Index (firestore.indexes.json):**
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

---

## Recommended Fixes

### Fix 1: Update Path References

Replace all instances of:
- `/Users/neilfrye/docs/AI/SideBets` with `/home/user/GolfBets`

### Fix 2: Change "Create" to "Update" for Existing Files

The prompts should use diff-style updates:
```markdown
### Update: src/lib/firestore/matches.ts

Add the following function after `getMatch`:

```typescript
export async function getActiveMatches(userId: string): Promise<Match[]> {
  return getUserMatches(userId, 'active')
}
```
```

### Fix 3: Remove Type Duplications

Instead of full type definitions, reference existing:
```markdown
Types are already defined in `src/types/index.ts`.
Verify the following types exist:
- [ ] User, FirestoreUser
- [ ] Match, FirestoreMatch
- [ ] Participant, FirestoreParticipant
...
```

### Fix 4: Upgrade to Cloud Functions v2

Update all trigger examples:
```typescript
// Before (v1)
import * as functions from 'firebase-functions'
export const onScoreWrite = functions.firestore.document(...).onWrite(...)

// After (v2)
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
export const onScoreWrite = onDocumentWritten('matches/{matchId}/scores/{scoreId}', ...)
```

### Fix 5: Add Existing File Inventory

Add to BACKEND_IMPLEMENTATION_PLAN.md:
```markdown
## Current Codebase State

### Already Implemented
| File | Status | Notes |
|------|--------|-------|
| `src/types/index.ts` | Complete | All 8 entity types + Firestore converters |
| `src/lib/firestore/collections.ts` | Complete | With converters |
| `src/lib/firestore/converters.ts` | Complete | Timestamp/Date conversion |
| `src/lib/firestore/users.ts` | Partial | Has CRUD, needs activity tracking |
| `src/lib/firestore/matches.ts` | Partial | Has CRUD + invites |
| `src/hooks/useAuth.ts` | Complete | Auth state + user sync |

### Needs Implementation
| File | Priority | Notes |
|------|----------|-------|
| `src/lib/ledger/balances.ts` | High | Balance calculation logic |
| Cloud Functions v2 migration | Medium | Currently using v1 |
```

### Fix 6: Align Invite Storage

Decide on one location and update both:
- Option A: Root collection `invites` (simpler queries)
- Option B: Subcollection `matches/{matchId}/invites` (better security rules)

Existing code uses Option B. Update prompt to match.

---

## Summary of Required Changes

### BACKEND_ENGINEER_PROMPT.md
1. Fix all path references
2. Remove duplicate type definitions (reference existing)
3. Change file creation to file updates
4. Update Cloud Functions to v2 API
5. Fix import paths
6. Remove redundant function implementations
7. Add converter pattern to all collection references
8. Fix addParticipant implementation
9. Align invite storage with existing code

### BACKEND_IMPLEMENTATION_PLAN.md
1. Fix all path references
2. Add "Existing Files" inventory
3. Change "Files to Create" to "Files to Update" where applicable
4. Add composite index requirements
5. Update Firebase SDK patterns to current best practices
6. Add migration notes for Cloud Functions v1 -> v2

---

## Conclusion

The core structure and phased approach in both documents is sound. However, executing them as-is would:
1. Overwrite existing working code
2. Introduce API inconsistencies
3. Break the converter pattern
4. Use deprecated Firebase APIs

Recommend updating both documents before using them as implementation guides.
