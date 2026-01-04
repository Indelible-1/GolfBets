# 📴 SUPER PROMPT: PWA & Offline Engineer

> **Role:** PWA & Offline Engineer (Role #5)
> **Project:** GolfSettled MVP — Golf Side-Bet Tracker PWA
> **Duration:** Day 4-6
> **Dependencies:** Manager Engineer ✅, Frontend Engineer ✅ (partial)

---

## 🎯 YOUR MISSION

You are the **PWA & Offline Engineer** responsible for making GolfSettled work reliably on the golf course with spotty or no connectivity. You implement service workers, offline data persistence, background sync, and the PWA installation experience.

**Your work is complete when:** The app installs on mobile home screens, works fully offline, syncs data when connectivity returns, and provides clear feedback about sync status.

---

## 📋 PREREQUISITES

Before starting, verify previous engineers' work:

```bash
cd /Users/neilfrye/docs/AI/SideBets

# Verify these pass
npm run dev          # Should start
npm run build        # Should build
npm run lint         # Should pass

# Verify Firebase is configured
cat .env.local       # Should have Firebase credentials
```

### Critical Understanding

**Golf Course Reality:**
- Cell coverage is spotty (valleys, trees, remote areas)
- Rounds take 4+ hours
- Users enter scores every few minutes
- Data MUST NOT be lost
- Sync conflicts happen (multiple scorers)

---

## 📋 TASK CHECKLIST

Complete these tasks in order:

---

### Phase 1: PWA Configuration

#### 1.1 — Install Dependencies

```bash
npm install next-pwa workbox-window idb
npm install -D @types/workbox-window
```

#### 1.2 — PWA Manifest

**File: `public/manifest.json`**
```json
{
  "name": "GolfSettled",
  "short_name": "GolfSettled",
  "description": "Track golf bets with friends. Settle up later.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f9fafb",
  "theme_color": "#16a34a",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Home Screen"
    },
    {
      "src": "/screenshots/scorecard.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Scorecard"
    }
  ],
  "categories": ["sports", "lifestyle"],
  "shortcuts": [
    {
      "name": "New Match",
      "short_name": "New",
      "description": "Start a new golf match",
      "url": "/match/new",
      "icons": [{ "src": "/icons/shortcut-new.png", "sizes": "96x96" }]
    },
    {
      "name": "Ledger",
      "short_name": "Ledger",
      "description": "View your balances",
      "url": "/ledger",
      "icons": [{ "src": "/icons/shortcut-ledger.png", "sizes": "96x96" }]
    }
  ]
}
```

#### 1.3 — Next.js PWA Configuration

**File: `next.config.js`** (update)
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // Cache Google Fonts
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      // Cache static assets
      urlPattern: /\.(?:js|css|woff2?)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // Cache images
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // Cache API routes (with network-first for freshness)
      urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'firestore-api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      // Cache pages
      urlPattern: /^https?:\/\/.*\/(?:match|ledger|settings).*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        networkTimeoutSeconds: 5,
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
}

module.exports = withPWA(nextConfig)
```

#### 1.4 — App Icons

Create placeholder icons (replace with actual branding later):

**File: `scripts/generate-icons.js`**
```javascript
/**
 * Icon generation script
 * Run: node scripts/generate-icons.js
 * 
 * For MVP, create simple placeholder icons.
 * Replace with professional icons before launch.
 */

const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const iconsDir = path.join(__dirname, '../public/icons')

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Create a simple SVG placeholder for each size
sizes.forEach(size => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#16a34a" rx="${size * 0.15}"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
        font-family="system-ui, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white">
    ⛳
  </text>
</svg>
  `.trim()
  
  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}.svg`),
    svg
  )
  
  console.log(`Created icon-${size}.svg`)
})

console.log('\n✅ Icons generated! Convert SVGs to PNGs before production.')
console.log('   Use: https://cloudconvert.com/svg-to-png')
```

---

### Phase 2: IndexedDB Offline Storage

#### 2.1 — Database Schema

**File: `src/lib/offline/db.ts`**
```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb'

