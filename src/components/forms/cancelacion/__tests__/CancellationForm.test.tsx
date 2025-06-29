/**
 * Unit Tests for CancellationForm Component
 * Tests form validation, submission, and user interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CancellationForm } from '../CancellationForm';

// Mock the useToast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock the useCsrf hook
vi.mock('@/hooks/use-csrf', () => ({
  useCsrf: () => ({
    token: 'test-csrf-token-123',
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
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

describe('CancellationForm', () => {

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

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
      
      // Check that main insurance types are available
      expect(screen.getByText('Seguro de Vida')).toBeInTheDocument();
      expect(screen.getByText('Seguro de Salud')).toBeInTheDocument();
      expect(screen.getByText('Seguro de Auto')).toBeInTheDocument();
      expect(screen.getByText('Seguro de Hogar')).toBeInTheDocument();
      expect(screen.getByText('Otro')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      
      // Try to submit empty form
      await user.click(submitButton);
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/el nombre completo es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/el número de cédula es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/el nombre de la aseguradora es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/debe seleccionar un tipo de seguro/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      const emailField = screen.getByLabelText(/email de contacto/i);
      
      // Enter invalid email
      await user.type(emailField, 'invalid-email');
      await user.tab(); // Trigger onBlur validation
      
      await waitFor(() => {
        expect(screen.getByText(/correo electrónico inválido/i)).toBeInTheDocument();
      });
    });

    it('validates phone number format', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      const phoneField = screen.getByLabelText(/teléfono de contacto/i);
      
      // Enter invalid phone number
      await user.type(phoneField, '123');
      await user.tab(); // Trigger onBlur validation
      
      await waitFor(() => {
        expect(screen.getByText(/número de teléfono inválido/i)).toBeInTheDocument();
      });
    });

    it('validates conditional otroSeguro field', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      // Select "otro" option for tipo de seguro
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      const otroOption = screen.getByText('Otro');
      await user.click(otroOption);
      
      // Should show otroSeguro field
      await waitFor(() => {
        expect(screen.getByLabelText(/especifica qué seguro/i)).toBeInTheDocument();
      });
      
      // Submit form without filling otroSeguro
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/debe especificar el tipo de seguro/i)).toBeInTheDocument();
      });
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
      const vidaOption = screen.getByText('Seguro de Vida');
      await user.click(vidaOption);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/debes aceptar la política de privacidad/i)).toBeInTheDocument();
      });
    });
  });

  describe('Conditional Fields', () => {
    it('shows otroSeguro field when "Otro" is selected', async () => {
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      // Select "otro" option
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      const otroOption = screen.getByText('Otro');
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
      
      const otroOption = screen.getByText('Otro');
      await user.click(otroOption);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/especifica qué seguro/i)).toBeInTheDocument();
      });
      
      // Now select a different option
      await user.click(selectTrigger);
      const vidaOption = screen.getByText('Seguro de Vida');
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
      const vidaOption = screen.getByText('Seguro de Vida');
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
      const vidaOption = screen.getByText('Seguro de Vida');
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
      (global.fetch as vi.Mock).mockResolvedValue({
        ok: false,
        status: 400,
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
      const vidaOption = screen.getByText('Seguro de Vida');
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

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      // Mock network error
      (global.fetch as vi.Mock).mockRejectedValue(new Error('Network error'));

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
      const vidaOption = screen.getByText('Seguro de Vida');
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
            description: 'Network error',
            variant: 'destructive',
          })
        );
      });
    });

    it('disables submit button during submission', async () => {
      const user = userEvent.setup();
      // Mock slow response
      (global.fetch as vi.Mock).mockImplementation(() => 
        new Promise<Response>(resolve => setTimeout(() => resolve({
          ok: true,
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
      const vidaOption = screen.getByText('Seguro de Vida');
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
      const vidaOption = screen.getByText('Seguro de Vida');
      await user.click(vidaOption);
      
      const termsCheckbox = screen.getByLabelText(/acepto la política/i);
      await user.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);
      
      // Wait for success screen
      await waitFor(() => {
        expect(screen.getByText(/solicitud de cancelación enviada/i)).toBeInTheDocument();
        expect(screen.getByText(/hemos recibido tu solicitud/i)).toBeInTheDocument();
        expect(screen.getByText(/acción requerida/i)).toBeInTheDocument();
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
      const vidaOption = screen.getByText('Seguro de Vida');
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
      const user = userEvent.setup();
      render(<CancellationForm />);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud de cancelación/i });
      await user.click(submitButton);
      
      // Wait for validation errors to appear
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });
});