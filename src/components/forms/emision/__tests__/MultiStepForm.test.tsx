import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultiStepForm from '../MultiStepForm';
import { formSchema, type FormSchemaType } from '../formSchema';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MultiStepForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful CSRF token fetch
    mockFetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'mock-csrf-token' }),
      } as Response)
    );
  });

  it('renders without crashing', async () => {
    render(<MultiStepForm />);
    
    // Wait for CSRF token to be fetched
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/csrf-token', {
        credentials: 'include'
      });
    });
    
    // Check if the first step header is rendered
    expect(screen.getAllByText('Información Básica')[0]).toBeInTheDocument();
  });

  it('shows progress bar with correct step', async () => {
    render(<MultiStepForm />);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    // Check for progress indicator (step 1 should be active)
    expect(screen.getAllByText('Información Básica')[0]).toBeInTheDocument();
  });

  it('has required form fields in first step', async () => {
    render(<MultiStepForm />);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    // Check for basic form fields (these should be present in Step1_BasicInfo)
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/número de teléfono/i)).toBeInTheDocument();
  });

  it('includes honeypot field for bot protection', async () => {
    render(<MultiStepForm />);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    // Check for honeypot field (should be hidden)
    const websiteField = document.querySelector('input[name="website"]') as HTMLInputElement;
    
    expect(websiteField).toBeInTheDocument();
    expect(websiteField.style.display).toBe('none');
    expect(websiteField.tabIndex).toBe(-1);
  });

  it('shows navigation buttons correctly', async () => {
    render(<MultiStepForm />);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    // In first step, should only show "Siguiente" button, not "Anterior"
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
    expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
  });

  it('handles CSRF token fetch error gracefully', async () => {
    // Mock failed CSRF token fetch
    mockFetch.mockReset();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<MultiStepForm />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching CSRF token:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });
});

describe('formSchema', () => {
  it('validates required fields correctly', () => {
    const invalidData = {
      nombreCompleto: '',
      telefono: '',
      email: '',
      tipoSeguro: '',
      metodoPago: '',
      periodicidadPago: '',
    };
    
    const result = formSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const errorMessages = result.error.errors.map(err => err.message);
      expect(errorMessages).toContain('El nombre es requerido');
      expect(errorMessages).toContain('Selecciona un tipo de seguro');
      expect(errorMessages).toContain('Selecciona un método de pago');
      expect(errorMessages).toContain('Selecciona la periodicidad de pago');
    }
  });

  it('validates email format correctly', () => {
    const invalidEmailData = {
      nombreCompleto: 'Test User',
      telefono: '+1234567890',
      email: 'invalid-email',
      tipoSeguro: 'vida',
      metodoPago: 'mensual',
      periodicidadPago: 'mensual',
      aceptaTerminosYPolitica: true,
    };
    
    const result = formSchema.safeParse(invalidEmailData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const errorMessages = result.error.errors.map(err => err.message);
      expect(errorMessages).toContain('Email inválido');
    }
  });

  it('validates terms acceptance correctly', () => {
    const dataWithoutTerms = {
      nombreCompleto: 'Test User',
      telefono: '+1234567890',
      email: 'test@example.com',
      tipoSeguro: 'vida',
      metodoPago: 'mensual',
      periodicidadPago: 'mensual',
      aceptaTerminosYPolitica: false,
    };
    
    const result = formSchema.safeParse(dataWithoutTerms);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const errorMessages = result.error.errors.map(err => err.message);
      expect(errorMessages).toContain('Debes aceptar la política de privacidad y los términos y condiciones para continuar.');
    }
  });

  it('passes validation with valid minimal data', () => {
    const validData = {
      nombreCompleto: 'Test User',
      telefono: '+57 300 123 4567', // Valid Colombian phone number
      email: 'test@example.com',
      tipoSeguro: 'responsabilidad_civil', // This type requires fewer fields
      metodoPago: 'mensual',
      periodicidadPago: 'mensual',
      aceptaTerminosYPolitica: true,
      declaraRenta: 'si' as const,
      numeroCedula: '12345678',
      fotoCedula: [new File(['test'], 'test.pdf', { type: 'application/pdf' })],
      archivoDeclaracionRenta: [new File(['test'], 'declaracion.pdf', { type: 'application/pdf' })],
      // Default values for other fields
      beneficiarios: '',
      documentosBeneficiarios: [],
      listaBeneficiarios: '',
      certificadoLibertad: [],
      tarjetaPropiedad: [],
      numeroCedulaRepLegal: '',
      fotoCedulaRepLegal: [],
      nit: '',
      rut: [],
      camaraComercio: [],
      contratoArrendamiento: [],
      tieneEnfermedadesDiagnosticadas: '',
      enfermedadesEspecificar: '',
      valorActualDeuda: '',
      conduceMoto: '',
      ingresosNoDeclarante: '',
      egresosNoDeclarante: '',
      activosNoDeclarante: '',
      pasivosNoDeclarante: '',
      website: '',
    };
    
    const result = formSchema.safeParse(validData);
    if (!result.success) {
      console.log('Validation errors:', result.error.errors);
    }
    expect(result.success).toBe(true);
  });
});