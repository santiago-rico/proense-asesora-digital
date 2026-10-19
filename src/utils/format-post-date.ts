// Editors date posts in Colombia, so every visitor sees the Bogotá calendar
// day: 2025-07-01T02:00:00Z is still June 30th there.
const postDateFormat = new Intl.DateTimeFormat('es-CO', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'America/Bogota',
});

/**
 * A blog post's Sanity `date` (an ISO datetime) in Spanish, e.g.
 * "30 de junio de 2025". Returns '' for a missing or invalid date.
 */
export function formatPostDate(date: string | null | undefined): string {
  if (!date) return '';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '' : postDateFormat.format(parsed);
}
