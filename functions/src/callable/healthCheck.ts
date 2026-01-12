import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.firestore()

/**
 * Callable: Health check endpoint
 * Returns service status and basic connectivity information
 *
 * Call from client:
 * const healthCheck = httpsCallable(functions, 'healthCheck');
 * const result = await healthCheck();
 */
export const healthCheck = functions.https.onCall(async (_data, context) => {
  try {
    const now = new Date()
    const userId = context.auth?.uid || 'anonymous'

    // Test Firestore connectivity with a dummy read
    await db.collection('_health').doc('check').get()

    return {
      status: 'ok',
      timestamp: now.toISOString(),
      userId,
      version: '0.1.0',
      firestore: 'connected',
    }
  } catch (error) {
    functions.logger.error('Health check failed:', error)

    return {
      status: 'degraded',
      timestamp: new Date().toISOString(),
      userId: context.auth?.uid || 'anonymous',
      version: '0.1.0',
      firestore: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})
