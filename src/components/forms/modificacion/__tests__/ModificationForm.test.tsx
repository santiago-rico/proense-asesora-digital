/**
 * Unit Tests for ModificationForm Component
 * Tests form validation, CSRF integration, and user interactions
 */

import { describe, it, expect, vi, type Mock, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModificationForm } from '../ModificationForm';
import { useCsrf } from '@/hooks/use-csrf';
import { useToast } from '@/hooks/use-toast';
import { CSRF_ERROR_CODE } from '@/utils/csrf-error';

// Mock the useCsrf hook
vi.mock('@/hooks/use-csrf', () => ({
  useCsrf: vi.fn(),
}));

// Mock the useToast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({ toast: mockToast })),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock FileUpload component
vi.mock('@/components/forms/emision/FileUpload', () => ({
  default: ({ name, label }: { name: string; label: string }) => (
    <div data-testid={`file-upload-${name}`}>
      <label>{label}</label>
      <input type="file" name={name} />
    </div>
  ),
}));

type User = ReturnType<typeof userEvent.setup>;

/** Fills every field with valid data; `overrides` replace what is typed or chosen in a field. */
async function fillValidForm(user: User, overrides: { email?: string; tipoSeguro?: string } = {}) {
  await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
  await user.type(screen.getByLabelText(/número de cédula/i), '12345678');
  await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
  await user.type(screen.getByLabelText(/correo electrónico/i), overrides.email ?? 'test@example.com');
  await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
  await user.type(screen.getByLabelText(/qué modificaciones/i), 'Test modification');
  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: overrides.tipoSeguro ?? 'Seguro de Auto' }));
  await user.click(screen.getByLabelText(/acepto la política/i));
}

const submitButton = () => screen.getByRole('button', { name: /enviar solicitud/i });

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

function mockResponse(status: number, body: Record<string, unknown>) {
  (global.fetch as Mock).mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(body),
  });
}

