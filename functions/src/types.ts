import { Timestamp } from 'firebase-admin/firestore'

// Re-export types used in Cloud Functions
// These mirror the client types but with Firestore Timestamp instead of Date

export type BetType = 'nassau' | 'skins' | 'match_play' | 'stroke_play'
export type ScoringMode = 'gross' | 'net'
export type ParticipantStatus = 'invited' | 'confirmed' | 'declined'
export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled'

export interface Score {
  id: string
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

export interface Bet {
  id: string
  type: BetType
  unitValue: number
  scoringMode: ScoringMode
  nassauConfig: unknown | null
  skinsConfig: unknown | null
  createdAt: Timestamp
  createdBy: string
}

export interface Participant {
  id: string
  userId: string
  displayName: string
  playingHandicap: number | null
  teeBox: string
  courseHandicap: number | null
  team: string | null
  status: ParticipantStatus
  invitedAt: Timestamp
  confirmedAt: Timestamp | null
}

export interface AuditEntry {
  id: string
  entityType: 'score' | 'bet' | 'participant' | 'match'
  entityId: string
  action: 'create' | 'update' | 'delete'
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  changedBy: string
  changedAt: Date
  reason: string | null
  deviceId: string
}

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
