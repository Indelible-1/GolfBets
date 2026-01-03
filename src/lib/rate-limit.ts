import { LRUCache } from 'lru-cache'

export interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
}

/**
 * Simple rate limiter using LRU cache
 * Suitable for MVP - no Redis needed
 */
export function rateLimit(config: RateLimitConfig) {
  const tokenCache = new LRUCache<string, number>({
    max: config.uniqueTokenPerInterval,
    ttl: config.interval,
  })

  return {
    /**
     * Check if identifier has exceeded rate limit
     * @returns { success: boolean, remaining: number }
     */
    check: async (identifier: string, limit: number) => {
      const tokenCount = (tokenCache.get(identifier) ?? 0) + 1

      if (tokenCount > limit) {
        return { success: false, remaining: 0 }
      }

      tokenCache.set(identifier, tokenCount)

      return {
        success: true,
        remaining: limit - tokenCount,
      }
    },
  }
}
