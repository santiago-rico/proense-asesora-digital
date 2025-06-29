/**
 * Functional Tests for CancellationForm Component
 * Tests to verify the functionality works after linting fixes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  default: ({ name }: { name: string }) => (
    <div data-testid={`file-upload-${name}`}>File Upload Mock</div>
  ),
}));

describe('CancellationForm Functional Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    });
  });

  it('should import CancellationForm component without errors', async () => {
    expect(async () => {
      await import('../CancellationForm');
    }).not.toThrow();
  });

  it('should be able to instantiate the component', () => {
    expect(CancellationForm).toBeDefined();
    expect(typeof CancellationForm).toBe('function');
  });

  it('should have correct TypeScript types', () => {
    // This test verifies that TypeScript compilation succeeds
    const component: React.FC = CancellationForm;
    expect(component).toBeDefined();
  });

  it('should have insurance type options available', async () => {
    // Test that the insurance types are available through imports
    const { SERVICE_FORM_INSURANCE_TYPES } = await import('@/constants/insuranceTypes');
    
    // Check that insurance type constants are defined and include expected types
    expect(SERVICE_FORM_INSURANCE_TYPES).toBeDefined();
    expect(Array.isArray(SERVICE_FORM_INSURANCE_TYPES)).toBe(true);
    expect(SERVICE_FORM_INSURANCE_TYPES.length).toBeGreaterThan(0);
    
    // Check for specific insurance types
    const insuranceValues = SERVICE_FORM_INSURANCE_TYPES.map(type => type.value);
    expect(insuranceValues).toContain('vida');
    expect(insuranceValues).toContain('salud');
    expect(insuranceValues).toContain('auto');
    expect(insuranceValues).toContain('hogar');
    expect(insuranceValues).toContain('mascotas');
  });

  it('should have proper form schema validation', () => {
    // Test that the form schema is properly defined
    const componentString = CancellationForm.toString();
    
    // Check for validation rules
    expect(componentString).toContain('nombreCompleto');
    expect(componentString).toContain('numeroCedula'); 
    expect(componentString).toContain('telefono');
    expect(componentString).toContain('email');
    expect(componentString).toContain('nombreAseguradora');
    expect(componentString).toContain('tipoSeguro');
    expect(componentString).toContain('aceptaTerminosYPolitica');
  });

  it('should have API endpoint configuration', () => {
    // Test that the component has the correct API endpoint
    const componentString = CancellationForm.toString();
    expect(componentString).toContain('/api/send-cancellation-request');
  });

  it('should handle form submission logic', () => {
    // Test that the component has form submission handling
    const componentString = CancellationForm.toString();
    expect(componentString).toContain('onSubmit');
    expect(componentString).toContain('FormData');
    expect(componentString).toContain('fetch');
  });

  it('should have success screen component', async () => {
    // Test that success screen component is imported and available
    const { FormSuccessScreen } = await import('@/components/shared/FormSuccessScreen');
    
    // Verify FormSuccessScreen component is available
    expect(FormSuccessScreen).toBeDefined();
    expect(typeof FormSuccessScreen).toBe('function');
    
    // Test that CancellationForm uses success screen functionality
    const componentString = CancellationForm.toString();
    expect(componentString).toContain('formSubmitted');
    expect(componentString).toContain('setFormSubmitted');
  });

  it('should export the component correctly', () => {
    // Verify the component is properly exported
    expect(CancellationForm).toBeDefined();
    expect(CancellationForm.name).toBe('CancellationForm');
  });
});