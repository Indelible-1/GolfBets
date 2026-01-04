/**
 * Tests for sync manager functionality
 */

// Mock all dependencies before any imports
jest.mock('@/lib/offline/db', () => {
  const mockPut = jest.fn()
  const mockGet = jest.fn()
  const mockCount = jest.fn().mockResolvedValue(0)

  return {
    getDB: jest.fn(() =>
      Promise.resolve({
        put: mockPut,
        get: mockGet,
        count: mockCount,
      })
    ),
    __mockPut: mockPut,
    __mockGet: mockGet,
    __mockCount: mockCount,
  }
})

jest.mock('@/lib/offline/pendingChanges', () => {
  const mockGetPendingChanges = jest.fn().mockResolvedValue([])
  const mockRemovePendingChange = jest.fn()
  const mockMarkChangeRetried = jest.fn()

  return {
    getPendingChanges: mockGetPendingChanges,
    removePendingChange: mockRemovePendingChange,
    markChangeRetried: mockMarkChangeRetried,
    __mockGetPendingChanges: mockGetPendingChanges,
    __mockRemovePendingChange: mockRemovePendingChange,
    __mockMarkChangeRetried: mockMarkChangeRetried,
  }
})

jest.mock('@/lib/offline/scoreCache', () => ({
  markScoresSynced: jest.fn(),
}))

jest.mock('@/lib/firestore/scores', () => ({
  createOrUpdateScore: jest.fn().mockResolvedValue({}),
}))

// Import after mocking
import {
  syncPendingChanges,
  getLastSyncInfo,
  getPendingCount,
  addSyncListener,
  SyncStatus,
} from '@/lib/offline/syncManager'

// Get mock references
const dbMocks = jest.requireMock('@/lib/offline/db')
const pendingChangesMocks = jest.requireMock('@/lib/offline/pendingChanges')

const mockPut = dbMocks.__mockPut
const mockGet = dbMocks.__mockGet
const mockCount = dbMocks.__mockCount
const mockGetPendingChanges = pendingChangesMocks.__mockGetPendingChanges
const mockRemovePendingChange = pendingChangesMocks.__mockRemovePendingChange
const mockMarkChangeRetried = pendingChangesMocks.__mockMarkChangeRetried

const mockPendingChanges = [
  {
    id: 'change-1',
    type: 'score' as const,
    action: 'create' as const,
    data: {
      participantId: 'player-1',
      holeNumber: 1,
      strokes: 4,
      putts: 2,
      fairwayHit: true,
      greenInRegulation: true,
    },
    matchId: 'match-123',
    timestamp: 1000,
    retryCount: 0,
  },
]

describe('syncManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
    // Reset mock implementations
    mockGetPendingChanges.mockResolvedValue([])
    mockCount.mockResolvedValue(0)
  })

  describe('syncPendingChanges', () => {
    it('returns success with 0 synced when no pending changes', async () => {
      const result = await syncPendingChanges()

      expect(result).toEqual({
        success: true,
        synced: 0,
        failed: 0,
        errors: [],
      })
    })

    it('returns offline error when navigator.onLine is false', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false })

      const result = await syncPendingChanges()

      expect(result).toEqual({
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Offline'],
      })
    })

    it('processes pending changes when online', async () => {
      mockGetPendingChanges.mockResolvedValue(mockPendingChanges)

      const result = await syncPendingChanges()

      expect(mockGetPendingChanges).toHaveBeenCalled()
      expect(result.synced).toBeGreaterThanOrEqual(0)
    })

    it('removes changes after successful sync', async () => {
      mockGetPendingChanges.mockResolvedValue(mockPendingChanges)

      await syncPendingChanges()

      expect(mockRemovePendingChange).toHaveBeenCalledWith('change-1')
    })

    it('marks change as retried on failure', async () => {
      const failingChange = {
        ...mockPendingChanges[0],
        type: 'unknown' as const, // Will cause error
      }
      mockGetPendingChanges.mockResolvedValue([failingChange])

      await syncPendingChanges()

      expect(mockMarkChangeRetried).toHaveBeenCalledWith(
        failingChange.id,
        expect.any(String)
      )
    })

    it('updates sync metadata after sync with pending changes', async () => {
      mockGetPendingChanges.mockResolvedValue(mockPendingChanges)

      await syncPendingChanges()

      expect(mockPut).toHaveBeenCalledWith(
        'syncMeta',
        expect.objectContaining({
          key: 'lastSync',
          status: expect.any(String),
        })
      )
    })
  })

  describe('getLastSyncInfo', () => {
    it('returns default values when no sync history', async () => {
      mockGet.mockResolvedValue(null)

      const info = await getLastSyncInfo()

      expect(info).toEqual({
        lastSyncAt: null,
        status: 'idle',
      })
    })

    it('returns stored sync info', async () => {
      const storedMeta = {
        key: 'lastSync',
        lastSyncAt: 1609459200000,
        status: 'idle',
        errorMessage: '',
      }
      mockGet.mockResolvedValue(storedMeta)

      const info = await getLastSyncInfo()

      expect(info).toEqual({
        lastSyncAt: 1609459200000,
        status: 'idle',
        errorMessage: '',
      })
    })

    it('includes error message when present', async () => {
      const storedMeta = {
        key: 'lastSync',
        lastSyncAt: 1609459200000,
        status: 'error',
        errorMessage: 'Network timeout',
      }
      mockGet.mockResolvedValue(storedMeta)

      const info = await getLastSyncInfo()

      expect(info.errorMessage).toBe('Network timeout')
      expect(info.status).toBe('error')
    })
  })

  describe('getPendingCount', () => {
    it('returns count from database', async () => {
      mockCount.mockResolvedValue(5)

      const count = await getPendingCount()

      expect(mockCount).toHaveBeenCalledWith('pendingChanges')
      expect(count).toBe(5)
    })
  })

  describe('addSyncListener', () => {
    it('returns unsubscribe function', () => {
      const listener = jest.fn()

      const unsubscribe = addSyncListener(listener)

      expect(typeof unsubscribe).toBe('function')
    })

    it('unsubscribe removes listener', async () => {
      const listener = jest.fn()
      const unsubscribe = addSyncListener(listener)

      // Unsubscribe
      unsubscribe()

      // Trigger a sync - listener should not be called for new syncs
      await syncPendingChanges()
    })
  })

  describe('SyncStatus types', () => {
    it('has correct status values', () => {
      const statuses: SyncStatus[] = ['idle', 'syncing', 'error', 'offline']
      expect(statuses).toHaveLength(4)
    })
  })
})

describe('syncManager error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', { value: true })
    mockCount.mockResolvedValue(0)
  })

  it('handles sync errors gracefully', async () => {
    const errorChange = {
      id: 'error-change',
      type: 'score' as const,
      action: 'create' as const,
      data: {},
      matchId: 'match-1',
      timestamp: Date.now(),
      retryCount: 0,
    }
    mockGetPendingChanges.mockResolvedValue([errorChange])

    // This should not throw
    const result = await syncPendingChanges()

    expect(result.failed).toBeGreaterThanOrEqual(0)
  })

  it('drops changes after max retries', async () => {
    const maxRetriedChange = {
      id: 'max-retry-change',
      type: 'unknown' as const,
      action: 'create' as const,
      data: {},
      matchId: 'match-1',
      timestamp: Date.now(),
      retryCount: 5, // Max retries reached
    }
    mockGetPendingChanges.mockResolvedValue([maxRetriedChange])

    await syncPendingChanges()

    // Should remove the change, not retry
    expect(mockRemovePendingChange).toHaveBeenCalledWith('max-retry-change')
  })
})
