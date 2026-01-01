import {
  collection,
  CollectionReference,
  DocumentReference,
  doc,
  getFirestore,
} from 'firebase/firestore'
import {
  User,
  Match,
  Participant,
  Score,
  Bet,
  LedgerEntry,
  AuditEntry,
  Invite,
} from '@/types'
import {
  userConverter,
  matchConverter,
  participantConverter,
  scoreConverter,
  betConverter,
  ledgerConverter,
  auditConverter,
  inviteConverter,
} from './converters'

const db = getFirestore()

// ============ ROOT COLLECTIONS ============

export const usersCollection = (): CollectionReference<User> =>
  collection(db, 'users').withConverter(userConverter)

export const matchesCollection = (): CollectionReference<Match> =>
  collection(db, 'matches').withConverter(matchConverter)

export const invitesCollection = (): CollectionReference<Invite> =>
  collection(db, 'invites').withConverter(inviteConverter)

// ============ SUBCOLLECTIONS ============

export const betsCollection = (matchId: string): CollectionReference<Bet> =>
  collection(db, `matches/${matchId}/bets`).withConverter(betConverter)

export const participantsCollection = (matchId: string): CollectionReference<Participant> =>
  collection(db, `matches/${matchId}/participants`).withConverter(participantConverter)

export const scoresCollection = (matchId: string): CollectionReference<Score> =>
  collection(db, `matches/${matchId}/scores`).withConverter(scoreConverter)

export const ledgerCollection = (matchId: string): CollectionReference<LedgerEntry> =>
  collection(db, `matches/${matchId}/ledger`).withConverter(ledgerConverter)

export const auditCollection = (matchId: string): CollectionReference<AuditEntry> =>
  collection(db, `matches/${matchId}/audit`).withConverter(auditConverter)

// ============ DOCUMENT REFERENCES ============

export const userDoc = (userId: string): DocumentReference<User> =>
  doc(collection(db, 'users'), userId).withConverter(userConverter) as DocumentReference<User>

export const matchDoc = (matchId: string): DocumentReference<Match> =>
  doc(collection(db, 'matches'), matchId).withConverter(matchConverter) as DocumentReference<Match>

export const betDoc = (matchId: string, betId: string): DocumentReference<Bet> =>
  doc(collection(db, `matches/${matchId}/bets`), betId).withConverter(betConverter) as DocumentReference<Bet>

export const participantDoc = (
  matchId: string,
  participantId: string,
): DocumentReference<Participant> =>
  doc(
    collection(db, `matches/${matchId}/participants`),
    participantId,
  ).withConverter(participantConverter) as DocumentReference<Participant>

export const scoreDoc = (matchId: string, scoreId: string): DocumentReference<Score> =>
  doc(collection(db, `matches/${matchId}/scores`), scoreId).withConverter(
    scoreConverter,
  ) as DocumentReference<Score>

export const ledgerEntryDoc = (
  matchId: string,
  entryId: string,
): DocumentReference<LedgerEntry> =>
  doc(collection(db, `matches/${matchId}/ledger`), entryId).withConverter(
    ledgerConverter,
  ) as DocumentReference<LedgerEntry>

export const auditEntryDoc = (
  matchId: string,
  auditId: string,
): DocumentReference<AuditEntry> =>
  doc(collection(db, `matches/${matchId}/audit`), auditId).withConverter(
    auditConverter,
  ) as DocumentReference<AuditEntry>

export const inviteDoc = (inviteId: string): DocumentReference<Invite> =>
  doc(collection(db, 'invites'), inviteId).withConverter(
    inviteConverter,
  ) as DocumentReference<Invite>
