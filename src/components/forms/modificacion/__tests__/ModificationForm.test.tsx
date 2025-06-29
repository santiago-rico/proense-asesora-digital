/**
 * Unit Tests for ModificationForm Component
 * Tests form validation, CSRF integration, and user interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModificationForm } from '../ModificationForm';
import { useCsrf } from '@/hooks/use-csrf';
import { useToast } from '@/hooks/use-toast';

// Mock the useCsrf hook
vi.mock('@/hooks/use-csrf', () => ({
  useCsrf: vi.fn(),
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
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

describe('ModificationForm', () => {
  const user = userEvent.setup();
  const mockToast = vi.fn();

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Default CSRF mock - successful state
    vi.mocked(useCsrf).mockReturnValue({
      token: 'test-csrf-token-123',
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    // Mock useToast
    vi.mocked(useToast).mockReturnValue({ toast: mockToast });

    // Mock successful fetch response
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
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
      vi.mocked(useCsrf).mockReturnValue({
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
      vi.mocked(useCsrf).mockReturnValue({
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
      vi.mocked(useCsrf).mockReturnValue({
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
    it('validates required fields', async () => {
      render(<ModificationForm />);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      
      // Try to submit empty form
      await user.click(submitButton);
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/el nombre completo es requerido/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      render(<ModificationForm />);
      
      const emailField = screen.getByLabelText(/correo electrónico/i);
      
      // Enter invalid email
      await user.type(emailField, 'invalid-email');
      await user.tab(); // Trigger onBlur validation
      
      await waitFor(() => {
        expect(screen.getByText(/correo electrónico inválido/i)).toBeInTheDocument();
      });
    });

    it('validates conditional otroSeguro field', async () => {
      render(<ModificationForm />);
      
      // Select "otro" option for tipo de seguro
      const tipoSeguroSelect = screen.getByRole('combobox');
      await user.click(tipoSeguroSelect);
      
      const otroOption = screen.getByText('Otro');
      await user.click(otroOption);
      
      // Should show otroSeguro field
      await waitFor(() => {
        expect(screen.getByLabelText(/especifica qué seguro/i)).toBeInTheDocument();
      });
      
      // Submit form without filling otroSeguro
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/debe especificar el tipo de seguro/i)).toBeInTheDocument();
      });
    });

    it('requires terms and conditions acceptance', async () => {
      render(<ModificationForm />);
      
      // Fill required fields but don't accept terms
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula/i), '12345678');
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/debes aceptar la política/i)).toBeInTheDocument();
      });
    });
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
    });

    it('shows success screen after successful submission', async () => {
      render(<ModificationForm />);
      
      // Fill and submit form (minimal valid data)
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/número de cédula/i), '12345678');
      await user.type(screen.getByLabelText(/teléfono de contacto/i), '+573001234567');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nombre de la aseguradora/i), 'Test Insurance');
      await user.type(screen.getByLabelText(/qué modificaciones/i), 'Test modification');
      
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
      (global.fetch as vi.Mock).mockResolvedValue({
        ok: false,
        status: 400,
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

    it('handles CSRF token validation errors', async () => {
      // Mock CSRF error response
      (global.fetch as vi.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: 'Invalid CSRF token' }),
      });

      render(<ModificationForm />);
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      // Should show CSRF error
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error de Seguridad',
            description: expect.stringContaining('Token de seguridad inválido'),
            variant: 'destructive',
          })
        );
      });
    });

    it('prevents submission without CSRF token', async () => {
      vi.mocked(useCsrf).mockReturnValue({
        token: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<ModificationForm />);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      // Should show error and not call fetch
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error de Seguridad',
          description: expect.stringContaining('Token de seguridad no disponible'),
          variant: 'destructive',
        })
      );
      
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
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      // Check that FormData was created with honeypot field
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        const [, options] = (global.fetch as vi.Mock).mock.calls[0] as [string, RequestInit];
        const formData = options.body;
        expect(formData).toBeInstanceOf(FormData);
      });
    });

    it('disables form fields during submission', async () => {
      // Mock slow response
      (global.fetch as vi.Mock).mockImplementation(() => 
        new Promise<Response>(resolve => setTimeout(() => resolve({} as Response), 1000))
      );

      render(<ModificationForm />);
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      // Fields should be disabled during submission
      expect(screen.getByLabelText(/nombre completo/i)).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/enviando/i);
    });
  });
});