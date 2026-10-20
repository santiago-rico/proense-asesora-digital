/**
 * How MultiStepForm (emisión) handles the server's answer to a submission.
 *
 * Validation and the steps' contents are covered by formSchema and the Step
 * tests, and e2e/tests/critical-paths/insurance-application.spec.ts walks the
 * real form. Here the steps are stubbed and the resolver accepts anything, so
 * each test goes straight to "Firmar y Enviar Solicitud" and controls only the
 * response.
 */

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiStepForm from '../MultiStepForm';
import { CSRF_ERROR_CODE } from '@/utils/csrf-error';

// A stable toast: the form's CSRF effect depends on it
const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

// Every step validates, whatever its values
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => async (values: Record<string, unknown>) => ({ values, errors: {} }),
}));
vi.mock('../Step1_BasicInfo', () => ({ default: () => null }));
vi.mock('../Step2_InsuranceSelection', () => ({ default: () => null }));
vi.mock('../Step3_ConditionalFields', () => ({ default: () => null }));
vi.mock('../Step4_Declaration', () => ({ default: () => null }));
vi.mock('../Step5_Summary', () => ({ default: () => null }));

const ENDPOINT = '/api/send-insurance-application-email';

global.fetch = vi.fn();

const jsonResponse = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: () => Promise.resolve(body),
});

/** Answers the CSRF token request, and the submission with `status` and `body`. */
function mockSubmission(status: number, body: Record<string, unknown>) {
  (global.fetch as Mock).mockImplementation((url: string) =>
    Promise.resolve(url === ENDPOINT ? jsonResponse(status, body) : jsonResponse(200, { token: 'mock-csrf-token' }))
  );
}

/**
 * Captures the delayed `window.location.reload()` after a CSRF failure instead
 * of scheduling it (jsdom can't navigate). Other timers run as usual.
 */
function interceptReload() {
  const realSetTimeout = globalThis.setTimeout;
  const reload = vi.fn();
  vi.spyOn(globalThis, 'setTimeout').mockImplementation(((handler: () => void, timeout?: number) => {
    if (timeout === 2000) {
      reload();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    }
    return realSetTimeout(handler, timeout);
  }) as typeof setTimeout);
  return reload;
}

const NEXT_STEPS = ['Selección de Seguro', 'Detalles del Seguro', 'Declaración', 'Resumen y Envío'];

/** Renders the form, goes through every step and presses the submit button. */
async function submitForm() {
  const user = userEvent.setup();
  render(<MultiStepForm />);

  for (const step of NEXT_STEPS) {
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByRole('heading', { level: 3, name: step });
  }

  // Enabled once the CSRF token has loaded
  const send = await screen.findByRole('button', { name: 'Firmar y Enviar Solicitud' });
  await user.click(send);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(ENDPOINT, expect.anything()));
}

describe('MultiStepForm: server responses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns and reloads the page on a 403 with the CSRF error code', async () => {
    // The real server's body (api/send-insurance-application-email.ts)
    mockSubmission(403, { message: 'Invalid CSRF token', code: CSRF_ERROR_CODE });
    const reload = interceptReload();

    await submitForm();

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error de Seguridad',
          description: 'Token de seguridad inválido. Recargando página...',
          variant: 'destructive',
        })
      );
    });
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('treats a 403 without the CSRF error code as an ordinary error, even if its message says CSRF', async () => {
    // Message text is not a contract: only `code` marks a CSRF rejection
    mockSubmission(403, { message: 'Invalid CSRF token' });
    const reload = interceptReload();

    await submitForm();

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Error al Enviar Solicitud', description: 'Invalid CSRF token' })
      );
    });
    expect(toastMock).not.toHaveBeenCalledWith(expect.objectContaining({ title: 'Error de Seguridad' }));
    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Firmar y Enviar Solicitud' })).toBeEnabled();
  });
});
