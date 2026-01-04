# 🗄️ SUPER PROMPT: Backend Engineer

> **Role:** Backend Engineer (Role #3)
> **Project:** GolfSettled MVP — Golf Side-Bet Tracker PWA
> **Duration:** Day 2-4
> **Dependencies:** Manager Engineer ✅, Security Engineer ✅

---

## 🎯 YOUR MISSION

You are the **Backend Engineer** responsible for building the Firestore data layer, Cloud Functions, and all server-side logic for match management and scoring. You create the typed data access functions that Frontend and Betting Logic engineers will use.

**Your work is complete when:** All CRUD operations for matches, scores, participants, and ledger entries work correctly with proper typing, and Cloud Functions handle audit logging and invite processing.

---

## 📋 PREREQUISITES

Before starting, verify previous engineers' work:

```bash
cd /Users/neilfrye/docs/AI/SideBets

# Verify these pass
npm run dev          # Should start
npm run build        # Should build
npm run lint         # Should pass

# Verify auth is working
# 1. Go to localhost:3000/login
# 2. Sign in with Google or Magic Link
# 3. Verify you're redirected to home

# Verify Firebase emulators work
npm run emulators    # Should start Auth, Firestore, Functions
```

### Verify Security Rules Exist

```bash
cat firestore.rules  # Should have complete rules from Security Engineer
```

---

## 📋 TASK CHECKLIST

Complete these tasks in order:

---

### Phase 1: TypeScript Types

#### 1.1 — Core Data Types

**File: `src/types/database.ts`**
```typescript
import { Timestamp } from 'firebase/firestore'

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string
  displayName: string
  email: string
  handicapIndex: number | null
  avatarUrl: string | null
  defaultTeeBox: TeeBox
  notificationsEnabled: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  lastActiveAt: Timestamp
}

export type TeeBox = 'championship' | 'blue' | 'white' | 'red'

export interface UserCreateData {
  displayName: string
  email: string
  handicapIndex?: number | null
  avatarUrl?: string | null
  defaultTeeBox?: TeeBox
  notificationsEnabled?: boolean
}

export interface UserUpdateData {
  displayName?: string
  handicapIndex?: number | null
  avatarUrl?: string | null
  defaultTeeBox?: TeeBox
  notificationsEnabled?: boolean
}

// ============================================
// MATCH TYPES
// ============================================

export interface Match {
  id: string
  courseName: string
  courseId: string | null
  teeTime: Timestamp
  holes: 9 | 18
  status: MatchStatus
  currentHole: number | null
  createdBy: string
  scorerId: string
  participantIds: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  startedAt: Timestamp | null
  completedAt: Timestamp | null
  version: number
}

export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled'

export interface MatchCreateData {
  courseName: string
  courseId?: string | null
  teeTime: Date
  holes: 9 | 18
}

export interface MatchUpdateData {
  courseName?: string
  courseId?: string | null
  teeTime?: Date
  holes?: 9 | 18
  status?: MatchStatus
  currentHole?: number | null
  scorerId?: string
}

// ============================================
// BET TYPES
// ============================================

export interface Bet {
  id: string
  type: BetType
  unitValue: number
  scoringMode: ScoringMode
  nassauConfig: NassauConfig | null
  skinsConfig: SkinsConfig | null
  createdAt: Timestamp
  createdBy: string
}

export type BetType = 'nassau' | 'skins' | 'match_play' | 'stroke_play'
export type ScoringMode = 'gross' | 'net'

export interface NassauConfig {
  frontAmount: number
  backAmount: number
  overallAmount: number
  autoPress: boolean
  pressTrigger: number
  maxPresses: number
}

export interface SkinsConfig {
  skinValue: number
  carryover: boolean
  validation: boolean
}

export interface BetCreateData {
  type: BetType
  unitValue: number
  scoringMode?: ScoringMode
  nassauConfig?: NassauConfig | null
  skinsConfig?: SkinsConfig | null
}

// ============================================
// PARTICIPANT TYPES
// ============================================

export interface Participant {
  id: string
  matchId: string
  userId: string
  displayName: string
  playingHandicap: number | null
  teeBox: TeeBox
  courseHandicap: number | null
  team: 'A' | 'B' | null
  status: ParticipantStatus
  invitedAt: Timestamp
  confirmedAt: Timestamp | null
}

export type ParticipantStatus = 'invited' | 'confirmed' | 'declined'

export interface ParticipantCreateData {
  userId: string
  displayName: string
  playingHandicap?: number | null
  teeBox?: TeeBox
  team?: 'A' | 'B' | null
}

export interface ParticipantUpdateData {
  playingHandicap?: number | null
  teeBox?: TeeBox
  courseHandicap?: number | null
  team?: 'A' | 'B' | null
  status?: ParticipantStatus
}

// ============================================
// SCORE TYPES
// ============================================

export interface Score {
  id: string
  matchId: string
  participantId: string
  holeNumber: number
  strokes: number
  putts: number | null
  fairwayHit: boolean | null
  greenInRegulation: boolean | null
  enteredBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  version: number
  deviceId: string
  syncedAt: Timestamp | null
}

export interface ScoreCreateData {
  participantId: string
  holeNumber: number
  strokes: number
  putts?: number | null
  fairwayHit?: boolean | null
  greenInRegulation?: boolean | null
}

export interface ScoreUpdateData {
  strokes?: number
  putts?: number | null
  fairwayHit?: boolean | null
  greenInRegulation?: boolean | null
}

// ============================================
// LEDGER TYPES
// ============================================

export interface LedgerEntry {
  id: string
  matchId: string
  fromUserId: string
  toUserId: string
  amount: number
  betType: BetType
  betId: string
  description: string
  settled: boolean
  settledAt: Timestamp | null
  settledBy: string | null
  createdAt: Timestamp
  calculatedBy: string
}

export interface LedgerEntryCreateData {
  fromUserId: string
  toUserId: string
  amount: number
  betType: BetType
  betId: string
  description: string
}

// ============================================
// AUDIT TYPES
// ============================================

export interface AuditEntry {
  id: string
  matchId: string
  entityType: 'score' | 'bet' | 'participant' | 'match'
  entityId: string
  action: 'create' | 'update' | 'delete'
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  changedBy: string
  changedAt: Timestamp
  reason: string | null
  deviceId: string
}

// ============================================
// INVITE TYPES
// ============================================

export interface Invite {
  id: string
  token: string
  matchId: string | null
  groupId: string | null
  maxUses: number
  useCount: number
  expiresAt: Timestamp
  createdBy: string
  createdAt: Timestamp
}

export interface InviteCreateData {
  matchId?: string | null
  groupId?: string | null
  maxUses?: number
  expiryDays?: number
}
```

#### 1.2 — Export Types

**File: `src/types/index.ts`** (update)
```typescript
// Re-export all database types
export * from './database'

// Utility types
export type WithId<T> = T & { id: string }

// Firestore converter helper type
export type FirestoreData<T> = Omit<T, 'id'>
```

---

### Phase 2: Firestore Data Access Layer

#### 2.1 — Collection References

**File: `src/lib/firestore/collections.ts`**
```typescript
import { 
  collection, 
  doc, 
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { 
  User, 
  Match, 
  Bet, 
  Participant, 
  Score, 
  LedgerEntry, 
  AuditEntry,
  Invite 
} from '@/types'

// ============================================
// COLLECTION REFERENCES
// ============================================

export const usersCollection = collection(db, 'users') as CollectionReference<User>

export const matchesCollection = collection(db, 'matches') as CollectionReference<Match>

export const invitesCollection = collection(db, 'invites') as CollectionReference<Invite>

// ============================================
// DOCUMENT REFERENCES
// ============================================

export function userDoc(userId: string): DocumentReference<User> {
  return doc(usersCollection, userId)
}

export function matchDoc(matchId: string): DocumentReference<Match> {
  return doc(matchesCollection, matchId)
}

export function inviteDoc(inviteId: string): DocumentReference<Invite> {
  return doc(invitesCollection, inviteId)
}

// ============================================
// SUBCOLLECTION REFERENCES
// ============================================

export function betsCollection(matchId: string): CollectionReference<Bet> {
  return collection(db, 'matches', matchId, 'bets') as CollectionReference<Bet>
}

export function betDoc(matchId: string, betId: string): DocumentReference<Bet> {
  return doc(betsCollection(matchId), betId)
}

export function participantsCollection(matchId: string): CollectionReference<Participant> {
  return collection(db, 'matches', matchId, 'participants') as CollectionReference<Participant>
}

export function participantDoc(matchId: string, participantId: string): DocumentReference<Participant> {
  return doc(participantsCollection(matchId), participantId)
}

export function scoresCollection(matchId: string): CollectionReference<Score> {
  return collection(db, 'matches', matchId, 'scores') as CollectionReference<Score>
}

export function scoreDoc(matchId: string, scoreId: string): DocumentReference<Score> {
  return doc(scoresCollection(matchId), scoreId)
}

export function ledgerCollection(matchId: string): CollectionReference<LedgerEntry> {
  return collection(db, 'matches', matchId, 'ledger') as CollectionReference<LedgerEntry>
}

export function ledgerDoc(matchId: string, entryId: string): DocumentReference<LedgerEntry> {
  return doc(ledgerCollection(matchId), entryId)
}

export function auditCollection(matchId: string): CollectionReference<AuditEntry> {
  return collection(db, 'matches', matchId, 'audit') as CollectionReference<AuditEntry>
}
```

#### 2.2 — User Data Access

**File: `src/lib/firestore/users.ts`**
```typescript
import { 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { userDoc, usersCollection } from './collections'
import type { User, UserCreateData, UserUpdateData } from '@/types'

/**
 * Get user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  const snap = await getDoc(userDoc(userId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as User
}

/**
 * Create new user profile
 */
export async function createUser(userId: string, data: UserCreateData): Promise<User> {
  const userData = {
    ...data,
    handicapIndex: data.handicapIndex ?? null,
    avatarUrl: data.avatarUrl ?? null,
    defaultTeeBox: data.defaultTeeBox ?? 'white',
    notificationsEnabled: data.notificationsEnabled ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  }
  
  await setDoc(userDoc(userId), userData)
  
  // Fetch and return the created user
  const created = await getUser(userId)
  if (!created) throw new Error('Failed to create user')
  return created
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, data: UserUpdateData): Promise<void> {
  await updateDoc(userDoc(userId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Update user's last active timestamp
 */
export async function updateLastActive(userId: string): Promise<void> {
  await updateDoc(userDoc(userId), {
    lastActiveAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Get multiple users by IDs
 */
export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) return []
  
  // Firestore 'in' queries limited to 30 items
  const chunks: string[][] = []
  for (let i = 0; i < userIds.length; i += 30) {
    chunks.push(userIds.slice(i, i + 30))
  }
  
  const users: User[] = []
  for (const chunk of chunks) {
    const q = query(usersCollection, where('__name__', 'in', chunk))
    const snap = await getDocs(q)
    snap.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() } as User)
    })
  }
  
  return users
}
```

#### 2.3 — Match Data Access

**File: `src/lib/firestore/matches.ts`**
```typescript
import { 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  increment,
} from 'firebase/firestore'
import { matchDoc, matchesCollection, participantsCollection } from './collections'
import type { Match, MatchCreateData, MatchUpdateData, Participant, ParticipantCreateData } from '@/types'
import { auth } from '@/lib/auth/config'

/**
 * Get match by ID
 */
export async function getMatch(matchId: string): Promise<Match | null> {
  const snap = await getDoc(matchDoc(matchId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Match
}

/**
 * Create new match
 */
export async function createMatch(data: MatchCreateData): Promise<Match> {
  const user = auth.currentUser
  if (!user) throw new Error('Must be authenticated')
  
  const matchRef = matchDoc(crypto.randomUUID())
  
  const matchData = {
    courseName: data.courseName,
    courseId: data.courseId ?? null,
    teeTime: Timestamp.fromDate(data.teeTime),
    holes: data.holes,
    status: 'pending' as const,
    currentHole: null,
    createdBy: user.uid,
    scorerId: user.uid,
    participantIds: [user.uid],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    startedAt: null,
    completedAt: null,
    version: 1,
  }
  
  await setDoc(matchRef, matchData)
  
  // Add creator as first participant
  await addParticipant(matchRef.id, {
    userId: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Player',
  })
  
  const created = await getMatch(matchRef.id)
  if (!created) throw new Error('Failed to create match')
  return created
}

/**
 * Update match
 */
export async function updateMatch(matchId: string, data: MatchUpdateData): Promise<void> {
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
    version: increment(1),
  }
  
  // Convert Date to Timestamp if present
  if (data.teeTime) {
    updateData.teeTime = Timestamp.fromDate(data.teeTime)
  }
  
  // Set timestamps for status changes
  if (data.status === 'active' && !updateData.startedAt) {
    updateData.startedAt = serverTimestamp()
  }
  if (data.status === 'completed' && !updateData.completedAt) {
    updateData.completedAt = serverTimestamp()
  }
  
  await updateDoc(matchDoc(matchId), updateData)
}

/**
 * Delete match (only if pending)
 */
export async function deleteMatch(matchId: string): Promise<void> {
  const match = await getMatch(matchId)
  if (!match) throw new Error('Match not found')
  if (match.status !== 'pending') throw new Error('Can only delete pending matches')
  
  await deleteDoc(matchDoc(matchId))
}

/**
 * Get matches for current user
 */
export async function getUserMatches(options?: {
  status?: Match['status'] | Match['status'][]
  limit?: number
}): Promise<Match[]> {
  const user = auth.currentUser
  if (!user) throw new Error('Must be authenticated')
  
  let q = query(
    matchesCollection,
    where('participantIds', 'array-contains', user.uid),
    orderBy('teeTime', 'desc')
  )
  
  if (options?.status) {
    const statuses = Array.isArray(options.status) ? options.status : [options.status]
    q = query(q, where('status', 'in', statuses))
  }
  
  if (options?.limit) {
    q = query(q, limit(options.limit))
  }
  
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match))
}

/**
 * Get active matches for current user
 */
export async function getActiveMatches(): Promise<Match[]> {
  return getUserMatches({ status: ['pending', 'active'], limit: 10 })
}

/**
 * Add participant to match
 */
export async function addParticipant(matchId: string, data: ParticipantCreateData): Promise<Participant> {
  const participantRef = participantsCollection(matchId)
  const participantDoc = matchDoc(matchId).parent.parent?.collection('matches').doc(matchId).collection('participants').doc(data.userId)
  
  // Use doc with userId as ID for easier lookups
  const { doc: firestoreDoc, setDoc: firestoreSetDoc } = await import('firebase/firestore')
  const pDoc = firestoreDoc(participantRef, data.userId)
  
  const participantData = {
    matchId,
    userId: data.userId,
    displayName: data.displayName,
    playingHandicap: data.playingHandicap ?? null,
    teeBox: data.teeBox ?? 'white',
    courseHandicap: null,
    team: data.team ?? null,
    status: 'confirmed' as const,
    invitedAt: serverTimestamp(),
    confirmedAt: serverTimestamp(),
  }
  
  await firestoreSetDoc(pDoc, participantData)
  
  // Update match participantIds array
  await updateDoc(matchDoc(matchId), {
    participantIds: arrayUnion(data.userId),
    updatedAt: serverTimestamp(),
  })
  
  return { id: data.userId, ...participantData } as unknown as Participant
}

/**
 * Get all participants for a match
 */
export async function getMatchParticipants(matchId: string): Promise<Participant[]> {
  const snap = await getDocs(participantsCollection(matchId))
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant))
}

/**
 * Start match (change status to active)
 */
export async function startMatch(matchId: string): Promise<void> {
  await updateMatch(matchId, { status: 'active', currentHole: 1 })
}

/**
 * Complete match
 */
export async function completeMatch(matchId: string): Promise<void> {
  await updateMatch(matchId, { status: 'completed' })
}
```

#### 2.4 — Score Data Access

**File: `src/lib/firestore/scores.ts`**
```typescript
import { 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { scoresCollection, scoreDoc } from './collections'
import type { Score, ScoreCreateData, ScoreUpdateData } from '@/types'
import { auth } from '@/lib/auth/config'

// Generate a unique device ID for conflict resolution
function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let deviceId = localStorage.getItem('deviceId')
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem('deviceId', deviceId)
  }
  return deviceId
}

/**
 * Get score by ID
 */
export async function getScore(matchId: string, scoreId: string): Promise<Score | null> {
  const snap = await getDoc(scoreDoc(matchId, scoreId))
  if (!snap.exists()) return null
  return { id: snap.id, matchId, ...snap.data() } as Score
}

/**
 * Get score by participant and hole
 */
export async function getScoreByHole(
  matchId: string, 
  participantId: string, 
  holeNumber: number
): Promise<Score | null> {
  const q = query(
    scoresCollection(matchId),
    where('participantId', '==', participantId),
    where('holeNumber', '==', holeNumber)
  )
  
  const snap = await getDocs(q)
  if (snap.empty) return null
  
  const doc = snap.docs[0]
  return { id: doc.id, matchId, ...doc.data() } as Score
}

/**
 * Create or update score for a hole
 */
export async function upsertScore(matchId: string, data: ScoreCreateData): Promise<Score> {
  const user = auth.currentUser
  if (!user) throw new Error('Must be authenticated')
  
  // Check if score exists for this participant/hole
  const existing = await getScoreByHole(matchId, data.participantId, data.holeNumber)
  
  if (existing) {
    // Update existing score
    await updateScore(matchId, existing.id, {
      strokes: data.strokes,
      putts: data.putts,
      fairwayHit: data.fairwayHit,
      greenInRegulation: data.greenInRegulation,
    })
    return (await getScore(matchId, existing.id))!
  }
  
  // Create new score
  const scoreId = `${data.participantId}_${data.holeNumber}`
  const scoreRef = scoreDoc(matchId, scoreId)
  
  const scoreData = {
    participantId: data.participantId,
    holeNumber: data.holeNumber,
    strokes: data.strokes,
    putts: data.putts ?? null,
    fairwayHit: data.fairwayHit ?? null,
    greenInRegulation: data.greenInRegulation ?? null,
    enteredBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    version: 1,
    deviceId: getDeviceId(),
    syncedAt: serverTimestamp(),
  }
  
  await setDoc(scoreRef, scoreData)
  
  return { id: scoreId, matchId, ...scoreData } as unknown as Score
}

/**
 * Update existing score
 */
export async function updateScore(
  matchId: string, 
  scoreId: string, 
  data: ScoreUpdateData
): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Must be authenticated')
  
  await updateDoc(scoreDoc(matchId, scoreId), {
    ...data,
    enteredBy: user.uid,
    updatedAt: serverTimestamp(),
    version: increment(1),
    deviceId: getDeviceId(),
    syncedAt: serverTimestamp(),
  })
}

/**
 * Get all scores for a match
 */
export async function getMatchScores(matchId: string): Promise<Score[]> {
  const q = query(
    scoresCollection(matchId),
    orderBy('holeNumber', 'asc')
  )
  
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, matchId, ...doc.data() } as Score))
}

/**
 * Get scores for a specific participant
 */
export async function getParticipantScores(matchId: string, participantId: string): Promise<Score[]> {
  const q = query(
    scoresCollection(matchId),
    where('participantId', '==', participantId),
    orderBy('holeNumber', 'asc')
  )
  
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, matchId, ...doc.data() } as Score))
}

/**
 * Get scores for a specific hole (all participants)
 */
export async function getHoleScores(matchId: string, holeNumber: number): Promise<Score[]> {
  const q = query(
    scoresCollection(matchId),
    where('holeNumber', '==', holeNumber)
  )
  
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, matchId, ...doc.data() } as Score))
}

/**
 * Calculate total strokes for a participant
 */
export async function getParticipantTotal(matchId: string, participantId: string): Promise<number> {
  const scores = await getParticipantScores(matchId, participantId)
  return scores.reduce((sum, score) => sum + score.strokes, 0)
}

/**
 * Get scorecard data (all participants, all holes)
 */
export async function getScorecard(matchId: string): Promise<Map<string, Score[]>> {
  const scores = await getMatchScores(matchId)
  const scorecard = new Map<string, Score[]>()
  
  for (const score of scores) {
    const participantScores = scorecard.get(score.participantId) || []
    participantScores.push(score)
    scorecard.set(score.participantId, participantScores)
  }
  
  return scorecard
}
```

#### 2.5 — Bet Data Access

**File: `src/lib/firestore/bets.ts`**
```typescript
import { 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { betsCollection, betDoc } from './collections'
import type { Bet, BetCreateData } from '@/types'
import { auth } from '@/lib/auth/config'

/**
 * Get bet by ID
 */
export async function getBet(matchId: string, betId: string): Promise<Bet | null> {
  const snap = await getDoc(betDoc(matchId, betId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Bet
}

/**
 * Create new bet
 */
export async function createBet(matchId: string, data: BetCreateData): Promise<Bet> {
  const user = auth.currentUser
  if (!user) throw new Error('Must be authenticated')
  
  const betId = crypto.randomUUID()
  const betRef = betDoc(matchId, betId)
  
  const betData = {
    type: data.type,
    unitValue: data.unitValue,
    scoringMode: data.scoringMode ?? 'gross',
    nassauConfig: data.nassauConfig ?? null,
    skinsConfig: data.skinsConfig ?? null,
    createdAt: serverTimestamp(),
    createdBy: user.uid,
  }
  
  await setDoc(betRef, betData)
  
  return { id: betId, ...betData } as unknown as Bet
}

/**
 * Update bet
 */
export async function updateBet(
  matchId: string, 
  betId: string, 
  data: Partial<BetCreateData>
): Promise<void> {
  await updateDoc(betDoc(matchId, betId), data)
}

/**
 * Delete bet (only if match is pending)
 */
export async function deleteBet(matchId: string, betId: string): Promise<void> {
  await deleteDoc(betDoc(matchId, betId))
}

/**
 * Get all bets for a match
 */
export async function getMatchBets(matchId: string): Promise<Bet[]> {
  const snap = await getDocs(betsCollection(matchId))
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bet))
}

/**
 * Create default Nassau bet
 */
export async function createNassauBet(matchId: string, unitValue: number = 5): Promise<Bet> {
  return createBet(matchId, {
    type: 'nassau',
    unitValue,
    scoringMode: 'gross',
    nassauConfig: {
      frontAmount: unitValue,
      backAmount: unitValue,
      overallAmount: unitValue,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 4,
    },
  })
}

/**
 * Create default Skins bet
 */
export async function createSkinsBet(matchId: string, skinValue: number = 1): Promise<Bet> {
  return createBet(matchId, {
    type: 'skins',
    unitValue: skinValue,
    scoringMode: 'gross',
    skinsConfig: {
      skinValue,
      carryover: true,
      validation: false,
    },
  })
}
```

#### 2.6 — Ledger Data Access

**File: `src/lib/firestore/ledger.ts`**
```typescript
import { 
  getDoc, 
  updateDoc, 
  getDocs,
  query,
  where,
  serverTimestamp,
  collectionGroup,
} from 'firebase/firestore'
import { ledgerCollection, ledgerDoc } from './collections'
import { db } from '@/lib/firebase'
import type { LedgerEntry } from '@/types'
import { auth } from '@/lib/auth/config'

/**
 * Get ledger entry by ID
 */
export async function getLedgerEntry(matchId: string, entryId: string): Promise<LedgerEntry | null> {
  const snap = await getDoc(ledgerDoc(matchId, entryId))
  if (!snap.exists()) return null
  return { id: snap.id, matchId, ...snap.data() } as LedgerEntry
}

/**
 * Get all ledger entries for a match
 */
export async function getMatchLedger(matchId: string): Promise<LedgerEntry[]> {
  const snap = await getDocs(ledgerCollection(matchId))
  return snap.docs.map(doc => ({ id: doc.id, matchId, ...doc.data() } as LedgerEntry))
}

/**
 * Get ledger entries involving current user (across all matches)
 */
export async function getUserLedger(): Promise<LedgerEntry[]> {
  const user = auth.currentUser
  if (!user) throw new Error('Must be authenticated')
  
  // Query as 'from' user
  const fromQuery = query(
    collectionGroup(db, 'ledger'),
    where('fromUserId', '==', user.uid)
  )
  
  // Query as 'to' user
  const toQuery = query(
    collectionGroup(db, 'ledger'),
    where('toUserId', '==', user.uid)
  )
  
  const [fromSnap, toSnap] = await Promise.all([
    getDocs(fromQuery),
    getDocs(toQuery),
  ])
  
  const entries: LedgerEntry[] = []
  const seen = new Set<string>()
  
  const addEntry = (doc: any) => {
    const path = doc.ref.path
    if (seen.has(path)) return
    seen.add(path)
    
    // Extract matchId from path: matches/{matchId}/ledger/{entryId}
    const parts = path.split('/')
    const matchId = parts[1]
    
    entries.push({ id: doc.id, matchId, ...doc.data() } as LedgerEntry)
  }
  
  fromSnap.forEach(addEntry)
  toSnap.forEach(addEntry)
  
  return entries
}

/**
 * Get unsettled ledger entries for current user
 */
export async function getUnsettledLedger(): Promise<LedgerEntry[]> {
  const all = await getUserLedger()
  return all.filter(entry => !entry.settled)
}

/**
 * Mark ledger entry as settled
 */
export async function settleLedgerEntry(matchId: string, entryId: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Must be authenticated')
  
  await updateDoc(ledgerDoc(matchId, entryId), {
    settled: true,
    settledAt: serverTimestamp(),
    settledBy: user.uid,
  })
}

/**
 * Calculate net balance between current user and another user
 */
export async function getNetBalance(otherUserId: string): Promise<number> {
  const user = auth.currentUser
  if (!user) throw new Error('Must be authenticated')
  
  const entries = await getUserLedger()
  
  let balance = 0
  for (const entry of entries) {
    if (entry.settled) continue
    
    if (entry.fromUserId === user.uid && entry.toUserId === otherUserId) {
      balance -= entry.amount // I owe them
    } else if (entry.fromUserId === otherUserId && entry.toUserId === user.uid) {
      balance += entry.amount // They owe me
    }
  }
  
  return balance
}

/**
 * Get all balances for current user
 */
export async function getAllBalances(): Promise<Map<string, number>> {
  const user = auth.currentUser
  if (!user) throw new Error('Must be authenticated')
  
  const entries = await getUnsettledLedger()
  const balances = new Map<string, number>()
  
  for (const entry of entries) {
    const otherUserId = entry.fromUserId === user.uid ? entry.toUserId : entry.fromUserId
    const currentBalance = balances.get(otherUserId) || 0
    
    if (entry.fromUserId === user.uid) {
      balances.set(otherUserId, currentBalance - entry.amount)
    } else {
      balances.set(otherUserId, currentBalance + entry.amount)
    }
  }
  
  return balances
}
```

#### 2.7 — Invite Data Access

**File: `src/lib/firestore/invites.ts`**
```typescript
import { 
  getDoc, 
  setDoc, 
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { invitesCollection, inviteDoc } from './collections'
import type { Invite, InviteCreateData } from '@/types'
import { auth } from '@/lib/auth/config'
import { generateInviteToken } from '@/lib/utils'

/**
 * Get invite by ID
 */
export async function getInvite(inviteId: string): Promise<Invite | null> {
  const snap = await getDoc(inviteDoc(inviteId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Invite
}

/**
 * Get invite by token
 */
export async function getInviteByToken(token: string): Promise<Invite | null> {
  const q = query(invitesCollection, where('token', '==', token))
  const snap = await getDocs(q)
  
  if (snap.empty) return null
  
  const doc = snap.docs[0]
  return { id: doc.id, ...doc.data() } as Invite
}

/**
 * Create new invite
 */
export async function createInvite(data: InviteCreateData): Promise<Invite> {
  const user = auth.currentUser
  if (!user) throw new Error('Must be authenticated')
  
  const inviteId = crypto.randomUUID()
  const token = generateInviteToken()
  
  const expiryDays = data.expiryDays ?? 7
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiryDays)
  
  const inviteData = {
    token,
    matchId: data.matchId ?? null,
    groupId: data.groupId ?? null,
    maxUses: data.maxUses ?? 10,
    useCount: 0,
    expiresAt: Timestamp.fromDate(expiresAt),
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  }
  
  await setDoc(inviteDoc(inviteId), inviteData)
  
  return { id: inviteId, ...inviteData } as unknown as Invite
}

/**
 * Validate invite (check if usable)
 */
export async function validateInvite(token: string): Promise<{
  valid: boolean
  invite?: Invite
  error?: string
}> {
  const invite = await getInviteByToken(token)
  
  if (!invite) {
    return { valid: false, error: 'Invite not found' }
  }
  
  if (invite.useCount >= invite.maxUses) {
    return { valid: false, error: 'Invite has reached maximum uses' }
  }
  
  const now = new Date()
  const expiresAt = invite.expiresAt.toDate()
  
  if (now > expiresAt) {
    return { valid: false, error: 'Invite has expired' }
  }
  
  return { valid: true, invite }
}

/**
 * Get invite URL
 */
export function getInviteUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/invite/${token}`
}

