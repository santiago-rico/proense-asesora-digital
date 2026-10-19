/**
 * Unit Tests for LeadForm Component
 * Tests submit-time validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LeadForm from '../LeadForm';

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock fetch globally: the CSRF token on mount, the lead on submit
global.fetch = vi.fn();

const renderLeadForm = () =>
  render(
    <MemoryRouter>
      <LeadForm />
    </MemoryRouter>
  );

describe('LeadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ token: 'test-csrf-token-123' }),
    });
  });

  describe('Form Validation', () => {
    it('shows the insurance type message on submit when none is selected', async () => {
      const user = userEvent.setup();
      renderLeadForm();

      // Fill everything except the insurance type
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/teléfono/i), '+573001234567');
      await user.click(screen.getByRole('checkbox'));

      await user.click(screen.getByRole('button', { name: /obtener mi asesoría/i }));

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

      await user.click(screen.getByRole('button', { name: /obtener mi asesoría/i }));

      // The unticked checkbox must not block the submit before zod runs
      await waitFor(() => {
        expect(screen.getByText('Debes aceptar los términos y condiciones')).toBeInTheDocument();
      });
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-required', 'true');
      expect(global.fetch).not.toHaveBeenCalledWith('/api/send-email', expect.anything());
    }, 10000);
  });
});