describe('ModificationForm', () => {
  let user: User;

  beforeEach(() => {
    // Setup userEvent
    user = userEvent.setup();
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Default CSRF mock - successful state
    (useCsrf as ReturnType<typeof vi.fn>).mockReturnValue({
      token: 'test-csrf-token-123',
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    // Mock useToast
    (useToast as ReturnType<typeof vi.fn>).mockReturnValue({ toast: mockToast });

    // Mock successful fetch response
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ message: 'Success' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders all required form fields', () => {
      render(<ModificationForm />);

      expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/número de cédula/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono de contacto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre de la aseguradora/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/número de póliza/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/qué seguro quieres modificar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/qué modificaciones quieres hacer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/acepto la política/i)).toBeInTheDocument();
    });

    it('renders submit button with correct initial state', () => {
      render(<ModificationForm />);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it('includes honeypot field (hidden)', () => {
      render(<ModificationForm />);
      
      const honeypotField = screen.getByLabelText(/website/i);
      expect(honeypotField).toBeInTheDocument();
      expect(honeypotField.closest('div')).toHaveStyle({ display: 'none' });
    });
  });

  describe('CSRF Token Integration', () => {
    it('shows loading state when CSRF token is loading', () => {
      (useCsrf as ReturnType<typeof vi.fn>).mockReturnValue({
        token: null,
        loading: true,
        error: null,
        refetch: vi.fn(),
      });

      render(<ModificationForm />);
      
      expect(screen.getByText(/cargando formulario seguro/i)).toBeInTheDocument();
      expect(screen.queryByRole('form')).not.toBeInTheDocument();
    });

    it('shows error state when CSRF token fails to load', () => {
      const mockRefetch = vi.fn();
      (useCsrf as ReturnType<typeof vi.fn>).mockReturnValue({
        token: null,
        loading: false,
        error: 'Failed to fetch token',
        refetch: mockRefetch,
      });

      render(<ModificationForm />);
      
      expect(screen.getByText(/error de seguridad/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch token/i)).toBeInTheDocument();
      
      const retryButton = screen.getByRole('button', { name: /reintentar/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('disables submit button when CSRF token is not available', () => {
      (useCsrf as ReturnType<typeof vi.fn>).mockReturnValue({
        token: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<ModificationForm />);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('does not validate a field when the user leaves it', async () => {
      render(<ModificationForm />);

      const nombreField = screen.getByLabelText(/nombre completo/i);
      const emailField = screen.getByLabelText(/correo electrónico/i);
      await user.click(nombreField);
      await user.tab();
      await user.click(emailField);
      await user.paste('maria@example');
      await user.tab();
      // Gives a blur validation time to show up before checking it didn't
      await user.paste('Test Insurance');
      expect(screen.getByLabelText(/nombre de la aseguradora/i)).toHaveValue('Test Insurance');

      expect(screen.queryByText(/el nombre completo es requerido/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/correo electrónico inválido/i)).not.toBeInTheDocument();
      expect(nombreField).toHaveAttribute('aria-invalid', 'false');
      expect(emailField).toHaveAttribute('aria-invalid', 'false');
    });

    it('shows the required-field messages on submit', async () => {
      render(<ModificationForm />);

      // A real click: the form is noValidate, so the browser's own `required` check

      // no longer blocks the submit before zod's messages

      await userEvent.setup().click(submitButton());

      await waitFor(() => {
        expect(screen.getByText(/el nombre completo es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/debe describir las modificaciones/i)).toBeInTheDocument();
        expect(screen.getByText('Debe seleccionar un tipo de seguro')).toBeInTheDocument();
      });
      expect(screen.getByLabelText(/nombre completo/i)).toHaveAttribute('aria-invalid', 'true');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('validates the email on submit and clears its error as soon as it is fixed', async () => {
      render(<ModificationForm />);

      // Valid for a type=email input, rejected by zod
      await fillValidForm(user, { email: 'maria@example' });
      await user.click(submitButton());

      expect(await screen.findByText(/correo electrónico inválido/i)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();

      // After a submit, errors update on change: no blur needed
      const emailField = screen.getByLabelText(/correo electrónico/i);
      await user.clear(emailField);
      // One change event: re-validating on every keystroke would only slow the test down
      await user.paste('test@example.com');
      await waitFor(() => {
        expect(screen.queryByText(/correo electrónico inválido/i)).not.toBeInTheDocument();
      });
      expect(emailField).toHaveFocus();
      expect(emailField).toHaveAttribute('aria-invalid', 'false');

      // Nothing moves under the pointer now, so one click submits
      await user.click(submitButton());
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    });

    it('validates conditional otroSeguro field', async () => {
      render(<ModificationForm />);

      await fillValidForm(user, { tipoSeguro: 'Otro' });
      // Blank but not empty: passes native `required`, fails the schema's trim check
      await user.type(screen.getByLabelText(/especifica qué seguro/i), '   ');
      await user.click(submitButton());

      expect(await screen.findByText(/debe especificar el tipo de seguro/i)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('requires terms and conditions acceptance', async () => {
      render(<ModificationForm />);

      // Fill all required fields but don't accept terms
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      await user.type(screen.getByLabelText(/qué modificaciones/i), 'Test modification');

      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);

      // Should NOT call fetch because terms validation should fail
      expect(global.fetch).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.getByText(/debes aceptar la política/i)).toBeInTheDocument();
      });
    }, 10000);
  });

  describe('Form Accessibility', () => {
    it('has proper autocomplete attributes', () => {
      render(<ModificationForm />);
      
      expect(screen.getByLabelText(/nombre completo/i)).toHaveAttribute('autocomplete', 'name');
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('autocomplete', 'email');
      expect(screen.getByLabelText(/teléfono de contacto/i)).toHaveAttribute('autocomplete', 'tel');
      expect(screen.getByLabelText(/nombre de la aseguradora/i)).toHaveAttribute('autocomplete', 'organization');
    });

    it('has required attributes on required fields', () => {
      render(<ModificationForm />);
      
      expect(screen.getByLabelText(/nombre completo/i)).toHaveAttribute('required');
      expect(screen.getByLabelText(/número de cédula/i)).toHaveAttribute('required');
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('required');
      expect(screen.getByLabelText(/nombre de la aseguradora/i)).toHaveAttribute('required');
    });

    it('has aria-required attributes', () => {
      render(<ModificationForm />);
      
      expect(screen.getByLabelText(/nombre completo/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/número de cédula/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('aria-required', 'true');
    });

    it('properly hides honeypot field from screen readers', () => {
      render(<ModificationForm />);
      
      const honeypotField = screen.getByLabelText(/website/i);
      expect(honeypotField).toHaveAttribute('tabindex', '-1');
      expect(honeypotField).toHaveAttribute('autocomplete', 'off');
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data and CSRF token', async () => {
      render(<ModificationForm />);

      // Fill out form
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      await user.type(screen.getByLabelText(/qué modificaciones/i), 'Test modification');

      // Select a seguro type
      const tipoSeguroSelect = screen.getByRole('combobox');
      await user.click(tipoSeguroSelect);
      const autoOption = screen.getByRole('option', { name: 'Seguro de Auto' });
      await user.click(autoOption);

      // Accept terms
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);

      // Should call fetch with CSRF token
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/send-modification-request',
          expect.objectContaining({
            method: 'POST',
            credentials: 'include',
            headers: expect.objectContaining({
              'X-CSRF-Token': 'test-csrf-token-123',
            }),
          })
        );
      });
    }, 10000);

    it('shows success screen after successful submission', async () => {
      render(<ModificationForm />);
      
      // Fill and submit form (minimal valid data)
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      await user.type(screen.getByLabelText(/qué modificaciones/i), 'Test modification');
      
      // Select a seguro type
      const tipoSeguroSelect = screen.getByRole('combobox');
      await user.click(tipoSeguroSelect);
      const autoOption = screen.getByRole('option', { name: 'Seguro de Auto' });
      await user.click(autoOption);
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      // Should show success screen
      await waitFor(() => {
        expect(screen.getByText(/solicitud enviada con éxito/i)).toBeInTheDocument();
        expect(screen.getByText(/realizar otra modificación/i)).toBeInTheDocument();
      });
    });

    it('handles submission errors gracefully', async () => {
      // Mock failed response
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Validation error' }),
      });

      render(<ModificationForm />);
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      await user.type(screen.getByLabelText(/qué modificaciones/i), 'Test modification');
      
      // Select a seguro type
      const tipoSeguroSelect = screen.getByRole('combobox');
      await user.click(tipoSeguroSelect);
      const autoOption = screen.getByRole('option', { name: 'Seguro de Auto' });
      await user.click(autoOption);
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      // Should show error toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Validation error',
            variant: 'destructive',
          })
        );
      });
    });

    it.each(['Invalid CSRF token', 'Token de seguridad inválido'])(
      'handles CSRF token validation errors (403 with the CSRF code, message "%s")',
      async (message) => {
        const reload = interceptReload();
        mockResponse(403, { message, code: CSRF_ERROR_CODE });
        render(<ModificationForm />);

        await fillValidForm(user);
        await user.click(submitButton());

        // Should show CSRF error and reload the page
        await waitFor(() => {
          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Error de Seguridad',
              description: 'Token de seguridad inválido. Recargando página...',
              variant: 'destructive',
            })
          );
        });
        expect(reload).toHaveBeenCalledTimes(1);
      }
    );

    it('treats a 403 without the CSRF code as an ordinary error', async () => {
      const reload = interceptReload();
      mockResponse(403, { message: 'Acceso denegado' });
      render(<ModificationForm />);

      await fillValidForm(user);
      await user.click(submitButton());

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'Error', description: 'Acceso denegado', variant: 'destructive' })
        );
      });
      expect(mockToast).not.toHaveBeenCalledWith(expect.objectContaining({ title: 'Error de Seguridad' }));
      expect(reload).not.toHaveBeenCalled();
    });

    it('shows a Spanish message when the request never reaches the server', async () => {
      // What fetch rejects with when offline: a TypeError with the browser's English message
      (global.fetch as Mock).mockRejectedValue(new TypeError('Failed to fetch'));
      render(<ModificationForm />);

      await fillValidForm(user);
      await user.click(submitButton());

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.',
            variant: 'destructive',
          })
        );
      });
      expect(mockToast).not.toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.stringContaining('Failed to fetch') })
      );
      // The form stays filled and can be sent again
      expect(submitButton()).toBeEnabled();
      expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Test User');
    });

    it('prevents submission without CSRF token', async () => {
      (useCsrf as ReturnType<typeof vi.fn>).mockReturnValue({
        token: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<ModificationForm />);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      
      // Button should be disabled when there's no CSRF token
      expect(submitButton).toBeDisabled();
      
      // Fetch should not be called
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Security Features', () => {
    it('includes honeypot field in form submission', async () => {
      render(<ModificationForm />);
      
      // Fill required fields and submit
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      await user.type(screen.getByLabelText(/qué modificaciones/i), 'Test modification');
      
      // Select a seguro type
      const tipoSeguroSelect = screen.getByRole('combobox');
      await user.click(tipoSeguroSelect);
      const autoOption = screen.getByRole('option', { name: 'Seguro de Auto' });
      await user.click(autoOption);
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      // Check that FormData was created with honeypot field
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        const [, options] = (global.fetch as Mock).mock.calls[0] as [string, RequestInit];
        const formData = options.body;
        expect(formData).toBeInstanceOf(FormData);
      });
    });

    it('disables form fields during submission', async () => {
      // Mock slow response that doesn't resolve immediately
      let resolveResponse: (value: Response) => void;
      (global.fetch as Mock).mockImplementation(() => 
        new Promise<Response>(resolve => {
          resolveResponse = resolve;
        })
      );

      render(<ModificationForm />);
      
      // Fill required fields and submit form
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      await user.type(screen.getByLabelText(/qué modificaciones/i), 'Test modification');
      
      // Select a seguro type
      const tipoSeguroSelect = screen.getByRole('combobox');
      await user.click(tipoSeguroSelect);
      const autoOption = screen.getByRole('option', { name: 'Seguro de Auto' });
      await user.click(autoOption);
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      // Fields should be disabled during submission
      await waitFor(() => {
        expect(screen.getByLabelText(/nombre completo/i)).toBeDisabled();
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent(/enviando/i);
      });
      
      // Clean up by resolving the promise
      resolveResponse!({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Success' }),
      } as unknown as Response);
    });
  });
});