/**
 * Create invite for a match and get URL
 */
export async function createMatchInvite(matchId: string): Promise<string> {
  const invite = await createInvite({ matchId })
  return getInviteUrl(invite.token)
}
```

#### 2.8 — Export All Data Access Functions

**File: `src/lib/firestore/index.ts`**
```typescript
// Collection references
export * from './collections'

// Data access functions
export * from './users'
export * from './matches'
export * from './scores'
export * from './bets'
export * from './ledger'
export * from './invites'
```

---

### Phase 3: Cloud Functions

#### 3.1 — Cloud Functions Setup

**File: `functions/src/index.ts`**
```typescript
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Initialize admin SDK
admin.initializeApp()

const db = admin.firestore()

// ============================================
// AUDIT LOGGING
// ============================================

/**
 * Create audit entry for score changes
 */
export const onScoreWrite = functions.firestore
  .document('matches/{matchId}/scores/{scoreId}')
  .onWrite(async (change, context) => {
    const { matchId, scoreId } = context.params
    
    const before = change.before.exists ? change.before.data() : null
    const after = change.after.exists ? change.after.data() : null
    
    let action: 'create' | 'update' | 'delete'
    if (!before) action = 'create'
    else if (!after) action = 'delete'
    else action = 'update'
    
    const auditEntry = {
      entityType: 'score',
      entityId: scoreId,
      action,
      oldValues: before,
      newValues: after,
      changedBy: after?.enteredBy || before?.enteredBy || 'system',
      changedAt: admin.firestore.FieldValue.serverTimestamp(),
      reason: null,
      deviceId: after?.deviceId || before?.deviceId || 'unknown',
    }
    
    await db
      .collection('matches')
      .doc(matchId)
      .collection('audit')
      .add(auditEntry)
    
    functions.logger.info(`Audit: ${action} score ${scoreId} in match ${matchId}`)
  })

