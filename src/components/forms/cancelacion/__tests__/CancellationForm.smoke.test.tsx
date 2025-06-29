/**
 * Smoke Tests for CancellationForm Component
 * Basic functionality and compilation tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { CancellationForm } from '../CancellationForm';

// Mock the useToast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock FileUpload component to avoid complex dependencies
vi.mock('@/components/forms/emision/FileUpload', () => ({
  default: ({ name }: { name: string }) => (
    <div data-testid={`file-upload-${name}`}>File Upload Mock</div>
  ),
}));

describe('CancellationForm Smoke Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    });
  });

  it('should import and render without crashing', () => {
    expect(() => {
      render(<CancellationForm />);
    }).not.toThrow();
  });

  it('should have basic component structure', () => {
    const { container } = render(<CancellationForm />);
    
    // Should have a form element
    const form = container.querySelector('form');
    expect(form).toBeTruthy();
    
    // Should have input fields
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
    
    // Should have a submit button
    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).toBeTruthy();
  });

  it('should initialize with default form values', () => {
    const { container } = render(<CancellationForm />);
    
    // Check that text inputs start empty
    const textInputs = container.querySelectorAll('input[type="text"], input[type="email"]');
    textInputs.forEach(input => {
      expect((input as HTMLInputElement).value).toBe('');
    });
    
    // Check that checkbox starts unchecked
    const checkbox = container.querySelector('input[type="checkbox"]');
    if (checkbox) {
      expect((checkbox as HTMLInputElement).checked).toBe(false);
    }
  });

  it('should contain all required form fields', () => {
    const { container } = render(<CancellationForm />);
    
    // Check for presence of key form elements
    expect(container.querySelector('input[placeholder*="Nombre completo"]')).toBeTruthy();
    expect(container.querySelector('input[placeholder*="Número de cédula"]')).toBeTruthy();
    expect(container.querySelector('input[placeholder*="email"]')).toBeTruthy();
    expect(container.querySelector('input[placeholder*="aseguradora"]')).toBeTruthy();
    expect(container.querySelector('textarea')).toBeTruthy(); // cancellation reason
    expect(container.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should have insurance type select options', () => {
    const { container } = render(<CancellationForm />);
    
    // Should have a select trigger
    const selectTrigger = container.querySelector('[role="combobox"]');
    expect(selectTrigger).toBeTruthy();
  });

  it('should contain file upload component', () => {
    const { getByTestId } = render(<CancellationForm />);
    
    expect(getByTestId('file-upload-documentosAdicionales')).toBeTruthy();
  });

  it('should have terms and conditions checkbox', () => {
    const { container } = render(<CancellationForm />);
    
    // Should have checkbox for terms
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
    
    // Should have links to privacy policy and terms
    const privacyLink = container.querySelector('a[href="/politica-de-privacidad"]');
    const termsLink = container.querySelector('a[href="/terminos-y-condiciones"]');
    expect(privacyLink).toBeTruthy();
    expect(termsLink).toBeTruthy();
  });
});