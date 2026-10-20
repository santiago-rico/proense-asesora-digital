import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '../../api/_utils/vercel-types';

// The endpoints import the Brevo client at top level; mock it so importing them
// never needs API keys or network access.
vi.mock('../../src/utils/brevo.js', () => ({
  sendTransactionalEmail: vi.fn(),
}));

import sendEmail from '../../api/send-email';
import sendQuoteRequest from '../../api/send-quote-request';
import sendInsuranceApplication from '../../api/send-insurance-application-email';
import sendModificationRequest from '../../api/send-modification-request';
import sendCancellationRequest from '../../api/send-cancellation-request';
import { _store } from '../../api/_utils/rate-limiter';
import { sendTransactionalEmail } from '../../src/utils/brevo.js';
import { CSRF_ERROR_CODE, isCsrfError } from '../../src/utils/csrf-error';

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

/**
 * Every endpoint that checks a CSRF token, with the message its 403 has always
 * carried. Clients detect the failure by `code`; the messages stay as they were,
 * because pages loaded before a deploy still look for "CSRF" in them.
 */
const ENDPOINTS: [name: string, handler: Handler, message: string][] = [
  ['send-email', sendEmail, 'Invalid CSRF token'],
  ['send-quote-request', sendQuoteRequest, 'Invalid CSRF token'],
  ['send-insurance-application-email', sendInsuranceApplication, 'Invalid CSRF token'],
  ['send-modification-request', sendModificationRequest, 'Invalid CSRF token'],
  ['send-cancellation-request', sendCancellationRequest, 'Token de seguridad inválido'],
];

/** CSRF credentials a request can carry, none of them valid. */
const BAD_CREDENTIALS: [label: string, headers: Record<string, string>][] = [
  ['no secret cookie and no token', {}],
  ['a token but no secret cookie', { 'x-csrf-token': 'some-token' }],
  ['a secret cookie but no token', { cookie: '_csrf_secret=some-secret' }],
  ['a token that does not match the secret', { cookie: '_csrf_secret=some-secret', 'x-csrf-token': 'forged-token' }],
];

function response() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    setHeader: vi.fn(),
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    end: vi.fn(),
  };
  return res;
}

beforeEach(() => {
  _store.clear();
  vi.mocked(sendTransactionalEmail).mockClear();
});

describe.each(ENDPOINTS)('%s: CSRF rejection', (_name, handler, message) => {
  it.each(BAD_CREDENTIALS)('answers 403 with the CSRF error code for %s', async (_label, headers) => {
    const req = {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.9', ...headers },
      body: {},
    } as unknown as VercelRequest;
    const res = response();

    await handler(req, res as unknown as VercelResponse);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message, code: CSRF_ERROR_CODE });
    expect(isCsrfError(res.statusCode, res.body as Record<string, unknown>)).toBe(true);
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
  });
});