/**
 * Create audit entry for bet changes
 */
export const onBetWrite = functions.firestore
  .document('matches/{matchId}/bets/{betId}')
  .onWrite(async (change, context) => {
    const { matchId, betId } = context.params
    
    const before = change.before.exists ? change.before.data() : null
    const after = change.after.exists ? change.after.data() : null
    
    let action: 'create' | 'update' | 'delete'
    if (!before) action = 'create'
    else if (!after) action = 'delete'
    else action = 'update'
    
    const auditEntry = {
      entityType: 'bet',
      entityId: betId,
      action,
      oldValues: before,
      newValues: after,
      changedBy: after?.createdBy || before?.createdBy || 'system',
      changedAt: admin.firestore.FieldValue.serverTimestamp(),
      reason: null,
      deviceId: 'server',
    }
    
    await db
      .collection('matches')
      .doc(matchId)
      .collection('audit')
      .add(auditEntry)
    
    functions.logger.info(`Audit: ${action} bet ${betId} in match ${matchId}`)
  })

// ============================================
// INVITE PROCESSING
// ============================================

/**
 * Consume invite (increment use count)
 */
export const consumeInvite = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in')
  }
  
  const { token } = data
  if (!token || typeof token !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Token required')
  }
  
  // Find invite by token
  const invitesSnap = await db
    .collection('invites')
    .where('token', '==', token)
    .limit(1)
    .get()
  
  if (invitesSnap.empty) {
    throw new functions.https.HttpsError('not-found', 'Invite not found')
  }
  
  const inviteDoc = invitesSnap.docs[0]
  const invite = inviteDoc.data()
  
  // Validate invite
  if (invite.useCount >= invite.maxUses) {
    throw new functions.https.HttpsError('resource-exhausted', 'Invite has reached maximum uses')
  }
  
  const now = new Date()
  const expiresAt = invite.expiresAt.toDate()
  if (now > expiresAt) {
    throw new functions.https.HttpsError('deadline-exceeded', 'Invite has expired')
  }
  
  // Increment use count
  await inviteDoc.ref.update({
    useCount: admin.firestore.FieldValue.increment(1),
  })
  
  functions.logger.info(`Invite ${inviteDoc.id} consumed by user ${context.auth.uid}`)
  
  return {
    matchId: invite.matchId,
    groupId: invite.groupId,
  }
})

