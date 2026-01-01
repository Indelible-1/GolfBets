import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { Bet, AuditEntry } from '../types'

const db = admin.firestore()

/**
 * Trigger: Log bet creation and updates to audit collection
 * Called whenever a bet document is written (created or updated)
 * Path: matches/{matchId}/bets/{betId}
 */
export const onBetWrite = functions.firestore
  .document('matches/{matchId}/bets/{betId}')
  .onWrite(async (change, context) => {
    const { matchId, betId } = context.params
    const newBet = change.after.data() as Bet | undefined
    const oldBet = change.before.data() as Bet | undefined

    try {
      // Determine action type
      let action: 'create' | 'update' | 'delete'
      if (!oldBet && newBet) {
        action = 'create'
      } else if (oldBet && !newBet) {
        action = 'delete'
      } else {
        action = 'update'
      }

      const now = new Date()
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const auditEntry: AuditEntry = {
        id: auditId,
        entityType: 'bet',
        entityId: betId,
        action,
        oldValues: oldBet ? JSON.parse(JSON.stringify(oldBet)) : null,
        newValues: newBet ? JSON.parse(JSON.stringify(newBet)) : null,
        changedBy: newBet?.createdBy || oldBet?.createdBy || 'system',
        changedAt: now,
        reason: null,
        deviceId: 'server',
      }

      // Write to audit collection
      await db.doc(`matches/${matchId}/audit/${auditId}`).set(auditEntry)

      functions.logger.info(`Audit log created for bet ${betId}`, {
        matchId,
        action,
      })
    } catch (error) {
      functions.logger.error(`Error creating audit log for bet ${betId}:`, error)
      throw error
    }
  })
