/**
 * fetch wrapper that adds a request timeout (via AbortController) and automatic
 * retries for transient network failures.
 *
 * Motivation: mobile networks frequently drop or reset connections mid-request
 * (WiFi <-> cellular handoff, weak signal, screen lock). A bare `fetch` surfaces
 * these as a rejected promise ("Failed to fetch") with no recovery, which the
 * forms render as a generic "Error de Conexión". A single quick retry recovers a
 * large fraction of those transient drops.
 *
 * Retry policy:
 * - Retries ONLY on network-level rejections (e.g. `TypeError: Failed to fetch`).
 * - Does NOT retry on timeouts (AbortError): a request that was too slow will
 *   most likely time out again and, because our form endpoints send emails,
 *   re-sending risks a duplicate. Timeouts are surfaced so the caller can show a
 *   "took too long" message instead.
 * - Known tradeoff: if a request actually reached the server and it fully
 *   processed (e.g. sent the emails) but the RESPONSE was lost mid-flight
 *   (common on a WiFi<->cellular handoff), the retry re-submits and can produce
 *   a duplicate. Accepted for now — the common `Failed to fetch` is a pre-server
 *   connection failure (no duplicate) and duplicate emails are non-destructive;
 *   a true fix needs a server-side idempotency key.
 * - Never retries based on HTTP status — a completed response (even 4xx/5xx) is
 *   returned to the caller as-is.
 */
export interface FetchWithRetryOptions extends RequestInit {
  /** Abort the attempt after this many ms. Default 45000. */
  timeoutMs?: number;
  /** Number of *additional* attempts after the first. Default 1. */
  retries?: number;
  /** Base delay between attempts in ms (grows linearly per attempt). Default 1500. */
  retryDelayMs?: number;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function isTimeoutError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const {
    timeoutMs = 45000,
    retries = 1,
    retryDelayMs = 1500,
    ...init
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      // Don't retry timeouts (would likely time out again + risk duplicate send),
      // and stop once we've exhausted our attempts.
      if (isTimeoutError(error) || attempt === retries) {
        break;
      }

      // Linear backoff before the next attempt.
      await delay(retryDelayMs * (attempt + 1));
    }
  }

  throw lastError;
}