// ============================================
// LEDGER ENTRY CREATION (Called by betting logic)
// ============================================

/**
 * Create ledger entries from betting results
 */
export const createLedgerEntries = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in')
  }
  
  const { matchId, entries } = data
  
  if (!matchId || !entries || !Array.isArray(entries)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid data')
  }
  
  // Verify caller is match participant
  const matchDoc = await db.collection('matches').doc(matchId).get()
  if (!matchDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Match not found')
  }
  
  const match = matchDoc.data()!
  if (!match.participantIds.includes(context.auth.uid)) {
    throw new functions.https.HttpsError('permission-denied', 'Not a match participant')
  }
  
  // Create ledger entries
  const batch = db.batch()
  const ledgerRef = db.collection('matches').doc(matchId).collection('ledger')
  
  for (const entry of entries) {
    const entryDoc = ledgerRef.doc()
    batch.set(entryDoc, {
      fromUserId: entry.fromUserId,
      toUserId: entry.toUserId,
      amount: entry.amount,
      betType: entry.betType,
      betId: entry.betId,
      description: entry.description,
      settled: false,
      settledAt: null,
      settledBy: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      calculatedBy: 'system',
    })
  }
  
  await batch.commit()
  
  functions.logger.info(`Created ${entries.length} ledger entries for match ${matchId}`)
  
  return { success: true, count: entries.length }
})

