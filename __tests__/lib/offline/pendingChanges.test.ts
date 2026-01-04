/**
 * Tests for pending changes functionality
 *
 * Note: These tests use a mock IDB implementation since IndexedDB
 * is not available in the Jest environment by default.
 */

// Define mock functions at module level
const mockPut = jest.fn()
const mockGet = jest.fn()
const mockDelete = jest.fn()
const mockCount = jest.fn()
const mockGetAllFromIndex = jest.fn()

// Mock the db module - use factory function to avoid hoisting issues
jest.mock('@/lib/offline/db', () => ({
  getDB: jest.fn(() =>
    Promise.resolve({
      put: mockPut,
      get: mockGet,
      delete: mockDelete,
      count: mockCount,
      getAllFromIndex: mockGetAllFromIndex,
    })
  ),
}))

import {
  addPendingChange,
  getPendingChanges,
  getPendingChangesForMatch,
  getPendingCount,
  removePendingChange,
  markChangeRetried,
  PendingChange,
} from '@/lib/offline/pendingChanges'

describe('pendingChanges', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset navigator.onLine for each test
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
  })

  describe('addPendingChange', () => {
    it('adds a pending change with correct structure', async () => {
      const change = {
        type: 'score' as const,
        action: 'create' as const,
        data: { strokes: 4 },
        matchId: 'match-123',
      }

      const id = await addPendingChange(change)

      expect(id).toBeDefined()
      expect(mockPut).toHaveBeenCalledWith(
        'pendingChanges',
        expect.objectContaining({
          type: 'score',
          action: 'create',
          data: { strokes: 4 },
          matchId: 'match-123',
          retryCount: 0,
        })
      )
    })

    it('generates a unique ID for each change', async () => {
      const change = {
        type: 'score' as const,
        action: 'update' as const,
        data: { strokes: 5 },
        matchId: 'match-123',
      }

      const id1 = await addPendingChange(change)
      const id2 = await addPendingChange(change)

      expect(id1).not.toBe(id2)
    })

    it('sets timestamp to current time', async () => {
      const before = Date.now()

      await addPendingChange({
        type: 'score' as const,
        action: 'create' as const,
        data: {},
        matchId: 'match-123',
      })

      const after = Date.now()

      const call = mockPut.mock.calls[0][1]
      expect(call.timestamp).toBeGreaterThanOrEqual(before)
      expect(call.timestamp).toBeLessThanOrEqual(after)
    })

    it('initializes retryCount to 0', async () => {
      await addPendingChange({
        type: 'match' as const,
        action: 'update' as const,
        data: {},
        matchId: 'match-123',
      })

      const call = mockPut.mock.calls[0][1]
      expect(call.retryCount).toBe(0)
    })
  })

  describe('getPendingChanges', () => {
    it('returns all pending changes sorted by timestamp', async () => {
      const mockChanges: PendingChange[] = [
        {
          id: '1',
          type: 'score',
          action: 'create',
          data: {},
          matchId: 'match-1',
          timestamp: 1000,
          retryCount: 0,
        },
        {
          id: '2',
          type: 'score',
          action: 'update',
          data: {},
          matchId: 'match-1',
          timestamp: 2000,
          retryCount: 0,
        },
      ]

      mockGetAllFromIndex.mockResolvedValue(mockChanges)

      const changes = await getPendingChanges()

      expect(mockGetAllFromIndex).toHaveBeenCalledWith(
        'pendingChanges',
        'by-timestamp'
      )
      expect(changes).toEqual(mockChanges)
    })

    it('returns empty array when no changes', async () => {
      mockGetAllFromIndex.mockResolvedValue([])

      const changes = await getPendingChanges()

      expect(changes).toEqual([])
    })
  })

  describe('getPendingChangesForMatch', () => {
    it('returns pending changes for specific match', async () => {
      const matchId = 'match-123'
      const mockChanges: PendingChange[] = [
        {
          id: '1',
          type: 'score',
          action: 'create',
          data: {},
          matchId: matchId,
          timestamp: 1000,
          retryCount: 0,
        },
      ]

      mockGetAllFromIndex.mockResolvedValue(mockChanges)

      const changes = await getPendingChangesForMatch(matchId)

      expect(mockGetAllFromIndex).toHaveBeenCalledWith(
        'pendingChanges',
        'by-match',
        matchId
      )
      expect(changes).toEqual(mockChanges)
    })
  })

  describe('getPendingCount', () => {
    it('returns count of pending changes', async () => {
      mockCount.mockResolvedValue(5)

      const count = await getPendingCount()

      expect(mockCount).toHaveBeenCalledWith('pendingChanges')
      expect(count).toBe(5)
    })

    it('returns 0 when no pending changes', async () => {
      mockCount.mockResolvedValue(0)

      const count = await getPendingCount()

      expect(count).toBe(0)
    })
  })

  describe('removePendingChange', () => {
    it('deletes the pending change by id', async () => {
      const id = 'change-123'

      await removePendingChange(id)

      expect(mockDelete).toHaveBeenCalledWith('pendingChanges', id)
    })
  })

  describe('markChangeRetried', () => {
    it('increments retry count', async () => {
      const existingChange: PendingChange = {
        id: 'change-123',
        type: 'score',
        action: 'create',
        data: {},
        matchId: 'match-1',
        timestamp: 1000,
        retryCount: 2,
      }

      mockGet.mockResolvedValue(existingChange)

      await markChangeRetried('change-123')

      expect(mockPut).toHaveBeenCalledWith('pendingChanges', {
        ...existingChange,
        retryCount: 3,
        lastError: undefined,
      })
    })

    it('sets lastError when provided', async () => {
      const existingChange: PendingChange = {
        id: 'change-123',
        type: 'score',
        action: 'create',
        data: {},
        matchId: 'match-1',
        timestamp: 1000,
        retryCount: 0,
      }

      mockGet.mockResolvedValue(existingChange)

      await markChangeRetried('change-123', 'Network error')

      expect(mockPut).toHaveBeenCalledWith('pendingChanges', {
        ...existingChange,
        retryCount: 1,
        lastError: 'Network error',
      })
    })

    it('does nothing if change not found', async () => {
      mockGet.mockResolvedValue(null)

      await markChangeRetried('nonexistent-id')

      expect(mockPut).not.toHaveBeenCalled()
    })
  })
})
