import { describe, it, expect } from 'vitest';
import { formatPostDate } from './format-post-date';

describe('formatPostDate', () => {
  it('formats a Sanity datetime in Spanish', () => {
    expect(formatPostDate('2025-06-30T12:00:00.000Z')).toBe('30 de junio de 2025');
    expect(formatPostDate('2024-12-05T15:30:00Z')).toBe('5 de diciembre de 2024');
  });

  it('uses the Bogotá calendar day whatever the runtime timezone', () => {
    // 02:00 UTC on July 1st is 21:00 on June 30th in Bogotá (UTC-5).
    expect(formatPostDate('2025-07-01T02:00:00Z')).toBe('30 de junio de 2025');
    expect(formatPostDate('2025-07-01T05:00:00Z')).toBe('1 de julio de 2025');
  });

  it.each([null, undefined, '', 'no es una fecha'])('returns an empty string for %j', date => {
    expect(formatPostDate(date)).toBe('');
  });
});
