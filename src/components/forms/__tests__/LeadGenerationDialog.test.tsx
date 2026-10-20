/**
 * Unit Tests for LeadGenerationDialog
 * Tests that focus returns to whatever opened it (it has no DialogTrigger)
 */

import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LeadGenerationDialog from '../LeadGenerationDialog';

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

global.fetch = vi.fn();

/** Opens the dialog from App-like state, as the navbar and page CTAs do. */
const DialogFromState = () => {
  const [open, setOpen] = useState(false);
  return (
    <MemoryRouter>
      <button onClick={() => setOpen(true)}>Solicitar Asesoría</button>
      <LeadGenerationDialog open={open} onOpenChange={setOpen} />
    </MemoryRouter>
  );
};

describe('LeadGenerationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ token: 'test-csrf-token-123' }),
    });
  });

  it('returns focus to the button that opened it when it closes', async () => {
    const user = userEvent.setup();
    render(<DialogFromState />);
    const opener = screen.getByRole('button', { name: 'Solicitar Asesoría' });

    await user.click(opener);
    expect(await screen.findByRole('dialog', { name: 'Solicitar Asesoría' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
