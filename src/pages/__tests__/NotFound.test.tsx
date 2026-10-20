import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NotFound from '../NotFound';

function renderNotFound(path = '/no-existe') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NotFound handleOpenLeadDialog={vi.fn()} />
    </MemoryRouter>,
  );
}

describe('NotFound', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the 404 in Spanish with a link back home', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderNotFound();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página no encontrada');
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/La página que buscas no existe/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
    expect(screen.queryByText(/Page not found|Return to Home/i)).not.toBeInTheDocument();
  });

  it('renders inside the site layout, with navbar, main landmark and footer', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderNotFound();

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument();
    const main = screen.getByRole('main');
    expect(main).toContainElement(screen.getByRole('heading', { level: 1 }));
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('logs the missing path', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderNotFound('/seguros/decesos');

    expect(error).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/seguros/decesos',
    );
  });
});
