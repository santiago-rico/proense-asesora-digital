import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PageLoadingSpinner from '../PageLoadingSpinner';

describe('PageLoadingSpinner', () => {
  it('is a polite status region that announces the page is loading', () => {
    render(<PageLoadingSpinner />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Cargando…');
  });
});