// ============================================
// DATABASE SCHEMA
// ============================================

interface GolfSettledDB extends DBSchema {
  // Pending changes to sync
  pendingChanges: {
    key: string
    value: {
      id: string
      type: 'score' | 'match' | 'participant'
      action: 'create' | 'update' | 'delete'
      data: Record<string, unknown>
      matchId: string
      timestamp: number
      retryCount: number
      lastError?: string
    }
    indexes: {
      'by-match': string
      'by-timestamp': number
    }
  }
  
  // Cached matches for offline access
  matches: {
    key: string
    value: {
      id: string
      data: Record<string, unknown>
      cachedAt: number
      version: number
    }
    indexes: {
      'by-cached': number
    }
  }
  
  // Cached scores
  scores: {
    key: string // `${matchId}_${participantId}_${holeNumber}`
    value: {
      id: string
      matchId: string
      participantId: string
      holeNumber: number
      data: Record<string, unknown>
      cachedAt: number
      version: number
      pendingSync: boolean
    }
    indexes: {
      'by-match': string
      'by-participant': string
      'by-pending': number
    }
  }
  
  // Sync metadata
  syncMeta: {
    key: string
    value: {
      key: string
      lastSyncAt: number
      status: 'idle' | 'syncing' | 'error'
      errorMessage?: string
    }
  }
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

const DB_NAME = 'golfsettled'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<GolfSettledDB> | null = null

export async function getDB(): Promise<IDBPDatabase<GolfSettledDB>> {
  if (dbInstance) return dbInstance
  
  dbInstance = await openDB<GolfSettledDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Pending changes store
      if (!db.objectStoreNames.contains('pendingChanges')) {
        const pendingStore = db.createObjectStore('pendingChanges', { keyPath: 'id' })
        pendingStore.createIndex('by-match', 'matchId')
        pendingStore.createIndex('by-timestamp', 'timestamp')
      }
      
      // Matches store
      if (!db.objectStoreNames.contains('matches')) {
        const matchStore = db.createObjectStore('matches', { keyPath: 'id' })
        matchStore.createIndex('by-cached', 'cachedAt')
      }
      
      // Scores store
      if (!db.objectStoreNames.contains('scores')) {
        const scoreStore = db.createObjectStore('scores', { keyPath: 'id' })
        scoreStore.createIndex('by-match', 'matchId')
        scoreStore.createIndex('by-participant', 'participantId')
        scoreStore.createIndex('by-pending', 'pendingSync')
      }
      
      // Sync metadata store
      if (!db.objectStoreNames.contains('syncMeta')) {
        db.createObjectStore('syncMeta', { keyPath: 'key' })
      }
    },
    blocked() {
      console.warn('Database blocked by older version')
    },
    blocking() {
      // Close connection to allow upgrade
      dbInstance?.close()
      dbInstance = null
    },
  })
  
  return dbInstance
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await Promise.all([
    db.clear('pendingChanges'),
    db.clear('matches'),
    db.clear('scores'),
    db.clear('syncMeta'),
  ])
}

export async function getDatabaseSize(): Promise<number> {
  const db = await getDB()
  let size = 0
  
  const stores = ['pendingChanges', 'matches', 'scores', 'syncMeta'] as const
  for (const store of stores) {
    const count = await db.count(store)
    size += count
  }
  
  return size
}
```

#### 2.2 — Pending Changes Manager

**File: `src/lib/offline/pendingChanges.ts`**
```typescript
import { getDB } from './db'
import { v4 as uuid } from 'uuid'

export interface PendingChange {
  id: string
  type: 'score' | 'match' | 'participant'
  action: 'create' | 'update' | 'delete'
  data: Record<string, unknown>
  matchId: string
  timestamp: number
  retryCount: number
  lastError?: string
}

/**
 * Add a pending change to the queue
 */
export async function addPendingChange(
  change: Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'>
): Promise<string> {
  const db = await getDB()
  
  const pendingChange: PendingChange = {
    ...change,
    id: uuid(),
    timestamp: Date.now(),
    retryCount: 0,
  }
  
  await db.put('pendingChanges', pendingChange)
  
  // Trigger sync attempt
  if (navigator.onLine) {
    triggerSync()
  }
  
  return pendingChange.id
}

