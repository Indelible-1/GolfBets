import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { Score, AuditEntry } from '../types'

const db = admin.firestore()

/**
 * Trigger: Log score creation and updates to audit collection
 * Called whenever a score document is written (created or updated)
 * Path: matches/{matchId}/scores/{scoreId}
 */
export const onScoreWrite = functions.firestore
  .document('matches/{matchId}/scores/{scoreId}')
  .onWrite(async (change, context) => {
    const { matchId, scoreId } = context.params
    const newScore = change.after.data() as Score | undefined
    const oldScore = change.before.data() as Score | undefined

    try {
      // Determine action type
      let action: 'create' | 'update' | 'delete'
      if (!oldScore && newScore) {
        action = 'create'
      } else if (oldScore && !newScore) {
        action = 'delete'
      } else {
        action = 'update'
      }

      const now = new Date()
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const auditEntry: AuditEntry = {
        id: auditId,
        entityType: 'score',
        entityId: scoreId,
        action,
        oldValues: oldScore ? JSON.parse(JSON.stringify(oldScore)) : null,
        newValues: newScore ? JSON.parse(JSON.stringify(newScore)) : null,
        changedBy: newScore?.enteredBy || oldScore?.enteredBy || 'system',
        changedAt: now,
        reason: null,
        deviceId: newScore?.deviceId || oldScore?.deviceId || 'unknown',
      }

      // Write to audit collection
      await db.doc(`matches/${matchId}/audit/${auditId}`).set(auditEntry)

      functions.logger.info(`Audit log created for score ${scoreId}`, {
        matchId,
        action,
      })
    } catch (error) {
      functions.logger.error(`Error creating audit log for score ${scoreId}:`, error)
      throw error
    }
  })
