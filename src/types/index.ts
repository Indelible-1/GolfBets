import { Timestamp } from 'firebase/firestore'

// ============ TYPE DEFINITIONS ============

export type TeeBox = 'championship' | 'blue' | 'white' | 'red'
export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled'
export type BetType = 'nassau' | 'skins' | 'match_play' | 'stroke_play'
export type ScoringMode = 'gross' | 'net'
export type ParticipantStatus = 'invited' | 'confirmed' | 'declined'

// ============ USER ============

export interface User {
  id: string
  displayName: string
  email: string
  avatarUrl: string | null

  // Golf profile
  handicapIndex: number | null
  homeClub: string | null
  defaultTeeBox: TeeBox

  // Preferences
  notificationsEnabled: boolean

  // Metadata
  createdAt: Date
  updatedAt: Date
  lastActiveAt: Date
}

// ============ MATCH ============

export interface Match {
  id: string
  courseName: string
  courseId: string | null
  teeTime: Date
  holes: 9 | 18

  // Status
  status: MatchStatus
  currentHole: number | null

  // Participants
  createdBy: string
  scorerId: string
  participantIds: string[]

  // Metadata
  createdAt: Date
  updatedAt: Date
  startedAt: Date | null
  completedAt: Date | null

  // Optimistic locking
  version: number
}

// ============ PARTICIPANT ============

export interface Participant {
  id: string
  userId: string
  displayName: string

  // Golf settings
  playingHandicap: number | null
  teeBox: TeeBox
  courseHandicap: number | null

  // Team
  team: 'A' | 'B' | null

  // Status
  status: ParticipantStatus
  invitedAt: Date
  confirmedAt: Date | null
}

// ============ SCORE ============

export interface Score {
  id: string
  participantId: string
  holeNumber: number

  // Score data
  strokes: number
  putts: number | null
  fairwayHit: boolean | null
  greenInRegulation: boolean | null

  // Metadata
  enteredBy: string
  createdAt: Date
  updatedAt: Date

  // Sync & conflict resolution
  version: number
  deviceId: string
  syncedAt: Date | null
}

// ============ BETS ============

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

export interface Bet {
  id: string
  type: BetType
  unitValue: number
  scoringMode: ScoringMode

  // Type-specific configs
  nassauConfig: NassauConfig | null
  skinsConfig: SkinsConfig | null

  // Metadata
  createdAt: Date
  createdBy: string
}

// ============ LEDGER ============

export interface LedgerEntry {
  id: string
  fromUserId: string
  toUserId: string
  amount: number

  // Context
  betType: BetType
  betId: string
  description: string

  // Settlement
  settled: boolean
  settledAt: Date | null
  settledBy: string | null

  // Metadata
  createdAt: Date
  calculatedBy: string
}

// ============ AUDIT ============

export interface AuditEntry {
  id: string
  entityType: 'score' | 'bet' | 'participant' | 'match'
  entityId: string
  action: 'create' | 'update' | 'delete'

  // Change details
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null

  // Who & when
  changedBy: string
  changedAt: Date

  // Context
  reason: string | null
  deviceId: string
}

// ============ INVITES ============

export interface Invite {
  id: string
  token: string

  // Target
  matchId: string | null
  groupId: string | null

  // Limits
  maxUses: number
  useCount: number
  expiresAt: Date

  // Metadata
  createdBy: string
  createdAt: Date
}

// ============ GROUPS (Social) ============

export type SeasonPeriod = 'monthly' | 'quarterly' | 'yearly' | 'custom'
export type SeasonStatus = 'active' | 'completed'
export type TrendDirection = 'up' | 'down' | 'same'

export interface GroupSettings {
  defaultBets: Bet[]
  defaultCourse: string | null
}

export interface GroupStats {
  totalMatches: number
  lastMatchDate: Date | null
}

export interface Group {
  id: string
  name: string
  createdBy: string
  memberIds: string[]
  createdAt: Date
  updatedAt: Date
  settings: GroupSettings
  stats: GroupStats
}

export interface GroupMember {
  id: string
  displayName: string
  avatarUrl: string | null
  matchesPlayed: number
  netAmount: number
}

export interface GroupWithMembers extends Group {
  members: GroupMember[]
}

// ============ SEASONS (Social) ============

export interface Season {
  id: string
  groupId: string
  name: string
  period: SeasonPeriod
  startDate: Date
  endDate: Date
  status: SeasonStatus
  standings: SeasonStanding[]
}

export interface SeasonStanding {
  playerId: string
  displayName: string
  netAmount: number
  matchesPlayed: number
  wins: number
  losses: number
  rank: number
  trend: TrendDirection
}

// ============ QUICK REMATCH (Social) ============

export interface RematchConfig {
  originalMatchId: string
  participantIds: string[]
  courseName: string
  bets: Bet[]
  teeTime: Date | null
}

// ============ BET TEMPLATES (Social) ============

export interface BetTemplate {
  id: string
  userId: string
  name: string
  bets: Bet[]
  createdAt: Date
  isDefault: boolean
}

// ============ GROUP INVITES (Social) ============

export interface GroupInvite {
  groupId: string
  groupName: string
  invitedBy: string
  invitedByName: string
  expiresAt: Date
  token: string
}

// ============ FIRESTORE CONVERTERS ============

export type FirestoreUser = Omit<User, 'createdAt' | 'updatedAt' | 'lastActiveAt'> & {
  createdAt: Timestamp
  updatedAt: Timestamp
  lastActiveAt: Timestamp
}

export type FirestoreMatch = Omit<
  Match,
  'createdAt' | 'updatedAt' | 'startedAt' | 'completedAt' | 'teeTime'
> & {
  createdAt: Timestamp
  updatedAt: Timestamp
  startedAt: Timestamp | null
  completedAt: Timestamp | null
  teeTime: Timestamp
}

export type FirestoreParticipant = Omit<Participant, 'invitedAt' | 'confirmedAt'> & {
  invitedAt: Timestamp
  confirmedAt: Timestamp | null
}

export type FirestoreScore = Omit<Score, 'createdAt' | 'updatedAt' | 'syncedAt'> & {
  createdAt: Timestamp
  updatedAt: Timestamp
  syncedAt: Timestamp | null
}

export type FirestoreBet = Omit<Bet, 'createdAt'> & {
  createdAt: Timestamp
}

export type FirestoreLedgerEntry = Omit<LedgerEntry, 'createdAt' | 'settledAt'> & {
  createdAt: Timestamp
  settledAt: Timestamp | null
}

export type FirestoreAuditEntry = Omit<AuditEntry, 'changedAt'> & {
  changedAt: Timestamp
}

export type FirestoreInvite = Omit<Invite, 'createdAt' | 'expiresAt'> & {
  createdAt: Timestamp
  expiresAt: Timestamp
}

// Social Feature Firestore Types

export type FirestoreGroupStats = Omit<GroupStats, 'lastMatchDate'> & {
  lastMatchDate: Timestamp | null
}

export type FirestoreGroup = Omit<Group, 'createdAt' | 'updatedAt' | 'stats'> & {
  createdAt: Timestamp
  updatedAt: Timestamp
  stats: FirestoreGroupStats
}

export type FirestoreSeason = Omit<Season, 'startDate' | 'endDate'> & {
  startDate: Timestamp
  endDate: Timestamp
}

export type FirestoreBetTemplate = Omit<BetTemplate, 'createdAt'> & {
  createdAt: Timestamp
}

export type FirestoreGroupInvite = Omit<GroupInvite, 'expiresAt'> & {
  expiresAt: Timestamp
}
