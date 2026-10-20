/**
 * Unit Tests for LeadForm Component
 * Tests submit-time validation, server responses and the preselected insurance type
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LeadForm from '../LeadForm';
import { toLeadFormInsuranceType } from '@/constants/insuranceTypes';

// A stable toast: LeadForm's CSRF effect depends on it
const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

// Mock fetch globally: the CSRF token on mount, the lead on submit
global.fetch = vi.fn();

const jsonResponse = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: () => Promise.resolve(body),
});

/** Answers the CSRF token request, and the lead submission with `submission`. */
const mockSubmission = (submission: () => Promise<unknown>) => {
  (global.fetch as Mock).mockImplementation((url: string) =>
    url === '/api/send-email' ? submission() : Promise.resolve(jsonResponse(200, { token: 'test-csrf-token-123' }))
  );
};

const renderLeadForm = (initialInsuranceType?: string) =>
  render(
    <MemoryRouter>
      <LeadForm initialInsuranceType={initialInsuranceType} />
    </MemoryRouter>
  );

const submitButton = () => screen.getByRole('button', { name: /obtener mi asesoría|enviando/i });
const typeSelect = () => screen.getByRole('combobox', { name: 'Tipo de Seguro de Interés' });

/** Fills every field but the insurance type (render with one preselected). */
const fillLead = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
  await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/teléfono/i), '+573001234567');
  await user.click(screen.getByRole('checkbox'));
};

describe('LeadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmission(() => Promise.resolve(jsonResponse(200, { message: 'ok' })));
  });

  describe('Form Validation', () => {
    it('shows the insurance type message on submit when none is selected', async () => {
      const user = userEvent.setup();
      renderLeadForm();

      // Fill everything except the insurance type
      await fillLead(user);

      await user.click(submitButton());

      // The empty select must not block the submit before zod runs
      await waitFor(() => {
        expect(screen.getByText('Por favor seleccione un tipo de seguro')).toBeInTheDocument();
      });
      expect(global.fetch).not.toHaveBeenCalledWith('/api/send-email', expect.anything());
    }, 10000);

    it('shows the terms message on submit when the box is not ticked', async () => {
      const user = userEvent.setup();
      renderLeadForm();

      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/teléfono/i), '+573001234567');

      await user.click(submitButton());

      // The unticked checkbox must not block the submit before zod runs
      await waitFor(() => {
        expect(screen.getByText('Debes aceptar los términos y condiciones')).toBeInTheDocument();
      });
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-required', 'true');
      expect(global.fetch).not.toHaveBeenCalledWith('/api/send-email', expect.anything());
    }, 10000);

    it('shows every message in Spanish when submitted empty', async () => {
      const user = userEvent.setup();
      renderLeadForm();

      // The form is noValidate, so the browser's own `required` check doesn't block
      // the submit before zod's messages
      await user.click(submitButton());

      expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
      expect(screen.getByText('Número de teléfono inválido')).toBeInTheDocument();
      expect(screen.getByText('Por favor seleccione un tipo de seguro')).toBeInTheDocument();
      expect(screen.getByText('Debes aceptar los términos y condiciones')).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalledWith('/api/send-email', expect.anything());
    }, 10000);

    it('validates on submit, not on blur, and clears a message as soon as the field is fixed', async () => {
      const user = userEvent.setup();
      renderLeadForm('auto');
      await fillLead(user);
      const name = screen.getByLabelText(/nombre completo/i);

      // A message shown on blur would move the button under the pointer and lose the click
      await user.clear(name);
      await user.type(name, 'A');
      await user.tab();
      expect(screen.queryByText('El nombre es requerido')).not.toBeInTheDocument();

      await user.click(submitButton());
      expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();

      await user.type(name, 'na');
      expect(screen.queryByText('El nombre es requerido')).not.toBeInTheDocument();
      expect(name).toHaveFocus();
    }, 10000);
  });

  describe('Server responses', () => {
    it('marks the fields and re-enables the button after a 400', async () => {
      mockSubmission(() =>
        Promise.resolve(jsonResponse(400, { message: 'Datos inválidos.', errors: { nombre: ['Muy corto'] } }))
      );
      const user = userEvent.setup();
      renderLeadForm('auto');
      await fillLead(user);

      await user.click(submitButton());

      expect(await screen.findByText('Muy corto')).toBeInTheDocument();
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Por favor revisa los campos del formulario' }));
      expect(submitButton()).toHaveTextContent('Obtener Mi Asesoría');
      expect(submitButton()).toBeEnabled();
    }, 10000);

    it('shows the server message for other errors', async () => {
      mockSubmission(() => Promise.resolve(jsonResponse(500, { message: 'El servicio de correo no responde.' })));
      const user = userEvent.setup();
      renderLeadForm('auto');
      await fillLead(user);

      await user.click(submitButton());

      await waitFor(() => {
        expect(toastMock).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'Error al enviar solicitud', description: 'El servicio de correo no responde.' })
        );
      });
      expect(submitButton()).toBeEnabled();
    }, 10000);

    it('explains a network failure in Spanish instead of the browser message', async () => {
      mockSubmission(() => Promise.reject(new TypeError('Failed to fetch')));
      const user = userEvent.setup();
      renderLeadForm('auto');
      await fillLead(user);

      await user.click(submitButton());

      await waitFor(() => {
        expect(toastMock).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error al enviar solicitud',
            description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.',
          })
        );
      });
      expect(submitButton()).toBeEnabled();
    }, 10000);
  });

  describe('Insurance type', () => {
    it('names the select after its label', () => {
      renderLeadForm();
      expect(typeSelect()).toHaveTextContent('Selecciona un tipo de seguro');
    });

    it('preselects the type it is given and follows it when it changes without a remount', () => {
      const { rerender } = renderLeadForm('vida');
      expect(typeSelect()).toHaveTextContent('Seguro de Vida');

      // An SPA navigation between /seguros pages re-renders the same page component
      rerender(
        <MemoryRouter>
          <LeadForm initialInsuranceType="salud" />
        </MemoryRouter>
      );
      expect(typeSelect()).toHaveTextContent('Seguro de Salud');
    });

    it('leaves a type that is not an option unselected instead of submitting it', async () => {
      const user = userEvent.setup();
      renderLeadForm('decesos');
      expect(typeSelect()).toHaveTextContent('Selecciona un tipo de seguro');

      await fillLead(user);
      await user.click(submitButton());

      expect(await screen.findByText('Por favor seleccione un tipo de seguro')).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalledWith('/api/send-email', expect.anything());
    }, 10000);

    it('has an option for every /seguros product page (src/App.tsx)', () => {
      const productPageTypes = ['vida', 'vida-deudores', 'salud', 'auto', 'hogar', 'pymes', 'mascotas', 'motos', 'arrendamiento', 'viaje'];
      for (const type of productPageTypes) {
        expect(toLeadFormInsuranceType(type)).toBe(type);
      }
      expect(toLeadFormInsuranceType(undefined)).toBe('');
    });
  });
});