/**
 * Get all pending changes
 */
export async function getPendingChanges(): Promise<PendingChange[]> {
  const db = await getDB()
  return db.getAllFromIndex('pendingChanges', 'by-timestamp')
}

/**
 * Get pending changes for a specific match
 */
export async function getPendingChangesForMatch(matchId: string): Promise<PendingChange[]> {
  const db = await getDB()
  return db.getAllFromIndex('pendingChanges', 'by-match', matchId)
}

/**
 * Get count of pending changes
 */
export async function getPendingCount(): Promise<number> {
  const db = await getDB()
  return db.count('pendingChanges')
}

/**
 * Remove a pending change (after successful sync)
 */
export async function removePendingChange(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('pendingChanges', id)
}

/**
 * Update retry count and error for a pending change
 */
export async function markChangeRetried(id: string, error?: string): Promise<void> {
  const db = await getDB()
  const change = await db.get('pendingChanges', id)
  
  if (change) {
    change.retryCount += 1
    change.lastError = error
    await db.put('pendingChanges', change)
  }
}

/**
 * Trigger background sync
 */
function triggerSync(): void {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((registration) => {
      // @ts-ignore - SyncManager types not perfect
      registration.sync.register('sync-scores')
    }).catch(console.error)
  }
}
```

#### 2.3 — Offline Score Cache

**File: `src/lib/offline/scoreCache.ts`**
```typescript
import { getDB } from './db'
import { addPendingChange } from './pendingChanges'
import type { Score, ScoreCreateData } from '@/types'

interface CachedScore {
  id: string
  matchId: string
  participantId: string
  holeNumber: number
  data: Record<string, unknown>
  cachedAt: number
  version: number
  pendingSync: boolean
}

/**
 * Save score to local cache
 */
export async function cacheScore(
  matchId: string,
  score: Score,
  pendingSync: boolean = false
): Promise<void> {
  const db = await getDB()
  
  const cachedScore: CachedScore = {
    id: `${matchId}_${score.participantId}_${score.holeNumber}`,
    matchId,
    participantId: score.participantId,
    holeNumber: score.holeNumber,
    data: score as unknown as Record<string, unknown>,
    cachedAt: Date.now(),
    version: score.version || 1,
    pendingSync,
  }
  
  await db.put('scores', cachedScore)
}

/**
 * Get cached score
 */
export async function getCachedScore(
  matchId: string,
  participantId: string,
  holeNumber: number
): Promise<Score | null> {
  const db = await getDB()
  const id = `${matchId}_${participantId}_${holeNumber}`
  const cached = await db.get('scores', id)
  
  if (!cached) return null
  return cached.data as unknown as Score
}

/**
 * Get all cached scores for a match
 */
export async function getCachedMatchScores(matchId: string): Promise<Score[]> {
  const db = await getDB()
  const cached = await db.getAllFromIndex('scores', 'by-match', matchId)
  return cached.map(c => c.data as unknown as Score)
}

/**
 * Save score with offline support
 * Returns immediately with optimistic update, queues for sync
 */
export async function saveScoreOffline(
  matchId: string,
  data: ScoreCreateData
): Promise<Score> {
  const db = await getDB()
  
  // Create optimistic score object
  const optimisticScore: Score = {
    id: `${data.participantId}_${data.holeNumber}`,
    matchId,
    participantId: data.participantId,
    holeNumber: data.holeNumber,
    strokes: data.strokes,
    putts: data.putts ?? null,
    fairwayHit: data.fairwayHit ?? null,
    greenInRegulation: data.greenInRegulation ?? null,
    enteredBy: 'local', // Will be updated on sync
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
    version: 1,
    deviceId: getDeviceId(),
    syncedAt: null,
  }
  
  // Cache locally
  await cacheScore(matchId, optimisticScore, true)
  
  // Queue for sync
  await addPendingChange({
    type: 'score',
    action: 'create',
    data: data as unknown as Record<string, unknown>,
    matchId,
  })
  
  return optimisticScore
}

