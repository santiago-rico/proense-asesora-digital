import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MultiStepQuoteForm from '../MultiStepQuoteForm';

/**
 * When validation messages appear and disappear.
 *
 * Errors appear only when "Siguiente" validates the step: with blur
 * validation, the mousedown on "Siguiente" blurred the field, its error
 * vanished, the button moved up before mouseup and the click was lost. Once
 * shown, an error goes away on the change that fixes the field.
 */

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const renderForm = async () => {
  render(
    <MemoryRouter>
      <MultiStepQuoteForm />
    </MemoryRouter>
  );
  await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/csrf-token', { credentials: 'include' }));
};

const textbox = (label: RegExp) => screen.getByRole('textbox', { name: label });

describe('MultiStepQuoteForm — momento de la validación', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'mock-csrf-token' }),
    } as Response);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('does not validate on blur; "Siguiente" shows the errors of the step', async () => {
    const user = userEvent.setup();
    await renderForm();

    await user.click(textbox(/^Apellido/));
    await user.tab();
    expect(screen.queryByText('El apellido es requerido')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByText('El apellido es requerido')).toBeInTheDocument();
    expect(screen.getByText('Dirección requerida')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Información Personal', level: 3 })).toBeInTheDocument();
  });

  it('removes an error on the change that fixes the field, and only that one', async () => {
    const user = userEvent.setup();
    await renderForm();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByText('Dirección requerida')).toBeInTheDocument();

    // Still focused: no blur is needed for the message to go away.
    await user.type(textbox(/^Dirección/), 'Calle 1');
    await waitFor(() => expect(screen.queryByText('Dirección requerida')).not.toBeInTheDocument());
    expect(textbox(/^Dirección/)).toHaveFocus();
    expect(screen.getByText('Ciudad requerida')).toBeInTheDocument();

    // A field without an error is not validated while typing.
    await user.clear(textbox(/^Dirección/));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText('Dirección requerida')).not.toBeInTheDocument();
  });

  it('updates the message of a field that is still invalid', async () => {
    const user = userEvent.setup();
    await renderForm();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByText('Número de cédula requerido')).toBeInTheDocument();

    await user.type(textbox(/^Número de cédula/), 'CC');
    expect(await screen.findByText('Solo números permitidos')).toBeInTheDocument();
    expect(screen.queryByText('Número de cédula requerido')).not.toBeInTheDocument();
  });
});
