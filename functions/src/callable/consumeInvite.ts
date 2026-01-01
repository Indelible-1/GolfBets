import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { Invite, Participant } from '../types'

const db = admin.firestore()

/**
 * Callable: Consume an invite and add user to match
 * Server-side operation to prevent abuse:
 * - Validates invite expiry and usage limits
 * - Atomically increments invite useCount
 * - Adds user as participant to match
 *
 * Call from client:
 * const addUserToMatch = httpsCallable(functions, 'consumeInvite');
 * await addUserToMatch({ token: 'xyz...', userId: 'user123' });
 */
export const consumeInvite = functions.https.onCall(async (data, context) => {
  const { token, userId } = data

  // Validate authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to consume invite'
    )
  }

  // Validate input
  if (!token || typeof token !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid token')
  }

  if (!userId || typeof userId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid userId')
  }

  try {
    // Find invite by token
    const inviteSnap = await db
      .collection('invites')
      .where('token', '==', token)
      .limit(1)
      .get()

    if (inviteSnap.empty) {
      throw new functions.https.HttpsError('not-found', 'Invite not found')
    }

    const inviteDoc = inviteSnap.docs[0]
    const invite = inviteDoc.data() as Invite

    // Validate expiry
    const now = new Date()
    if (now > invite.expiresAt.toDate()) {
      throw new functions.https.HttpsError('failed-precondition', 'Invite has expired')
    }

    // Validate max uses
    if (invite.useCount >= invite.maxUses) {
      throw new functions.https.HttpsError('failed-precondition', 'Invite max uses exceeded')
    }

    // Validate match exists
    if (!invite.matchId) {
      throw new functions.https.HttpsError('failed-precondition', 'Invite has no associated match')
    }

    const matchSnap = await db.doc(`matches/${invite.matchId}`).get()
    if (!matchSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Match not found')
    }

    // Atomic operation: increment invite use + add participant
    await db.runTransaction(async (transaction) => {
      // Check one more time inside transaction
      const freshInvite = await transaction.get(inviteDoc.ref)
      const freshData = freshInvite.data() as Invite

      if (freshData.useCount >= freshData.maxUses) {
        throw new functions.https.HttpsError('failed-precondition', 'Invite max uses exceeded')
      }

      // Increment use count
      transaction.update(inviteDoc.ref, {
        useCount: freshData.useCount + 1,
      })

      // Add participant to match (status: confirmed since they used invite link)
      const participantRef = db.doc(
        `matches/${invite.matchId}/participants/${userId}`
      )
      const participant: Participant = {
        id: userId,
        userId,
        displayName: 'Invited Player',
        playingHandicap: null,
        teeBox: 'blue',
        courseHandicap: null,
        team: null,
        status: 'confirmed',
        invitedAt: now,
        confirmedAt: now,
      }

      transaction.set(participantRef, participant, { merge: true })
    })

    functions.logger.info(`Invite consumed: ${token}`, {
      matchId: invite.matchId,
      userId,
    })

    return {
      success: true,
      matchId: invite.matchId,
      message: 'Successfully joined match',
    }
  } catch (error) {
    // Re-throw HttpsErrors, wrap others
    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    functions.logger.error('Error consuming invite:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to consume invite'
    )
  }
})