/**
 * Get device ID for conflict resolution
 */
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
 * Mark scores as synced
 */
export async function markScoresSynced(matchId: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('scores', 'readwrite')
  const index = tx.store.index('by-match')
  
  let cursor = await index.openCursor(matchId)
  while (cursor) {
    const score = cursor.value
    score.pendingSync = false
    await cursor.update(score)
    cursor = await cursor.continue()
  }
  
  await tx.done
}

/**
 * Get pending scores count
 */
export async function getPendingScoresCount(matchId?: string): Promise<number> {
  const db = await getDB()
  
  if (matchId) {
    const scores = await db.getAllFromIndex('scores', 'by-match', matchId)
    return scores.filter(s => s.pendingSync).length
  }
  
  const allScores = await db.getAll('scores')
  return allScores.filter(s => s.pendingSync).length
}
```

#### 2.4 — Match Cache

**File: `src/lib/offline/matchCache.ts`**
```typescript
import { getDB } from './db'
import type { Match } from '@/types'

interface CachedMatch {
  id: string
  data: Record<string, unknown>
  cachedAt: number
  version: number
}

/**
 * Cache a match for offline access
 */
export async function cacheMatch(match: Match): Promise<void> {
  const db = await getDB()
  
  const cached: CachedMatch = {
    id: match.id,
    data: match as unknown as Record<string, unknown>,
    cachedAt: Date.now(),
    version: match.version || 1,
  }
  
  await db.put('matches', cached)
}

/**
 * Get cached match
 */
export async function getCachedMatch(matchId: string): Promise<Match | null> {
  const db = await getDB()
  const cached = await db.get('matches', matchId)
  
  if (!cached) return null
  return cached.data as unknown as Match
}

/**
 * Get all cached matches
 */
export async function getAllCachedMatches(): Promise<Match[]> {
  const db = await getDB()
  const cached = await db.getAll('matches')
  return cached.map(c => c.data as unknown as Match)
}

/**
 * Remove old cached matches (cleanup)
 */
export async function pruneOldMatches(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
  const db = await getDB()
  const cutoff = Date.now() - maxAge
  
  const tx = db.transaction('matches', 'readwrite')
  const index = tx.store.index('by-cached')
  
  let removed = 0
  let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoff))
  
  while (cursor) {
    await cursor.delete()
    removed++
    cursor = await cursor.continue()
  }
  
  await tx.done
  return removed
}

/**
 * Check if match is cached
 */
export async function isMatchCached(matchId: string): Promise<boolean> {
  const db = await getDB()
  const cached = await db.get('matches', matchId)
  return !!cached
}
```

---

### Phase 3: Sync Engine

#### 3.1 — Sync Manager

**File: `src/lib/offline/syncManager.ts`**
```typescript
import { getDB } from './db'
import { getPendingChanges, removePendingChange, markChangeRetried } from './pendingChanges'
import { markScoresSynced } from './scoreCache'
import { upsertScore } from '@/lib/firestore/scores'
import { auth } from '@/lib/auth/config'

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline'

interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: string[]
}

// Event emitter for sync status
type SyncListener = (status: SyncStatus, pendingCount: number) => void
const listeners: Set<SyncListener> = new Set()

