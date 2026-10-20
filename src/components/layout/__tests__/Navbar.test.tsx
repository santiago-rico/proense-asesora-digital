import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Navbar from '../Navbar';

function renderNavbar() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Navbar handleOpenLeadDialog={vi.fn()} />
    </MemoryRouter>,
  );
  // `hidden`: while collapsed the panel is aria-hidden (which also blanks its computed name)
  const panel = screen.getByRole('group', { hidden: true });
  expect(panel).toHaveAttribute('aria-label', 'Menú de navegación móvil');
  return {
    hamburger: screen.getByRole('button', { name: /(Abrir|Cerrar) menú de navegación/ }),
    panel,
  };
}

describe('Navbar mobile menu', () => {
  it('keeps the collapsed panel inert and hidden, so its links cannot be focused', () => {
    const { hamburger, panel } = renderNavbar();

    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    expect(hamburger).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-hidden', 'true');
    expect(panel).toHaveAttribute('inert');
  });

  it('opening the panel makes it interactive, as plain links in a list, not an ARIA menu', async () => {
    const user = userEvent.setup();
    const { hamburger, panel } = renderNavbar();

    await user.click(hamburger);

    expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toHaveAttribute('aria-hidden', 'false');
    expect(panel).not.toHaveAttribute('inert');
    expect(screen.queryByRole('menu', { hidden: true })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { hidden: true })).not.toBeInTheDocument();
    expect(panel.querySelector(':scope > ul')).not.toHaveAttribute('role');
  });

  it('keeps a collapsed submenu inert until its toggle expands it', async () => {
    const user = userEvent.setup();
    const { hamburger, panel } = renderNavbar();
    await user.click(hamburger);

    // Scoped to the panel: the desktop bar has its own "Seguros" trigger
    const toggle = within(panel).getByRole('button', { name: 'Seguros' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const submenu = document.getElementById(toggle.getAttribute('aria-controls')!)!;
    expect(panel).toContainElement(submenu);
    expect(submenu).toHaveAttribute('inert');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(submenu).not.toHaveAttribute('inert');
  });
});