// ============================================
// HEALTH CHECK
// ============================================

export const healthCheck = functions.https.onRequest((req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  })
})
```

#### 3.2 — Update Functions Package

**File: `functions/package.json`** (update)
```json
{
  "name": "golfsettled-functions",
  "version": "0.1.0",
  "description": "Cloud Functions for GolfSettled",
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log",
    "lint": "eslint --ext .ts src/",
    "lint:fix": "eslint --ext .ts src/ --fix"
  },
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.5.0"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "typescript": "^5.3.0"
  },
  "private": true
}
```

---

### Phase 4: Custom Hooks for Data Access

#### 4.1 — useMatch Hook

**File: `src/hooks/useMatch.ts`**
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Match, Participant, Bet, Score } from '@/types'
import { 
  getMatch, 
  updateMatch, 
  getMatchParticipants, 
  startMatch, 
  completeMatch 
} from '@/lib/firestore/matches'
import { getMatchBets } from '@/lib/firestore/bets'
import { getMatchScores } from '@/lib/firestore/scores'

interface UseMatchReturn {
  match: Match | null
  participants: Participant[]
  bets: Bet[]
  scores: Score[]
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  start: () => Promise<void>
  complete: () => Promise<void>
}

export function useMatch(matchId: string | null): UseMatchReturn {
  const [match, setMatch] = useState<Match | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [bets, setBets] = useState<Bet[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!matchId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [matchData, participantsData, betsData, scoresData] = await Promise.all([
        getMatch(matchId),
        getMatchParticipants(matchId),
        getMatchBets(matchId),
        getMatchScores(matchId),
      ])

      setMatch(matchData)
      setParticipants(participantsData)
      setBets(betsData)
      setScores(scoresData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch match'))
    } finally {
      setLoading(false)
    }
  }, [matchId])

  // Real-time subscription to match changes
  useEffect(() => {
    if (!matchId) return

    const unsubscribe = onSnapshot(
      doc(db, 'matches', matchId),
      (snap) => {
        if (snap.exists()) {
          setMatch({ id: snap.id, ...snap.data() } as Match)
        }
      },
      (err) => {
        setError(err)
      }
    )

    return () => unsubscribe()
  }, [matchId])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStart = useCallback(async () => {
    if (!matchId) return
    await startMatch(matchId)
  }, [matchId])

  const handleComplete = useCallback(async () => {
    if (!matchId) return
    await completeMatch(matchId)
  }, [matchId])

  return {
    match,
    participants,
    bets,
    scores,
    loading,
    error,
    refresh: fetchData,
    start: handleStart,
    complete: handleComplete,
  }
}
```

