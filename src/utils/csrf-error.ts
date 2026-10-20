/**
 * How the form endpoints in api/ report a failed CSRF check: status 403 with a
 * JSON body `{ message, code: CSRF_ERROR_CODE }`. The message is for people and
 * its wording differs per endpoint ("Invalid CSRF token", "Token de seguridad
 * inválido"), so clients detect the failure by the code, never by the message.
 */
export const CSRF_ERROR_CODE = 'CSRF_INVALID';

/** Whether a form endpoint's response (see `safeParseResponse`) is a CSRF rejection. */
export function isCsrfError(status: number, data: Record<string, unknown> | null): boolean {
  return status === 403 && data?.code === CSRF_ERROR_CODE;
}