export function addSyncListener(listener: SyncListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyListeners(status: SyncStatus, pendingCount: number): void {
  listeners.forEach(listener => listener(status, pendingCount))
}

/**
 * Main sync function - processes all pending changes
 */
export async function syncPendingChanges(): Promise<SyncResult> {
  // Check if online
  if (!navigator.onLine) {
    notifyListeners('offline', await getPendingCount())
    return { success: false, synced: 0, failed: 0, errors: ['Offline'] }
  }
  
  // Check if authenticated
  if (!auth.currentUser) {
    return { success: false, synced: 0, failed: 0, errors: ['Not authenticated'] }
  }
  
  const pendingChanges = await getPendingChanges()
  
  if (pendingChanges.length === 0) {
    notifyListeners('idle', 0)
    return { success: true, synced: 0, failed: 0, errors: [] }
  }
  
  notifyListeners('syncing', pendingChanges.length)
  
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  }
  
  // Process changes in order (by timestamp)
  for (const change of pendingChanges) {
    try {
      await processChange(change)
      await removePendingChange(change.id)
      result.synced++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push(`${change.type}/${change.id}: ${errorMessage}`)
      result.failed++
      result.success = false
      
      // Mark for retry (up to 5 attempts)
      if (change.retryCount < 5) {
        await markChangeRetried(change.id, errorMessage)
      } else {
        // Too many retries, log and remove
        console.error('Dropping change after 5 retries:', change)
        await removePendingChange(change.id)
      }
    }
  }
  
  // Update sync metadata
  const db = await getDB()
  await db.put('syncMeta', {
    key: 'lastSync',
    lastSyncAt: Date.now(),
    status: result.success ? 'idle' : 'error',
    errorMessage: result.errors.join('; '),
  })
  
  // Notify listeners
  const remainingCount = await getPendingCount()
  notifyListeners(result.success ? 'idle' : 'error', remainingCount)
  
  return result
}

/**
 * Process a single pending change
 */
async function processChange(change: PendingChange): Promise<void> {
  switch (change.type) {
    case 'score':
      await syncScore(change)
      break
    case 'match':
      await syncMatch(change)
      break
    case 'participant':
      await syncParticipant(change)
      break
    default:
      throw new Error(`Unknown change type: ${change.type}`)
  }
}

/**
 * Sync a score change
 */
async function syncScore(change: PendingChange): Promise<void> {
  const scoreData = change.data as unknown as ScoreCreateData
  
  switch (change.action) {
    case 'create':
    case 'update':
      await upsertScore(change.matchId, scoreData)
      await markScoresSynced(change.matchId)
      break
    case 'delete':
      // Scores typically aren't deleted, but handle if needed
      console.warn('Score deletion not implemented')
      break
  }
}

/**
 * Sync a match change (placeholder)
 */
async function syncMatch(change: PendingChange): Promise<void> {
  // Match sync logic - typically not needed for MVP
  // Matches are usually created online
  console.warn('Match sync not implemented')
}

/**
 * Sync a participant change (placeholder)
 */
async function syncParticipant(change: PendingChange): Promise<void> {
  // Participant sync logic
  console.warn('Participant sync not implemented')
}

/**
 * Get pending count
 */
async function getPendingCount(): Promise<number> {
  const db = await getDB()
  return db.count('pendingChanges')
}

/**
 * Get last sync info
 */
export async function getLastSyncInfo(): Promise<{
  lastSyncAt: number | null
  status: SyncStatus
  errorMessage?: string
}> {
  const db = await getDB()
  const meta = await db.get('syncMeta', 'lastSync')
  
  if (!meta) {
    return { lastSyncAt: null, status: 'idle' }
  }
  
  return {
    lastSyncAt: meta.lastSyncAt,
    status: meta.status as SyncStatus,
    errorMessage: meta.errorMessage,
  }
}

// Import types
import type { PendingChange } from './pendingChanges'
import type { ScoreCreateData } from '@/types'
```

#### 3.2 — Background Sync Registration

**File: `src/lib/offline/registerSync.ts`**
```typescript
'use client'

import { syncPendingChanges } from './syncManager'

/**
 * Register for background sync
 */
export async function registerBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported')
    return
  }
  
  if (!('SyncManager' in window)) {
    console.warn('Background Sync not supported, using fallback')
    setupFallbackSync()
    return
  }
  
  try {
    const registration = await navigator.serviceWorker.ready
    // @ts-ignore - SyncManager types
    await registration.sync.register('sync-scores')
    console.log('Background sync registered')
  } catch (error) {
    console.error('Failed to register background sync:', error)
    setupFallbackSync()
  }
}

/**
 * Fallback sync using online/offline events
 */