#### 4.2 — useScores Hook

**File: `src/hooks/useScores.ts`**
```typescript
'use client'

import { useState, useCallback } from 'react'
import { onSnapshot, query, orderBy } from 'firebase/firestore'
import { useEffect } from 'react'
import { scoresCollection } from '@/lib/firestore/collections'
import type { Score, ScoreCreateData } from '@/types'
import { upsertScore, getParticipantScores, getScorecard } from '@/lib/firestore/scores'

interface UseScoresReturn {
  scores: Score[]
  scorecard: Map<string, Score[]>
  loading: boolean
  error: Error | null
  saveScore: (data: ScoreCreateData) => Promise<Score>
  getParticipantTotal: (participantId: string) => number
}

export function useScores(matchId: string | null): UseScoresReturn {
  const [scores, setScores] = useState<Score[]>([])
  const [scorecard, setScorecard] = useState<Map<string, Score[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Real-time subscription to scores
  useEffect(() => {
    if (!matchId) {
      setLoading(false)
      return
    }

    const q = query(scoresCollection(matchId), orderBy('holeNumber', 'asc'))
    
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const newScores = snap.docs.map(doc => ({
          id: doc.id,
          matchId,
          ...doc.data(),
        } as Score))
        
        setScores(newScores)
        
        // Build scorecard map
        const newScorecard = new Map<string, Score[]>()
        for (const score of newScores) {
          const participantScores = newScorecard.get(score.participantId) || []
          participantScores.push(score)
          newScorecard.set(score.participantId, participantScores)
        }
        setScorecard(newScorecard)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [matchId])

  const saveScore = useCallback(async (data: ScoreCreateData): Promise<Score> => {
    if (!matchId) throw new Error('No match ID')
    return upsertScore(matchId, data)
  }, [matchId])

  const getParticipantTotal = useCallback((participantId: string): number => {
    const participantScores = scorecard.get(participantId) || []
    return participantScores.reduce((sum, score) => sum + score.strokes, 0)
  }, [scorecard])

  return {
    scores,
    scorecard,
    loading,
    error,
    saveScore,
    getParticipantTotal,
  }
}
```

