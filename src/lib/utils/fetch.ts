/**
 * Fetch utility with automatic retry and exponential backoff
 */

export interface FetchWithRetryOptions extends RequestInit {
  /** Number of retry attempts (default: 3) */
  retries?: number
  /** Initial retry delay in ms (default: 1000) */
  retryDelay?: number
  /** HTTP status codes that should trigger retry (default: [408, 429, 500, 502, 503, 504]) */
  retryStatusCodes?: number[]
}

const DEFAULT_RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504]

/**
 * Fetch with automatic retry on network errors or specified status codes
 * Uses exponential backoff between retries
 *
 * @param url - URL to fetch
 * @param options - Fetch options plus retry configuration
 * @returns Response from successful fetch
 * @throws Error if all retries exhausted
 *
 * @example
 * const response = await fetchWithRetry('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 *   retries: 3,
 *   retryDelay: 1000,
 * })
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 1000,
    retryStatusCodes = DEFAULT_RETRY_STATUS_CODES,
    ...fetchOptions
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions)

      // Check if we should retry based on status code
      if (!response.ok && retryStatusCodes.includes(response.status) && attempt < retries) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
        const delay = retryDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network request failed')

      // Only retry on network errors, not on final attempt
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

/**
 * Check if an error is a network error (no connectivity)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('fetch')
  }
  return false
}

/**
 * Check if an error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === 'AbortError' ||
           error.message.toLowerCase().includes('timeout')
  }
  return false
}
