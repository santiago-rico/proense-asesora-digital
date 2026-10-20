import { describe, it, expect } from 'vitest';
import { CSRF_ERROR_CODE, isCsrfError } from './csrf-error';

describe('isCsrfError', () => {
  it.each(['Invalid CSRF token', 'Token de seguridad inválido'])('is true for a 403 with the CSRF code, whatever its message ("%s")', message => {
    expect(isCsrfError(403, { message, code: CSRF_ERROR_CODE })).toBe(true);
  });

  it('ignores the message: a 403 without the code is not a CSRF failure', () => {
    expect(isCsrfError(403, { message: 'Invalid CSRF token' })).toBe(false);
    expect(isCsrfError(403, { message: 'Forbidden', code: 'SOMETHING_ELSE' })).toBe(false);
  });

  it('is false for a 403 without a JSON body (e.g. an HTML page from the platform)', () => {
    expect(isCsrfError(403, null)).toBe(false);
  });

  it('is false for any other status, even with the code', () => {
    expect(isCsrfError(400, { code: CSRF_ERROR_CODE })).toBe(false);
    expect(isCsrfError(500, { code: CSRF_ERROR_CODE })).toBe(false);
  });
});