function setupFallbackSync(): void {
  let syncTimeout: NodeJS.Timeout | null = null
  
  const attemptSync = () => {
    if (syncTimeout) clearTimeout(syncTimeout)
    
    syncTimeout = setTimeout(async () => {
      if (navigator.onLine) {
        await syncPendingChanges()
      }
    }, 1000) // Debounce
  }
  
  window.addEventListener('online', attemptSync)
  
  // Also sync periodically when online
  setInterval(() => {
    if (navigator.onLine) {
      attemptSync()
    }
  }, 30000) // Every 30 seconds
}

/**
 * Manual sync trigger
 */
export async function triggerManualSync(): Promise<void> {
  if (!navigator.onLine) {
    console.warn('Cannot sync while offline')
    return
  }
  
  await syncPendingChanges()
}
```

---

### Phase 4: Service Worker

#### 4.1 — Custom Service Worker

**File: `public/sw-custom.js`**
```javascript
// Custom service worker additions
// This file is imported by the next-pwa generated service worker

// Background Sync handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scores') {
    event.waitUntil(syncScores())
  }
})

async function syncScores() {
  console.log('[SW] Background sync triggered')
  
  // Post message to client to trigger sync
  const clients = await self.clients.matchAll({ type: 'window' })
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_REQUIRED' })
  })
}

// Handle messages from client
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Offline fallback
const OFFLINE_PAGE = '/offline'

self.addEventListener('fetch', (event) => {
  // Only handle navigation requests
  if (event.request.mode !== 'navigate') return
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(OFFLINE_PAGE) || caches.match('/')
    })
  )
})
```

#### 4.2 — Offline Page

**File: `src/app/offline/page.tsx`**
```tsx
'use client'

import { useEffect, useState } from 'react'
import { Screen } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { getPendingCount } from '@/lib/offline/pendingChanges'