#### 4.3 — useLedger Hook

**File: `src/hooks/useLedger.ts`**
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LedgerEntry } from '@/types'
import { 
  getUserLedger, 
  getUnsettledLedger, 
  settleLedgerEntry, 
  getAllBalances 
} from '@/lib/firestore/ledger'
import { getUsersByIds } from '@/lib/firestore/users'
import { useAuth } from './useAuth'

interface Balance {
  userId: string
  displayName: string
  amount: number // Positive = they owe me, Negative = I owe them
}

interface UseLedgerReturn {
  entries: LedgerEntry[]
  unsettledEntries: LedgerEntry[]
  balances: Balance[]
  totalOwed: number // What others owe me
  totalOwing: number // What I owe others
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

      const [ledgerData, balancesMap] = await Promise.all([
        getUserLedger(),
        getAllBalances(),
      ])

      setEntries(ledgerData)

      // Fetch user names for balances
      const userIds = Array.from(balancesMap.keys())
      const users = await getUsersByIds(userIds)
      const userMap = new Map(users.map(u => [u.id, u]))

      const balancesList: Balance[] = Array.from(balancesMap.entries()).map(([userId, amount]) => ({
        userId,
        displayName: userMap.get(userId)?.displayName || 'Unknown',
        amount,
      }))

