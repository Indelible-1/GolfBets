import { Timestamp, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore'
import {
  User,
  FirestoreUser,
  Match,
  FirestoreMatch,
  Participant,
  FirestoreParticipant,
  Score,
  FirestoreScore,
  Bet,
  FirestoreBet,
  LedgerEntry,
  FirestoreLedgerEntry,
  AuditEntry,
  FirestoreAuditEntry,
  Invite,
  FirestoreInvite,
  Group,
  FirestoreGroup,
  Season,
  FirestoreSeason,
  BetTemplate,
  FirestoreBetTemplate,
  GroupInvite,
  FirestoreGroupInvite,
} from '@/types'

// ============ TIMESTAMP HELPERS ============

export const toDate = (timestamp: Timestamp | null | undefined): Date | null => {
  return timestamp ? timestamp.toDate() : null
}

export const fromDate = (date: Date | null | undefined): Timestamp | null => {
  return date ? Timestamp.fromDate(date) : null
}

// ============ USER CONVERTER ============

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore: (user: User): FirestoreUser => ({
    ...user,
    createdAt: Timestamp.fromDate(user.createdAt),
    updatedAt: Timestamp.fromDate(user.updatedAt),
    lastActiveAt: Timestamp.fromDate(user.lastActiveAt),
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreUser>): User => {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      lastActiveAt: data.lastActiveAt.toDate(),
    }
  },
}

// ============ MATCH CONVERTER ============

export const matchConverter: FirestoreDataConverter<Match> = {
  toFirestore: (match: Match): FirestoreMatch => ({
    ...match,
    createdAt: Timestamp.fromDate(match.createdAt),
    updatedAt: Timestamp.fromDate(match.updatedAt),
    startedAt: match.startedAt ? Timestamp.fromDate(match.startedAt) : null,
    completedAt: match.completedAt ? Timestamp.fromDate(match.completedAt) : null,
    teeTime: Timestamp.fromDate(match.teeTime),
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreMatch>): Match => {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      startedAt: data.startedAt?.toDate() ?? null,
      completedAt: data.completedAt?.toDate() ?? null,
      teeTime: data.teeTime.toDate(),
    }
  },
}

// ============ PARTICIPANT CONVERTER ============

export const participantConverter: FirestoreDataConverter<Participant> = {
  toFirestore: (participant: Participant): FirestoreParticipant => ({
    ...participant,
    invitedAt: Timestamp.fromDate(participant.invitedAt),
    confirmedAt: participant.confirmedAt ? Timestamp.fromDate(participant.confirmedAt) : null,
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreParticipant>): Participant => {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      invitedAt: data.invitedAt.toDate(),
      confirmedAt: data.confirmedAt?.toDate() ?? null,
    }
  },
}

// ============ SCORE CONVERTER ============

export const scoreConverter: FirestoreDataConverter<Score> = {
  toFirestore: (score: Score): FirestoreScore => ({
    ...score,
    createdAt: Timestamp.fromDate(score.createdAt),
    updatedAt: Timestamp.fromDate(score.updatedAt),
    syncedAt: score.syncedAt ? Timestamp.fromDate(score.syncedAt) : null,
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreScore>): Score => {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      syncedAt: data.syncedAt?.toDate() ?? null,
    }
  },
}

// ============ BET CONVERTER ============

export const betConverter: FirestoreDataConverter<Bet> = {
  toFirestore: (bet: Bet): FirestoreBet => ({
    ...bet,
    createdAt: Timestamp.fromDate(bet.createdAt),
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreBet>): Bet => {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt.toDate(),
    }
  },
}

// ============ LEDGER CONVERTER ============

export const ledgerConverter: FirestoreDataConverter<LedgerEntry> = {
  toFirestore: (entry: LedgerEntry): FirestoreLedgerEntry => ({
    ...entry,
    createdAt: Timestamp.fromDate(entry.createdAt),
    settledAt: entry.settledAt ? Timestamp.fromDate(entry.settledAt) : null,
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreLedgerEntry>): LedgerEntry => {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt.toDate(),
      settledAt: data.settledAt?.toDate() ?? null,
    }
  },
}

// ============ AUDIT CONVERTER ============

export const auditConverter: FirestoreDataConverter<AuditEntry> = {
  toFirestore: (entry: AuditEntry): FirestoreAuditEntry => ({
    ...entry,
    changedAt: Timestamp.fromDate(entry.changedAt),
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreAuditEntry>): AuditEntry => {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      changedAt: data.changedAt.toDate(),
    }
  },
}

// ============ INVITE CONVERTER ============

export const inviteConverter: FirestoreDataConverter<Invite> = {
  toFirestore: (invite: Invite): FirestoreInvite => ({
    ...invite,
    createdAt: Timestamp.fromDate(invite.createdAt),
    expiresAt: Timestamp.fromDate(invite.expiresAt),
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreInvite>): Invite => {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt.toDate(),
      expiresAt: data.expiresAt.toDate(),
    }
  },
}

// ============ GROUP CONVERTER ============

export const groupConverter: FirestoreDataConverter<Group> = {
  toFirestore: (group: Group): FirestoreGroup => ({
    ...group,
    createdAt: Timestamp.fromDate(group.createdAt),
    updatedAt: Timestamp.fromDate(group.updatedAt),
    stats: {
      ...group.stats,
      lastMatchDate: group.stats.lastMatchDate
        ? Timestamp.fromDate(group.stats.lastMatchDate)
        : null,
    },
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreGroup>): Group => {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      stats: {
        ...data.stats,
        lastMatchDate: data.stats.lastMatchDate?.toDate() ?? null,
      },
    }
  },
}

// ============ SEASON CONVERTER ============

export const seasonConverter: FirestoreDataConverter<Season> = {
  toFirestore: (season: Season): FirestoreSeason => ({
    ...season,
    startDate: Timestamp.fromDate(season.startDate),
    endDate: Timestamp.fromDate(season.endDate),
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreSeason>): Season => {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
    }
  },
}

// ============ BET TEMPLATE CONVERTER ============

export const betTemplateConverter: FirestoreDataConverter<BetTemplate> = {
  toFirestore: (template: BetTemplate): FirestoreBetTemplate => ({
    ...template,
    createdAt: Timestamp.fromDate(template.createdAt),
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreBetTemplate>): BetTemplate => {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt.toDate(),
    }
  },
}

// ============ GROUP INVITE CONVERTER ============

export const groupInviteConverter: FirestoreDataConverter<GroupInvite> = {
  toFirestore: (invite: GroupInvite): FirestoreGroupInvite => ({
    ...invite,
    expiresAt: Timestamp.fromDate(invite.expiresAt),
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreGroupInvite>): GroupInvite => {
    const data = snapshot.data()
    return {
      ...data,
      expiresAt: data.expiresAt.toDate(),
    }
  },
}
