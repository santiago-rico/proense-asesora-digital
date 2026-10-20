/**
 * Unit Tests for CancellationForm Component
 * Tests form validation, submission, and user interactions
 */

import { describe, it, expect, vi, type Mock, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CancellationForm } from '../CancellationForm';
import { CSRF_ERROR_CODE } from '@/utils/csrf-error';

// Mock the useToast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({ toast: mockToast })),
}));

// Mock the useCsrf hook
vi.mock('@/hooks/use-csrf', () => ({
  useCsrf: vi.fn(() => ({
    token: 'test-csrf-token-123',
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
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
async function fillValidForm(user: User, overrides: { telefono?: string; email?: string; tipoSeguro?: string } = {}) {
  await user.type(screen.getByLabelText(/nombre completo del tomador/i), 'Test User');
  await user.type(screen.getByLabelText(/número de cédula del tomador/i), '12345678');
  await user.type(screen.getByLabelText(/teléfono de contacto/i), overrides.telefono ?? '+573001234567');
  await user.type(screen.getByLabelText(/email de contacto/i), overrides.email ?? 'test@example.com');
  await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: overrides.tipoSeguro ?? 'Seguro de Vida' }));
  await user.click(screen.getByLabelText(/acepto la política/i));
}

const submitButton = () => screen.getByRole('button', { name: /enviar solicitud de cancelación/i });

/**
 * Native `required` stops a click on submit while a required field is empty (in
 * jsdom too), so submit the form directly to reach zod's messages for them.
 */
const submitForm = () => fireEvent.submit(submitButton().closest('form')!);

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

describe('CancellationForm', () => {

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

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
      render(<CancellationForm />);

      expect(screen.getByLabelText(/nombre completo del tomador/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/número de cédula del tomador/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono de contacto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email de contacto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre de la aseguradora/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/número de póliza/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/qué seguro quieres cancelar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/motivo de la cancelación/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/acepto la política/i)).toBeInTheDocument();
    });

    it('renders submit button with correct initial state', () => {
      render(<CancellationForm />);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it('includes file upload component', () => {
      render(<CancellationForm />);
      
      const fileUpload = screen.getByTestId('file-upload-documentosAdicionales');
      expect(fileUpload).toBeInTheDocument();
    });

    it('renders insurance type select with all options', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      // Check that main insurance types are available using getAllByText for duplicates
      const vidaOptions = screen.getAllByText('Seguro de Vida');
      expect(vidaOptions.length).toBeGreaterThan(0);
      expect(screen.getAllByText('Seguro de Salud').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Seguro de Auto').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Seguro de Hogar').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Otro').length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    it('does not validate a field when the user leaves it', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);

      const nombreField = screen.getByLabelText(/nombre completo del tomador/i);
      const emailField = screen.getByLabelText(/email de contacto/i);
      await user.click(nombreField);
      await user.tab();
      await user.click(emailField);
      await user.paste('maria@example');
      await user.tab();
      // Gives a blur validation time to show up before checking it didn't
      await user.paste('Test Insurance');
      expect(screen.getByLabelText(/nombre de la aseguradora/i)).toHaveValue('Test Insurance');

      expect(screen.queryByText(/El nombre completo es requerido/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Correo electrónico inválido/i)).not.toBeInTheDocument();
      expect(nombreField).toHaveAttribute('aria-invalid', 'false');
      expect(emailField).toHaveAttribute('aria-invalid', 'false');
    });

    it('shows the required-field messages on submit', async () => {
      render(<CancellationForm />);

      // A real click: the form is noValidate, so the browser's own `required` check
      // no longer blocks the submit before zod's messages
      await userEvent.setup().click(submitButton());

      await waitFor(() => {
        expect(screen.getByText(/El nombre completo es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/El número de cédula es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/El nombre de la aseguradora es requerido/i)).toBeInTheDocument();
        expect(screen.getByText('Debe seleccionar un tipo de seguro')).toBeInTheDocument();
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('validates the email on submit and clears its error as soon as it is fixed', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);

      // Valid for a type=email input, rejected by zod
      await fillValidForm(user, { email: 'maria@example' });
      await user.click(submitButton());

      expect(await screen.findByText(/Correo electrónico inválido/i)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();

      // After a submit, errors update on change: no blur needed
      const emailField = screen.getByLabelText(/email de contacto/i);
      await user.clear(emailField);
      // One change event: re-validating on every keystroke would only slow the test down
      await user.paste('test@example.com');
      await waitFor(() => {
        expect(screen.queryByText(/Correo electrónico inválido/i)).not.toBeInTheDocument();
      });
      expect(emailField).toHaveFocus();
      expect(emailField).toHaveAttribute('aria-invalid', 'false');

      // Nothing moves under the pointer now, so one click submits
      await user.click(submitButton());
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    });

    it('validates phone number format on submit', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);

      await fillValidForm(user, { telefono: '123' });
      await user.click(submitButton());

      expect(await screen.findByText(/Número de teléfono inválido/i)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('validates conditional otroSeguro field', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);

      await fillValidForm(user, { tipoSeguro: 'Otro' });
      // Blank but not empty: passes native `required`, fails the schema's trim check
      await user.type(screen.getByLabelText(/especifica qué seguro/i), '   ');
      await user.click(submitButton());

      expect(await screen.findByText(/Debe especificar el tipo de seguro/i)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('requires terms and conditions acceptance', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);

      // Fill required fields but don't accept terms
      await user.type(screen.getByLabelText(/nombre completo del tomador/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula del tomador/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/email de contacto/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');

      // Select insurance type
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      const vidaOption = screen.getByRole('option', { name: 'Seguro de Vida' });
      await user.click(vidaOption);

      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Debes aceptar la política de privacidad y los términos y condiciones para continuar/i)).toBeInTheDocument();
      });
    }, 10000);

    it('shows the insurance type message on submit when none is selected', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);

      // Fill everything except the insurance type
      await user.type(screen.getByLabelText(/nombre completo del tomador/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula del tomador/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/email de contacto/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      await user.click(screen.getByLabelText(/acepto la política/i));

      await user.click(screen.getByRole('button', { name: /enviar solicitud de cancelación/i }));

      // The empty select must not block the submit before zod runs
      await waitFor(() => {
        expect(screen.getByText('Debe seleccionar un tipo de seguro')).toBeInTheDocument();
      });
      expect(global.fetch).not.toHaveBeenCalled();
    }, 10000);
  });

  describe('Conditional Fields', () => {
    it('shows otroSeguro field when "Otro" is selected', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      // Select "otro" option
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      const otroOption = screen.getByRole('option', { name: 'Otro' });
      await user.click(otroOption);
      
      // Should show the conditional field
      await waitFor(() => {
        expect(screen.getByLabelText(/especifica qué seguro/i)).toBeInTheDocument();
      });
    });

    it('hides otroSeguro field when other insurance type is selected', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      // First select "otro" to show the field
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      const otroOption = screen.getByRole('option', { name: 'Otro' });
      await user.click(otroOption);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/especifica qué seguro/i)).toBeInTheDocument();
      });
      
      // Now select a different option
      await user.click(selectTrigger);
      const vidaOption = screen.getByRole('option', { name: 'Seguro de Vida' });
      await user.click(vidaOption);
      
      // Should hide the conditional field
      await waitFor(() => {
        expect(screen.queryByLabelText(/especifica qué seguro/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      // Fill out form with valid data
      await user.type(screen.getByLabelText(/nombre completo del tomador/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula del tomador/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/email de contacto/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      await user.type(screen.getByLabelText(/número de póliza/i), 'POL-123456');
      await user.type(screen.getByLabelText(/motivo de la cancelación/i), 'Test reason');
      
      // Select insurance type
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      const vidaOption = screen.getByRole('option', { name: 'Seguro de Vida' });
      await user.click(vidaOption);
      
      // Accept terms
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);
      
      // Should call fetch with correct endpoint
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/send-cancellation-request',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          })
        );
      });
    });

    it('shows success screen after successful submission', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      // Fill and submit form (minimal valid data)
      await user.type(screen.getByLabelText(/nombre completo del tomador/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula del tomador/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/email de contacto/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      
      // Select insurance type
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      const vidaOption = screen.getByRole('option', { name: 'Seguro de Vida' });
      await user.click(vidaOption);
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);
      
      // Should show success screen
      await waitFor(() => {
        expect(screen.getByText(/solicitud de cancelación enviada/i)).toBeInTheDocument();
        expect(screen.getByText(/realizar otra solicitud/i)).toBeInTheDocument();
      });
    });

    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup();
      // Mock failed response
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Validation error' }),
      });

      render(<CancellationForm />);
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/nombre completo del tomador/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula del tomador/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/email de contacto/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      
      // Select insurance type
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      const vidaOption = screen.getByRole('option', { name: 'Seguro de Vida' });
      await user.click(vidaOption);
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);
      
      // Should show error toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error en el envío',
            description: 'Validation error',
            variant: 'destructive',
          })
        );
      });
    });

    it('shows a Spanish message when the request never reaches the server', async () => {
      const user = userEvent.setup();
      // What fetch rejects with when offline: a TypeError with the browser's English message
      (global.fetch as Mock).mockRejectedValue(new TypeError('Failed to fetch'));

      render(<CancellationForm />);
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/nombre completo del tomador/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula del tomador/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/email de contacto/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      
      // Select insurance type
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      const vidaOption = screen.getByRole('option', { name: 'Seguro de Vida' });
      await user.click(vidaOption);
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);
      
      // Should show error toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error en el envío',
            description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.',
            variant: 'destructive',
          })
        );
      });
      expect(mockToast).not.toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.stringContaining('Failed to fetch') })
      );
    });

    it.each(['Token de seguridad inválido', 'Invalid CSRF token'])(
      'on a CSRF 403 (message "%s") warns and reloads the page',
      async (message) => {
        const user = userEvent.setup();
        const reload = interceptReload();
        mockResponse(403, { message, code: CSRF_ERROR_CODE });
        render(<CancellationForm />);

        await fillValidForm(user);
        await user.click(submitButton());

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
      const user = userEvent.setup();
      const reload = interceptReload();
      mockResponse(403, { message: 'Acceso denegado' });
      render(<CancellationForm />);

      await fillValidForm(user);
      await user.click(submitButton());

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'Error en el envío', description: 'Acceso denegado' })
        );
      });
      expect(mockToast).not.toHaveBeenCalledWith(expect.objectContaining({ title: 'Error de Seguridad' }));
      expect(reload).not.toHaveBeenCalled();
    });

    it('disables submit button during submission', async () => {
      const user = userEvent.setup();
      // Mock slow response
      (global.fetch as Mock).mockImplementation(() =>
        new Promise<Response>(resolve => setTimeout(() => resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ message: 'Success' }),
        } as Response), 1000))
      );

      render(<CancellationForm />);
      
      // Fill form
      await user.type(screen.getByLabelText(/nombre completo del tomador/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula del tomador/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/email de contacto/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      
      // Select insurance type
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      const vidaOption = screen.getByRole('option', { name: 'Seguro de Vida' });
      await user.click(vidaOption);
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);
      
      // Button should be disabled and show loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent(/enviando solicitud/i);
      });
    });
  });

  describe('Success Screen', () => {
    it('shows success message and reset button', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      // Fill and submit form to get to success screen
      await user.type(screen.getByLabelText(/nombre completo del tomador/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula del tomador/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/email de contacto/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      const vidaOption = screen.getByRole('option', { name: 'Seguro de Vida' });
      await user.click(vidaOption);
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);
      
      // Wait for success screen
      await waitFor(() => {
        expect(screen.getByText(/solicitud de cancelación enviada/i)).toBeInTheDocument();
        expect(screen.getByText(/hemos recibido tu solicitud/i)).toBeInTheDocument();
        expect(screen.getByText(/para que tu solicitud de cancelación sea procesada/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /realizar otra solicitud/i })).toBeInTheDocument();
      });
    });

    it('resets form when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      // Fill and submit form to get to success screen
      await user.type(screen.getByLabelText(/nombre completo del tomador/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula del tomador/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/email de contacto/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      const vidaOption = screen.getByRole('option', { name: 'Seguro de Vida' });
      await user.click(vidaOption);
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);
      
      // Wait for success screen and click reset
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /realizar otra solicitud/i })).toBeInTheDocument();
      });
      
      const resetButton = screen.getByRole('button', { name: /realizar otra solicitud/i });
      await user.click(resetButton);
      
      // Should return to form view
      await waitFor(() => {
        expect(screen.getByLabelText(/nombre completo del tomador/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /enviar solicitud de cancelación/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper aria labels and required attributes', () => {
      render(<CancellationForm />);
      
      // Check required field indicators
      const requiredFields = [
        /nombre completo del tomador/i,
        /número de cédula del tomador/i,
        /teléfono de contacto/i,
        /email de contacto/i,
        /nombre de la aseguradora/i,
        /qué seguro quieres cancelar/i,
      ];
      
      requiredFields.forEach(label => {
        const field = screen.getByLabelText(label);
        expect(field).toBeInTheDocument();
      });
    });

    it('shows validation errors in accessible way', async () => {
      render(<CancellationForm />);

      const nombreField = screen.getByLabelText(/nombre completo del tomador/i);
      submitForm();

      // Wait for validation errors to appear
      await waitFor(() => {
        // Check for validation error messages by text content since they might not have role="alert"
        expect(screen.getByText(/El nombre completo es requerido/i)).toBeInTheDocument();
        
        // Check that fields have aria-invalid when they have errors
        expect(nombreField).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});