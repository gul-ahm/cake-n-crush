import { describe, it, expect, vi } from 'vitest'
import { timeAgo } from '../src/utils/time'

describe('timeAgo', () => {
  it('returns relative times for common intervals', () => {
    const now = 1_700_000_000_000
    vi.spyOn(Date, 'now').mockReturnValue(now)
    expect(timeAgo(now - 30_000)).toBe('30s ago')
    expect(timeAgo(now - 90_000)).toBe('1m ago')
    expect(timeAgo(now - 3_600_000)).toBe('1h ago')
    expect(timeAgo(now - 86_400_000)).toBe('1d ago')
    vi.restoreAllMocks()
  })
})
