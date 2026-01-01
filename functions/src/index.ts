import * as admin from 'firebase-admin'

// Initialize Firebase Admin
admin.initializeApp()

// Export all trigger functions
export { onScoreWrite } from './triggers/onScoreWrite'
export { onBetWrite } from './triggers/onBetWrite'

// Export all callable functions
export { consumeInvite } from './callable/consumeInvite'
export { healthCheck } from './callable/healthCheck'