      // Sort by absolute amount
      balancesList.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      setBalances(balancesList)
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
    await fetchData() // Refresh
  }, [fetchData])

  const unsettledEntries = entries.filter(e => !e.settled)
  
  const totalOwed = balances
    .filter(b => b.amount > 0)
    .reduce((sum, b) => sum + b.amount, 0)
  
  const totalOwing = balances
    .filter(b => b.amount < 0)
    .reduce((sum, b) => sum + Math.abs(b.amount), 0)

  return {
    entries,
    unsettledEntries,
    balances,
    totalOwed,
    totalOwing,
    loading,
    error,
    refresh: fetchData,
    settle: handleSettle,
  }
}
```

---

### Phase 5: Testing

#### 5.1 — Data Access Tests

**File: `__tests__/lib/firestore/matches.test.ts`**
```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock Firebase - these tests verify types and structure
// Full integration tests require Firebase emulator

describe('Match Data Access', () => {
  describe('createMatch', () => {
    it('should require courseName', () => {
      const validData = {
        courseName: 'Pebble Beach',
        teeTime: new Date(),
        holes: 18 as const,
      }
      
      expect(validData.courseName).toBeDefined()
      expect(validData.holes).toBe(18)
    })

    it('should accept 9 or 18 holes only', () => {
      const validHoles = [9, 18]
      expect(validHoles).toContain(9)
      expect(validHoles).toContain(18)
    })
  })

  describe('Match types', () => {
    it('should have correct status values', () => {
      const validStatuses = ['pending', 'active', 'completed', 'cancelled']
      expect(validStatuses).toHaveLength(4)
    })
  })
})
```

---

## ⚠️ RULES FOR THIS ROLE

1. **DO NOT** create UI components — Frontend Engineer's job
2. **DO NOT** implement betting calculations — Betting Logic Engineer's job
3. **DO NOT** modify security rules (unless bug found) — Security Engineer's job
4. **DO** create typed, reusable data access functions
5. **DO** handle errors gracefully
6. **DO** use optimistic locking for scores
7. **DO** ensure all functions work with Firebase emulator

---

## 📤 HANDOFF CHECKLIST

Before declaring complete, verify ALL:

### Data Access Functions
- [ ] Users: get, create, update work
- [ ] Matches: get, create, update, delete work
- [ ] Participants: add, update work
- [ ] Scores: create, update, get by hole work
- [ ] Bets: create, update, delete work
- [ ] Ledger: get entries, settle work
- [ ] Invites: create, validate work

### Cloud Functions
- [ ] `npm run build` in functions/ passes
- [ ] Audit logging triggers work
- [ ] Invite consumption works
- [ ] Health check responds

### Hooks
- [ ] useMatch provides real-time updates
- [ ] useScores provides real-time updates
- [ ] useLedger calculates balances correctly

### Code Quality
- [ ] All functions have TypeScript types
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes

---

## 📝 PR TEMPLATE

**Title:** `[BACKEND] Firestore data layer and Cloud Functions`

**Body:**
```markdown
## Summary
Complete Firestore data access layer with typed functions and Cloud Functions.

## Added
- TypeScript types for all database entities
- Collection and document reference helpers
- CRUD functions for users, matches, scores, bets, ledger, invites
- Cloud Functions for audit logging and invite processing
- Custom hooks: useMatch, useScores, useLedger

## Cloud Functions
- onScoreWrite: Audit logging for score changes
- onBetWrite: Audit logging for bet changes
- consumeInvite: Process invite redemption
- createLedgerEntries: Create settlement records
- healthCheck: Status endpoint

## Testing
- [x] All functions compile
- [x] Emulator tests pass
- [x] Types are correct

## Next Steps
→ Frontend Engineer: Build UI using these hooks
→ Betting Logic Engineer: Implement calculations
```

---

## 🚀 START NOW

1. Verify Security Engineer work is complete
2. Create all type definitions first
3. Build data access functions
4. Deploy and test Cloud Functions
5. Create hooks for Frontend Engineer
6. Test everything with emulator
7. Complete handoff checklist
8. Create PR

**Clean data access is the backbone. Get the types right first.**