export default function OfflinePage() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => {
      setIsOnline(true)
      // Redirect after a moment
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    }
    
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Get pending count
    getPendingCount().then(setPendingCount)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return (
      <Screen className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-bold">Back Online!</h1>
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </Screen>
    )
  }

  return (
    <Screen className="flex items-center justify-center p-4">
      <Card variant="elevated" className="text-center max-w-sm">
        <div className="text-6xl mb-4">📴</div>
        <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
        <p className="text-gray-500 mb-6">
          Don't worry — your scores are saved locally and will sync when you're back online.
        </p>
        
        {pendingCount > 0 && (
          <div className="bg-yellow-50 text-yellow-800 rounded-lg p-3 mb-4">
            <div className="font-medium">
              {pendingCount} score{pendingCount !== 1 ? 's' : ''} waiting to sync
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Button 
            fullWidth 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
          <Button 
            fullWidth 
            variant="secondary"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
        
        <p className="text-xs text-gray-400 mt-6">
          Tip: You can still enter scores while offline. They'll sync automatically when connected.
        </p>
      </Card>
    </Screen>
  )
}
```

---

### Phase 5: Sync Status UI

#### 5.1 — Sync Status Hook

**File: `src/hooks/useSyncStatus.ts`**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { addSyncListener, SyncStatus } from '@/lib/offline/syncManager'
import { getPendingCount } from '@/lib/offline/pendingChanges'

interface UseSyncStatusReturn {
  status: SyncStatus
  pendingCount: number
  isOnline: boolean
  lastSyncAt: Date | null
}

export function useSyncStatus(): UseSyncStatusReturn {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [pendingCount, setPendingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)

  useEffect(() => {
    // Initial state
    setIsOnline(navigator.onLine)
    getPendingCount().then(setPendingCount)
    
    // Listen to sync status changes
    const unsubscribe = addSyncListener((newStatus, count) => {
      setStatus(newStatus)
      setPendingCount(count)
      if (newStatus === 'idle' && count === 0) {
        setLastSyncAt(new Date())
      }
    })
    
    // Listen to online/offline
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => {
      setIsOnline(false)
      setStatus('offline')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    status,
    pendingCount,
    isOnline,
    lastSyncAt,
  }
}
```

#### 5.2 — Enhanced Sync Indicator

**File: `src/components/offline/SyncIndicator.tsx`** (update)
```tsx
'use client'

import { useSyncStatus } from '@/hooks/useSyncStatus'
import { triggerManualSync } from '@/lib/offline/registerSync'
import { cn } from '@/lib/utils'

export function SyncIndicator() {
  const { status, pendingCount, isOnline } = useSyncStatus()

  // Don't show if everything is synced and online
  if (isOnline && status === 'idle' && pendingCount === 0) {
    return null
  }

  const handleRetry = () => {
    triggerManualSync()
  }

  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 safe-top transition-colors',
      !isOnline && 'bg-red-100',
      isOnline && status === 'syncing' && 'bg-yellow-100',
      isOnline && status === 'error' && 'bg-orange-100',
      isOnline && status === 'idle' && pendingCount > 0 && 'bg-blue-100',
    )}>
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          {!isOnline && (
            <>
              <span className="text-red-800">📴</span>
              <span className="text-red-800">Offline</span>
            </>
          )}
          {isOnline && status === 'syncing' && (
            <>
              <span className="animate-spin">🔄</span>
              <span className="text-yellow-800">Syncing...</span>
            </>
          )}
          {isOnline && status === 'error' && (
            <>
              <span className="text-orange-800">⚠️</span>
              <span className="text-orange-800">Sync error</span>
            </>
          )}
          {isOnline && status === 'idle' && pendingCount > 0 && (
            <>
              <span className="text-blue-800">📤</span>
              <span className="text-blue-800">{pendingCount} pending</span>
            </>
          )}
        </div>
        
        {pendingCount > 0 && (
          <span className="text-xs text-gray-600">
            {pendingCount} change{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
        
        {isOnline && (status === 'error' || pendingCount > 0) && (
          <button
            onClick={handleRetry}
            className="text-sm font-medium text-fairway-600 hover:text-fairway-700"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
```

---

### Phase 6: PWA Install Prompt

#### 6.1 — Install Prompt Component

**File: `src/components/pwa/InstallPrompt.tsx`**
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) return // Don't show for 7 days after dismissal
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Also listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <Card variant="elevated" className="shadow-xl">
        <div className="flex items-start gap-4">
          <div className="text-4xl">⛳</div>
          <div className="flex-1">
            <h3 className="font-semibold">Install GolfSettled</h3>
            <p className="text-sm text-gray-500 mt-1">
              Add to your home screen for the best experience on the course.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <Button 
            variant="secondary" 
            onClick={handleDismiss}
            className="flex-1"
          >
            Later
          </Button>
          <Button 
            onClick={handleInstall}
            className="flex-1"
          >
            Install
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

#### 6.2 — iOS Install Instructions

**File: `src/components/pwa/IOSInstallInstructions.tsx`**
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Modal, Button } from '@/components/ui'

export function IOSInstallInstructions() {
  const [showModal, setShowModal] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Detect iOS Safari
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const safari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    setIsIOS(iOS && safari && !standalone)
    setIsInstalled(standalone)
    
    // Check if we should show instructions
    if (iOS && safari && !standalone) {
      const shown = localStorage.getItem('ios-install-shown')
      if (!shown) {
        setTimeout(() => setShowModal(true), 3000) // Show after 3 seconds
      }
    }
  }, [])

  const handleDismiss = () => {
    setShowModal(false)
    localStorage.setItem('ios-install-shown', 'true')
  }

  if (!isIOS || isInstalled) return null

  return (
    <Modal isOpen={showModal} onClose={handleDismiss} title="Add to Home Screen">
      <div className="space-y-4">
        <p className="text-gray-600">
          For the best experience on the golf course, add GolfSettled to your home screen:
        </p>
        
        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-fairway-100 text-fairway-700 flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <p className="font-medium">Tap the Share button</p>
              <p className="text-sm text-gray-500">It's at the bottom of Safari (the square with an arrow)</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-fairway-100 text-fairway-700 flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-fairway-100 text-fairway-700 flex items-center justify-center text-sm font-bold">3</span>
            <div>
              <p className="font-medium">Tap "Add" in the top right</p>
            </div>
          </li>
        </ol>
        
        <Button fullWidth onClick={handleDismiss}>
          Got it!
        </Button>
      </div>
    </Modal>
  )
}
```

---

### Phase 7: Update Layout with PWA Components

#### 7.1 — Update Root Layout

**File: `src/app/layout.tsx`** (add to existing)
```tsx
// Add these imports
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { IOSInstallInstructions } from '@/components/pwa/IOSInstallInstructions'
import { registerBackgroundSync } from '@/lib/offline/registerSync'

