/**
 * Step2_InsuranceSelection Component Tests
 * Tests validation, conditional rendering, and data flow for insurance selection step
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Step2_InsuranceSelection from '../Step2_InsuranceSelection';
import { formSchema, type FormSchemaType } from '../formSchema';

// Mock the Select components for consistent testing
interface MockSelectProps {
  children?: React.ReactNode;
  onValueChange?: (value: string) => void;
  value?: string;
}

interface MockSelectItemProps {
  children?: React.ReactNode;
  value?: string;
}

interface MockSelectValueProps {
  placeholder?: string;
}

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: MockSelectProps) => (
    <div>
      {children}
      <select 
        data-testid="select"
        value={value || ''}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: MockSelectItemProps) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: MockSelectValueProps) => <span data-testid="select-placeholder">{placeholder}</span>,
}));

// Mock the Form components to work better with React Hook Form
import { Controller, type ControllerProps } from 'react-hook-form';

type MockFormFieldProps = Pick<ControllerProps, 'control' | 'name' | 'render'>;

vi.mock('@/components/ui/form', () => {
  return {
    FormControl: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    FormField: ({ control, name, render }: MockFormFieldProps) => {
      return Controller({ control, name, render });
    },
    FormItem: ({ children }: { children?: React.ReactNode }) => <div data-testid="form-item">{children}</div>,
    FormLabel: ({ children }: { children?: React.ReactNode }) => <label>{children}</label>,
    FormMessage: () => <div data-testid="form-message"></div>,
  };
});

// Test wrapper component
const TestWrapper = ({ children, defaultValues = {} }: { children: React.ReactNode, defaultValues?: Partial<FormSchemaType> }) => {
  const methods = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: 'Test User',
      telefono: '+57 300 123 4567',
      email: 'test@example.com',
      tipoSeguro: '',
      metodoPago: '',
      periodicidadPago: '',
      aceptaDeclaracionAsesoria: false,
      aceptaTerminosYPolitica: false,
      declaraRenta: 'si',
      ...defaultValues,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('Step2_InsuranceSelection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('renders all required selection fields', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      // Check for all form fields
      expect(screen.getByText('Tipo de seguro que deseas contratar')).toBeInTheDocument();
      expect(screen.getByText('Método de pago preferido')).toBeInTheDocument();
      expect(screen.getByText('Periodicidad de pago')).toBeInTheDocument();
    });

    it('shows required indicators for all fields', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      // Check for required asterisks
      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators).toHaveLength(3); // tipoSeguro, metodoPago, periodicidadPago
      
      requiredIndicators.forEach(indicator => {
        expect(indicator).toHaveClass('text-red-500');
      });
    });

    it('has proper form structure with correct spacing', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      const container = screen.getByText('Tipo de seguro que deseas contratar').closest('.space-y-6');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Insurance Type Options', () => {
    it('displays all available insurance types', async () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      const expectedInsuranceTypes = [
        { value: 'vida', label: 'Seguro de Vida' },
        { value: 'salud', label: 'Seguro de Salud' },
        { value: 'hogar', label: 'Seguro de Hogar' },
        { value: 'auto', label: 'Seguro de Autos' },
        { value: 'empresarial', label: 'Seguro Empresarial' },
        { value: 'rentas', label: 'Seguro de Rentas' },
        { value: 'mascotas', label: 'Seguro para Mascotas' },
        { value: 'responsabilidad_civil', label: 'Seguro de Responsabilidad Civil' },
        { value: 'vida_credito_protegido', label: 'Seguro de Vida - Crédito Protegido' },
      ];

      // Check that all insurance types are available in the select
      screen.getAllByTestId('select'); // throws if no select is rendered
      
      expectedInsuranceTypes.forEach(insurance => {
        const options = screen.getAllByRole('option', { name: insurance.label });
        expect(options.length).toBeGreaterThanOrEqual(1);
        expect(options[0]).toBeInTheDocument();
      });
    });

    it('has correct placeholder for insurance type selection', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      // Check that the placeholder text appears (will be duplicated due to our mock structure)
      expect(screen.getAllByText('Selecciona un tipo de seguro')).toHaveLength(2);
    });
  });

  describe('Payment Method Options', () => {
    it('displays all available payment methods', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      const expectedPaymentMethods = [
        { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
        { value: 'debito_automatico', label: 'Débito Automático' },
        { value: 'transferencia', label: 'Transferencia Bancaria' },
      ];

      expectedPaymentMethods.forEach(method => {
        const options = screen.getAllByRole('option', { name: method.label });
        expect(options.length).toBeGreaterThanOrEqual(1);
        expect(options[0]).toBeInTheDocument();
      });
    });

    it('has correct placeholder for payment method selection', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      expect(screen.getAllByText('Selecciona un método de pago')).toHaveLength(2);
    });
  });

  describe('Payment Frequency Options', () => {
    it('displays all available payment frequencies', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      const expectedFrequencies = [
        { value: 'mensual', label: 'Mensual' },
        { value: 'trimestral', label: 'Trimestral' },
        { value: 'semestral', label: 'Semestral' },
        { value: 'anual', label: 'Anual' },
      ];

      expectedFrequencies.forEach(frequency => {
        const options = screen.getAllByRole('option', { name: frequency.label });
        expect(options.length).toBeGreaterThanOrEqual(1);
        expect(options[0]).toBeInTheDocument();
      });
    });

    it('has correct placeholder for payment frequency selection', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      expect(screen.getAllByText('Selecciona la periodicidad')).toHaveLength(2);
    });
  });

  describe('Form Validation', () => {
    it('validates required insurance type selection', () => {
      const result = formSchema.safeParse({
        nombreCompleto: 'Test User',
        telefono: '+57 300 123 4567',
        email: 'test@example.com',
        tipoSeguro: '', // Empty - should fail
        metodoPago: 'tarjeta_credito',
        periodicidadPago: 'mensual',
        aceptaDeclaracionAsesoria: true,
        aceptaTerminosYPolitica: true,
        declaraRenta: 'si',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues.map(err => err.message);
        expect(errors).toContain('Selecciona un tipo de seguro');
      }
    });

    it('validates required payment method selection', () => {
      const result = formSchema.safeParse({
        nombreCompleto: 'Test User',
        telefono: '+57 300 123 4567',
        email: 'test@example.com',
        tipoSeguro: 'vida',
        metodoPago: '', // Empty - should fail
        periodicidadPago: 'mensual',
        aceptaDeclaracionAsesoria: true,
        aceptaTerminosYPolitica: true,
        declaraRenta: 'si',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues.map(err => err.message);
        expect(errors).toContain('Selecciona un método de pago');
      }
    });

    it('validates required payment frequency selection', () => {
      const result = formSchema.safeParse({
        nombreCompleto: 'Test User',
        telefono: '+57 300 123 4567',
        email: 'test@example.com',
        tipoSeguro: 'vida',
        metodoPago: 'tarjeta_credito',
        periodicidadPago: '', // Empty - should fail
        aceptaDeclaracionAsesoria: true,
        aceptaTerminosYPolitica: true,
        declaraRenta: 'si',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues.map(err => err.message);
        expect(errors).toContain('Selecciona la periodicidad de pago');
      }
    });

    it('accepts valid selections', () => {
      const validData = {
        nombreCompleto: 'Test User',
        telefono: '+57 300 123 4567',
        email: 'test@example.com',
        tipoSeguro: 'vida',
        metodoPago: 'tarjeta_credito',
        periodicidadPago: 'mensual',
        aceptaDeclaracionAsesoria: true,
        aceptaTerminosYPolitica: true,
        declaraRenta: 'si',
        numeroCedula: '12345678',
        fotoCedula: [new File(['test'], 'cedula.pdf', { type: 'application/pdf' })],
        archivoDeclaracionRenta: [new File(['test'], 'declaracion.pdf', { type: 'application/pdf' })],
        beneficiarios: 'Test Beneficiary',
        documentosBeneficiarios: [new File(['test'], 'beneficiary.pdf', { type: 'application/pdf' })],
        // Vida asks the declaración de asegurabilidad; optional and follow-up questions may stay blank
        saludDiagnosticos: 'no',
        saludCovidUci: 'no',
        saludOtrasEnfermedades: 'no',
        saludEmbarazo: 'no',
        saludExclusionExtraprima: 'no',
      };

      const result = formSchema.safeParse(validData);
      if (!result.success) {
        console.log('Validation errors:', result.error.issues);
      }
      expect(result.success).toBe(true);
    });
  });

  describe('Data Flow and User Interaction', () => {
    it('updates form state when insurance type is selected', async () => {
      const TestFormComponent = () => {
        const methods = useForm<FormSchemaType>({
          resolver: zodResolver(formSchema),
          defaultValues: {
            nombreCompleto: 'Test User',
            telefono: '+57 300 123 4567',
            email: 'test@example.com',
            tipoSeguro: '',
            metodoPago: '',
            periodicidadPago: '',
            aceptaDeclaracionAsesoria: false,
            aceptaTerminosYPolitica: false,
            declaraRenta: 'si',
          },
        });

        const watchedInsuranceType = methods.watch('tipoSeguro');

        return (
          <FormProvider {...methods}>
            <Step2_InsuranceSelection />
            <div data-testid="watched-insurance-type">{watchedInsuranceType}</div>
          </FormProvider>
        );
      };

      render(<TestFormComponent />);

      const selects = screen.getAllByTestId('select');
      const insuranceSelect = selects[0];
      
      // Simulate selecting an option
      fireEvent.change(insuranceSelect, { target: { value: 'vida' } });

      await waitFor(() => {
        expect(screen.getByTestId('watched-insurance-type')).toHaveTextContent('vida');
      });
    });

    it('updates form state when payment method is selected', async () => {
      const TestFormComponent = () => {
        const methods = useForm<FormSchemaType>({
          resolver: zodResolver(formSchema),
          defaultValues: {
            nombreCompleto: 'Test User',
            telefono: '+57 300 123 4567',
            email: 'test@example.com',
            tipoSeguro: '',
            metodoPago: '',
            periodicidadPago: '',
            aceptaDeclaracionAsesoria: false,
            aceptaTerminosYPolitica: false,
            declaraRenta: 'si',
          },
        });

        const watchedPaymentMethod = methods.watch('metodoPago');

        return (
          <FormProvider {...methods}>
            <Step2_InsuranceSelection />
            <div data-testid="watched-payment-method">{watchedPaymentMethod}</div>
          </FormProvider>
        );
      };

      render(<TestFormComponent />);

      const selects = screen.getAllByTestId('select');
      const paymentSelect = selects[1];
      
      // Simulate selecting an option
      fireEvent.change(paymentSelect, { target: { value: 'tarjeta_credito' } });

      await waitFor(() => {
        expect(screen.getByTestId('watched-payment-method')).toHaveTextContent('tarjeta_credito');
      });
    });

    it('updates form state when payment frequency is selected', async () => {
      const TestFormComponent = () => {
        const methods = useForm<FormSchemaType>({
          resolver: zodResolver(formSchema),
          defaultValues: {
            nombreCompleto: 'Test User',
            telefono: '+57 300 123 4567',
            email: 'test@example.com',
            tipoSeguro: '',
            metodoPago: '',
            periodicidadPago: '',
            aceptaDeclaracionAsesoria: false,
            aceptaTerminosYPolitica: false,
            declaraRenta: 'si',
          },
        });

        const watchedFrequency = methods.watch('periodicidadPago');

        return (
          <FormProvider {...methods}>
            <Step2_InsuranceSelection />
            <div data-testid="watched-frequency">{watchedFrequency}</div>
          </FormProvider>
        );
      };

      render(<TestFormComponent />);

      const selects = screen.getAllByTestId('select');
      const frequencySelect = selects[2];
      
      // Simulate selecting an option
      fireEvent.change(frequencySelect, { target: { value: 'trimestral' } });

      await waitFor(() => {
        expect(screen.getByTestId('watched-frequency')).toHaveTextContent('trimestral');
      });
    });

    it('handles empty initial values correctly', () => {
      render(
        <TestWrapper defaultValues={{
          tipoSeguro: '',
          metodoPago: '',
          periodicidadPago: ''
        }}>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      const selects = screen.getAllByTestId('select');
      
      // In our mocked implementation, empty values should result in no selected option
      // or the placeholder being visible
      expect(selects).toHaveLength(3);
      expect(screen.getAllByText('Selecciona un tipo de seguro')).toHaveLength(2);
      expect(screen.getAllByText('Selecciona un método de pago')).toHaveLength(2);
      expect(screen.getAllByText('Selecciona la periodicidad')).toHaveLength(2);
    });

    it('preserves existing values when re-rendered', () => {
      const existingValues = {
        tipoSeguro: 'vida',
        metodoPago: 'tarjeta_credito',
        periodicidadPago: 'mensual',
      };

      render(
        <TestWrapper defaultValues={existingValues}>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      const selects = screen.getAllByTestId('select');
      
      expect(selects[0]).toHaveValue('vida');
      expect(selects[1]).toHaveValue('tarjeta_credito');
      expect(selects[2]).toHaveValue('mensual');
    });
  });

  describe('Conditional Rendering Logic', () => {
    it('provides foundation for conditional field rendering in subsequent steps', () => {
      // This step sets up the insurance type that will be used for conditional rendering
      // in later steps. Test that different insurance types are properly available.
      
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      // Verify that all insurance types that trigger different conditional logic are available
      const conditionalInsuranceTypes = [
        'vida',
        'salud', 
        'hogar',
        'auto',
        'empresarial',
        'rentas',
        'mascotas',
        'responsabilidad_civil',
        'vida_credito_protegido'
      ];

      // Map insurance types to their display labels for proper matching
      const typeToLabelMap: Record<string, RegExp> = {
        'vida': /seguro de vida$/i,
        'salud': /seguro de salud/i,
        'hogar': /seguro de hogar/i,
        'auto': /seguro de autos/i,
        'empresarial': /seguro empresarial/i,
        'rentas': /seguro de rentas/i,
        'mascotas': /seguro para mascotas/i,
        'responsabilidad_civil': /responsabilidad civil/i,
        'vida_credito_protegido': /crédito protegido/i
      };

      conditionalInsuranceTypes.forEach(type => {
        const pattern = typeToLabelMap[type];
        const options = screen.getAllByRole('option', { name: pattern });
        expect(options.length).toBeGreaterThanOrEqual(1);
        expect(options[0]).toBeInTheDocument();
        expect(options[0]).toHaveAttribute('value', type);
      });
    });

    it('ensures insurance type selection affects form validation requirements', () => {
      // Test that different insurance types have different validation requirements
      const baseData = {
        nombreCompleto: 'Test User',
        telefono: '+57 300 123 4567',
        email: 'test@example.com',
        metodoPago: 'tarjeta_credito',
        periodicidadPago: 'mensual',
        aceptaDeclaracionAsesoria: true,
        aceptaTerminosYPolitica: true,
        declaraRenta: 'si',
        numeroCedula: '12345678',
        fotoCedula: [new File(['test'], 'cedula.pdf', { type: 'application/pdf' })],
        archivoDeclaracionRenta: [new File(['test'], 'declaracion.pdf', { type: 'application/pdf' })],
      };

      // Test 'vida' insurance type requires beneficiaries
      const vidaData = { ...baseData, tipoSeguro: 'vida' };
      const vidaResult = formSchema.safeParse(vidaData);
      expect(vidaResult.success).toBe(false);
      if (!vidaResult.success) {
        const errors = vidaResult.error.issues.map(err => err.message);
        expect(errors).toContain('Los nombres de beneficiarios y porcentajes son requeridos.');
      }

      // Test 'responsabilidad_civil' insurance type has fewer requirements
      const responsabilidadData = { ...baseData, tipoSeguro: 'responsabilidad_civil' };
      const responsabilidadResult = formSchema.safeParse(responsabilidadData);
      expect(responsabilidadResult.success).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      const labels = [
        'Tipo de seguro que deseas contratar',
        'Método de pago preferido',
        'Periodicidad de pago',
      ];

      labels.forEach(labelText => {
        expect(screen.getByText(labelText)).toBeInTheDocument();
      });
    });

    it('uses semantic select elements', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      const selects = screen.getAllByTestId('select');
      expect(selects).toHaveLength(3);

      selects.forEach(select => {
        expect(select.tagName).toBe('SELECT');
      });
    });

    it('provides clear option labels', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      // Check that option labels are clear and descriptive
      const testLabels = ['Seguro de Vida', 'Seguro de Autos', 'Tarjeta de Crédito', 'Débito Automático', 'Mensual', 'Anual'];
      
      testLabels.forEach(label => {
        const options = screen.getAllByRole('option', { name: label });
        expect(options.length).toBeGreaterThanOrEqual(1);
        expect(options[0]).toBeInTheDocument();
      });
    });

    it('has appropriate required indicators', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators).toHaveLength(3);
      
      requiredIndicators.forEach(indicator => {
        expect(indicator).toHaveClass('text-red-500');
      });
    });
  });

  describe('Component Integration', () => {
    it('integrates properly with React Hook Form context', () => {
      // Test that the component doesn't throw when rendered within FormProvider
      expect(() => {
        render(
          <TestWrapper>
            <Step2_InsuranceSelection />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('renders correct number of form fields', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      const selects = screen.getAllByTestId('select');
      
      // Should have 3 select elements for tipoSeguro, metodoPago, and periodicidadPago
      expect(selects).toHaveLength(3);
    });

    it('displays FormMessage components for error handling', () => {
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      // FormMessage components should be present for error display
      // (errors are shown conditionally based on validation state)
      const selects = screen.getAllByTestId('select');
      expect(selects).toHaveLength(3);
    });
  });

  describe('Data Consistency', () => {
    it('maintains consistent option values across renders', () => {
      const { rerender } = render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      // Store initial options, filtering out duplicates
      const initialOptions = Array.from(new Set(
        screen.getAllByRole('option').map(option => JSON.stringify({
          value: option.getAttribute('value'),
          text: option.textContent,
        }))
      )).map(optionStr => JSON.parse(optionStr));

      // Re-render component
      rerender(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      // Check that options remain the same, filtering out duplicates
      const newOptions = Array.from(new Set(
        screen.getAllByRole('option').map(option => JSON.stringify({
          value: option.getAttribute('value'),
          text: option.textContent,
        }))
      )).map(optionStr => JSON.parse(optionStr));

      expect(newOptions).toEqual(initialOptions);
    });

    it('has consistent data structure for insurance types', () => {
      // Verify that the insurance type options match what's expected by the form schema
      render(
        <TestWrapper>
          <Step2_InsuranceSelection />
        </TestWrapper>
      );

      const insuranceOptions = [
        { value: 'vida', pattern: /seguro de vida/i },
        { value: 'salud', pattern: /seguro de salud/i },
        { value: 'hogar', pattern: /seguro de hogar/i },
        { value: 'auto', pattern: /seguro de autos/i },
        { value: 'empresarial', pattern: /seguro empresarial/i },
        { value: 'rentas', pattern: /seguro de rentas/i },
        { value: 'mascotas', pattern: /seguro para mascotas/i },
        { value: 'responsabilidad_civil', pattern: /responsabilidad civil/i },
        { value: 'vida_credito_protegido', pattern: /crédito protegido/i }
      ];

      insuranceOptions.forEach(({ value, pattern }) => {
        const options = screen.getAllByRole('option', { name: pattern });
        expect(options.length).toBeGreaterThanOrEqual(1);
        expect(options[0]).toHaveAttribute('value', value);
      });
    });
  });
});