// Add useEffect for sync registration in a client component wrapper
// Or create a PWAProvider component

// In the body, add:
// <InstallPrompt />
// <IOSInstallInstructions />
```

#### 7.2 — PWA Provider

**File: `src/components/pwa/PWAProvider.tsx`**
```tsx
'use client'

import { useEffect } from 'react'
import { registerBackgroundSync } from '@/lib/offline/registerSync'
import { InstallPrompt } from './InstallPrompt'
import { IOSInstallInstructions } from './IOSInstallInstructions'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register background sync
    registerBackgroundSync()
    
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // New service worker activated
        window.location.reload()
      })
      
      // Listen for sync messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SYNC_REQUIRED') {
          import('@/lib/offline/syncManager').then(({ syncPendingChanges }) => {
            syncPendingChanges()
          })
        }
      })
    }
  }, [])

  return (
    <>
      {children}
      <InstallPrompt />
      <IOSInstallInstructions />
    </>
  )
}
```

---

## ⚠️ RULES FOR THIS ROLE

1. **DO NOT** modify Firestore data access patterns — Backend Engineer's job
2. **DO NOT** create UI components beyond PWA-specific — Frontend Engineer's job
3. **DO NOT** modify security rules — Security Engineer's job
4. **DO** ensure data is never lost offline
5. **DO** provide clear sync status feedback
6. **DO** handle all edge cases (offline during score entry, etc.)
7. **DO** test on actual mobile devices

---

## 📤 HANDOFF CHECKLIST

Before declaring complete, verify ALL:

### PWA Requirements
- [ ] manifest.json is valid (test with Lighthouse)
- [ ] App is installable on iOS Safari
- [ ] App is installable on Android Chrome
- [ ] App icons display correctly
- [ ] Splash screen works

### Offline Functionality
- [ ] IndexedDB stores pending changes
- [ ] Scores can be entered offline
- [ ] Data syncs when back online
- [ ] Sync status indicator works
- [ ] Offline page displays when navigating offline

### Sync Engine
- [ ] Background sync registered
- [ ] Manual sync works
- [ ] Retry logic handles failures
- [ ] Conflicts handled gracefully

### User Experience
- [ ] Install prompt appears (Android)
- [ ] iOS instructions appear
- [ ] Clear feedback on sync status
- [ ] No data loss in any scenario

### Code Quality
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] Lighthouse PWA score > 90

---

## 📝 PR TEMPLATE

**Title:** `[PWA] Offline support and installability`

**Body:**
```markdown
## Summary
Complete PWA implementation with offline-first architecture.

## Added
- PWA manifest with icons and shortcuts
- IndexedDB for offline data persistence
- Sync engine with background sync
- Install prompts (Android + iOS instructions)
- Offline page fallback
- Sync status indicators

## Offline Capabilities
- [x] Score entry works offline
- [x] Data cached in IndexedDB
- [x] Auto-sync on reconnection
- [x] Background sync support
- [x] Manual retry option

## Testing
- [x] Lighthouse PWA audit > 90
- [x] Tested on iOS Safari
- [x] Tested on Android Chrome
- [x] Tested airplane mode scenarios

## Next Steps
→ Betting Logic Engineer: Implement calculations
```

---

## 🚀 START NOW

1. Verify Frontend Engineer work is in progress
2. Install PWA dependencies
3. Configure manifest and icons
4. Implement IndexedDB storage
5. Build sync engine
6. Add install prompts
7. Test extensively on mobile
8. Complete handoff checklist
9. Create PR

**Offline-first means assuming NO connectivity, not degraded connectivity.**
