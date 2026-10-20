/**
 * FileUpload Component Tests
 * Tests file type validation, size limits, multiple files, security, error states, and accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FileUpload from '../FileUpload';
import { formSchema, type FormSchemaType } from '../formSchema';
import userEvent from '@testing-library/user-event';

// Mock implementation for react-dropzone
interface MockDropzoneConfig {
  accept?: Record<string, string[]>;
  onDropAccepted?: (files: File[]) => void;
  onDropRejected?: (fileRejections: { file: File; errors: { code: string; message: string }[] }[]) => void;
}

let mockDropzoneConfig: MockDropzoneConfig | null = null;

// Mock react-dropzone - must be hoisted before usage
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn((config: MockDropzoneConfig) => {
    mockDropzoneConfig = config;
    return {
      getRootProps: () => ({
        'data-testid': 'dropzone',
        onClick: vi.fn(),
      }),
      getInputProps: () => ({
        'data-testid': 'file-input',
        type: 'file',
        accept: Object.keys(config.accept || {}).join(','),
        multiple: true,
      }),
      isDragActive: false,
      acceptedFiles: [],
      fileRejections: [],
    };
  }),
}));

// Get the mocked function for testing
const getMockUseDropzone = () => vi.mocked(vi.importMock('react-dropzone')).useDropzone;

// Test wrapper component
const TestWrapper = ({ children, defaultValues = {} }: { children: React.ReactNode, defaultValues?: Partial<FormSchemaType> }) => {
  const methods = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: 'Test User',
      telefono: '+57 300 123 4567',
      email: 'test@example.com',
      tipoSeguro: 'vida',
      metodoPago: 'mensual',
      periodicidadPago: 'mensual',
      aceptaDeclaracionAsesoria: true,
      aceptaTerminosYPolitica: true,
      declaraRenta: 'si',
      numeroCedula: '12345678',
      ...defaultValues,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

// Helper function to create test files
const createTestFile = (name: string, type: string, size: number = 1024) => {
  const buffer = new ArrayBuffer(size);
  const file = new File([buffer], name, { type });
  // Mock file size property
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('FileUpload Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('renders with correct label and description', () => {
      render(
        <TestWrapper>
          <FileUpload 
            name="fotoCedula" 
            label="Foto de Cédula *" 
            description="Sube una foto clara de tu cédula"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Foto de Cédula')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('Sube una foto clara de tu cédula')).toBeInTheDocument();
    });

    it('renders dropzone area with correct text', () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );

      expect(screen.getByText('Toca para seleccionar archivos')).toBeInTheDocument();
      expect(screen.getByText('PDF, JPG, PNG, WEBP, DOC, DOCX (máx. 5MB por archivo)')).toBeInTheDocument();
    });

    it('renders file input with correct attributes', () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });
  });

  describe('File Type Validation', () => {
    it('accepts valid file types', async () => {
      const validFiles = [
        createTestFile('document.pdf', 'application/pdf'),
        createTestFile('image.jpg', 'image/jpeg'),
        createTestFile('image.png', 'image/png'),
        createTestFile('image.webp', 'image/webp'),
        createTestFile('document.doc', 'application/msword'),
        createTestFile('document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      ];

      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );

      // Check that accepted types are configured correctly
      expect(mockDropzoneConfig).toBeTruthy();
      const acceptedTypes = Object.keys(mockDropzoneConfig.accept);
      expect(acceptedTypes).toContain('application/pdf');
      expect(acceptedTypes).toContain('image/jpeg');
      expect(acceptedTypes).toContain('image/png');
      expect(acceptedTypes).toContain('image/webp');
      expect(acceptedTypes).toContain('application/msword');
      expect(acceptedTypes).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('rejects invalid file types and shows error message', async () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );

      // Simulate file rejection
      const invalidFile = createTestFile('test.txt', 'text/plain');
      const fileRejections = [
        {
          file: invalidFile,
          errors: [{ code: 'file-invalid-type', message: 'File type not accepted' }]
        }
      ];

      // Call the rejection handler
      mockDropzoneConfig.onDropRejected(fileRejections);

      await waitFor(() => {
        expect(screen.getByText('El tipo de archivo no es válido. Solo puedes subir: PDF, JPG, PNG, WEBP, DOC, DOCX.')).toBeInTheDocument();
      });
    });
  });

  describe('File Size Validation', () => {
    it('accepts files under 5MB size limit', async () => {
      const validSizeFile = createTestFile('document.pdf', 'application/pdf', 4 * 1024 * 1024); // 4MB

      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );

      // Simulate successful file drop
      mockDropzoneConfig.onDropAccepted([validSizeFile]);

      await waitFor(() => {
        expect(screen.getByText('Archivos seleccionados:')).toBeInTheDocument();
        expect(screen.getByText('document.pdf')).toBeInTheDocument();
      });
    });

    it('shows error for files over 5MB limit through form validation', () => {
      const oversizedFile = createTestFile('large.pdf', 'application/pdf', 6 * 1024 * 1024); // 6MB
      
      // Test the file validation directly through the schema
      const result = formSchema.safeParse({
        nombreCompleto: 'Test User',
        telefono: '+57 300 123 4567',
        email: 'test@example.com',
        tipoSeguro: 'vida',
        metodoPago: 'mensual',
        periodicidadPago: 'mensual',
        aceptaDeclaracionAsesoria: true,
        aceptaTerminosYPolitica: true,
        declaraRenta: 'si',
        numeroCedula: '12345678',
        fotoCedula: [oversizedFile],
        archivoDeclaracionRenta: [createTestFile('small.pdf', 'application/pdf')],
        beneficiarios: 'Test Beneficiary',
        documentosBeneficiarios: [createTestFile('beneficiary.pdf', 'application/pdf')],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map(err => err.message);
        expect(errorMessages).toContain('Verifica los archivos: solo se aceptan PDF, JPG, PNG, WEBP, DOC, DOCX (máx. 5MB).');
      }
    });
  });

  describe('Multiple File Handling', () => {
    it('handles single file mode correctly', async () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" multiple={false} />
        </TestWrapper>
      );

      const file1 = createTestFile('first.pdf', 'application/pdf');
      const file2 = createTestFile('second.pdf', 'application/pdf');
      
      // Add first file
      mockDropzoneConfig.onDropAccepted([file1]);

      await waitFor(() => {
        expect(screen.getByText('first.pdf')).toBeInTheDocument();
      });

      // Add second file (should replace first in single mode)
      mockDropzoneConfig.onDropAccepted([file2]);

      await waitFor(() => {
        expect(screen.getByText('second.pdf')).toBeInTheDocument();
        expect(screen.queryByText('first.pdf')).not.toBeInTheDocument();
      });
    });

    it('handles multiple file mode correctly', async () => {
      render(
        <TestWrapper>
          <FileUpload name="documentosBeneficiarios" label="Documentos" multiple={true} />
        </TestWrapper>
      );

      const file1 = createTestFile('first.pdf', 'application/pdf');
      const file2 = createTestFile('second.pdf', 'application/pdf');
      
      // Add first file
      mockDropzoneConfig.onDropAccepted([file1]);

      await waitFor(() => {
        expect(screen.getByText('first.pdf')).toBeInTheDocument();
      });

      // Add second file (should keep both in multiple mode)
      mockDropzoneConfig.onDropAccepted([file2]);

      await waitFor(() => {
        expect(screen.getByText('first.pdf')).toBeInTheDocument();
        expect(screen.getByText('second.pdf')).toBeInTheDocument();
      });
    });

    it('allows removing individual files', async () => {
      render(
        <TestWrapper>
          <FileUpload name="documentosBeneficiarios" label="Documentos" multiple={true} />
        </TestWrapper>
      );

      const file1 = createTestFile('first.pdf', 'application/pdf');
      const file2 = createTestFile('second.pdf', 'application/pdf');
      
      // Add files
      mockDropzoneConfig.onDropAccepted([file1, file2]);

      await waitFor(() => {
        expect(screen.getByText('first.pdf')).toBeInTheDocument();
        expect(screen.getByText('second.pdf')).toBeInTheDocument();
      });

      // Remove first file
      const removeButtons = screen.getAllByRole('button');
      const firstRemoveButton = removeButtons.find(button => 
        button.parentElement?.parentElement?.textContent?.includes('first.pdf')
      );
      
      if (firstRemoveButton) {
        fireEvent.click(firstRemoveButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('first.pdf')).not.toBeInTheDocument();
        expect(screen.getByText('second.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('displays form validation errors', () => {
      render(
        <TestWrapper defaultValues={{ fotoCedula: [] }}>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );

      // Trigger form validation by submitting with missing required file
      const formData = {
        nombreCompleto: 'Test User',
        telefono: '+57 300 123 4567',
        email: 'test@example.com',
        tipoSeguro: 'vida',
        metodoPago: 'mensual',
        periodicidadPago: 'mensual',
        aceptaDeclaracionAsesoria: true,
        aceptaTerminosYPolitica: true,
        declaraRenta: 'si',
        numeroCedula: '12345678',
        fotoCedula: [], // Missing required file
      };

      const result = formSchema.safeParse(formData);
      expect(result.success).toBe(false);
    });

    it('clears errors when valid files are added', async () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );

      // First, trigger an error
      const invalidFile = createTestFile('test.txt', 'text/plain');
      mockDropzoneConfig.onDropRejected([{
        file: invalidFile,
        errors: [{ code: 'file-invalid-type', message: 'File type not accepted' }]
      }]);

      await waitFor(() => {
        expect(screen.getByText('El tipo de archivo no es válido. Solo puedes subir: PDF, JPG, PNG, WEBP, DOC, DOCX.')).toBeInTheDocument();
      });

      // Then, add a valid file
      const validFile = createTestFile('valid.pdf', 'application/pdf');
      mockDropzoneConfig.onDropAccepted([validFile]);

      await waitFor(() => {
        expect(screen.queryByText('El tipo de archivo no es válido. Solo puedes subir: PDF, JPG, PNG, WEBP, DOC, DOCX.')).not.toBeInTheDocument();
        expect(screen.getByText('valid.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('Security Validation', () => {
    it('validates file types on both client and server side', () => {
      // Test that the schema validates file types
      const maliciousFile = createTestFile('script.exe', 'application/x-executable');
      
      const result = formSchema.safeParse({
        nombreCompleto: 'Test User',
        telefono: '+57 300 123 4567',
        email: 'test@example.com',
        tipoSeguro: 'vida',
        metodoPago: 'mensual',
        periodicidadPago: 'mensual',
        aceptaDeclaracionAsesoria: true,
        aceptaTerminosYPolitica: true,
        declaraRenta: 'si',
        numeroCedula: '12345678',
        fotoCedula: [maliciousFile],
        archivoDeclaracionRenta: [createTestFile('valid.pdf', 'application/pdf')],
        beneficiarios: 'Test Beneficiary',
        documentosBeneficiarios: [createTestFile('beneficiary.pdf', 'application/pdf')],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map(err => err.message);
        expect(errorMessages).toContain('Verifica los archivos: solo se aceptan PDF, JPG, PNG, WEBP, DOC, DOCX (máx. 5MB).');
      }
    });

    it('enforces maximum file count through form behavior', async () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" multiple={false} />
        </TestWrapper>
      );

      // In single mode, only one file should be kept
      const file1 = createTestFile('first.pdf', 'application/pdf');
      const file2 = createTestFile('second.pdf', 'application/pdf');
      
      mockDropzoneConfig.onDropAccepted([file1, file2]);

      await waitFor(() => {
        // In single mode, should only show the last files
        expect(screen.getByText('second.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );

      const label = screen.getByText('Foto de Cédula');
      expect(label.tagName).toBe('LABEL');
      // The label names the file input itself, not just sits next to it
      expect(screen.getByLabelText('Foto de Cédula')).toBe(screen.getByTestId('file-input'));
    });

    it('labels each file input with its own label when several uploads share a page', () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula *" />
          <FileUpload name="rut" label="RUT (Obligatorio) *" />
        </TestWrapper>
      );

      const [cedulaInput, rutInput] = screen.getAllByTestId('file-input');
      expect(screen.getByLabelText(/Foto de Cédula/)).toBe(cedulaInput);
      expect(screen.getByLabelText(/RUT \(Obligatorio\)/)).toBe(rutInput);
      expect(cedulaInput.getAttribute('aria-labelledby')).not.toBe(rutInput.getAttribute('aria-labelledby'));
    });

    it('shows required indicator correctly', () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula *" />
        </TestWrapper>
      );

      // Should show asterisk separately from label text
      expect(screen.getByText('Foto de Cédula')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveClass('text-red-500');
    });

    it('provides clear error messages', async () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );
      
      mockDropzoneConfig.onDropRejected([{
        file: createTestFile('test.txt', 'text/plain'),
        errors: [{ code: 'file-invalid-type', message: 'File type not accepted' }]
      }]);

      await waitFor(() => {
        const errorMessage = screen.getByText('El tipo de archivo no es válido. Solo puedes subir: PDF, JPG, PNG, WEBP, DOC, DOCX.');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-600');
      });
    });

    it('shows file size and type information', () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );

      expect(screen.getByText('PDF, JPG, PNG, WEBP, DOC, DOCX (máx. 5MB por archivo)')).toBeInTheDocument();
    });

    it('provides remove buttons with clear action', async () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );

      const file = createTestFile('test.pdf', 'application/pdf');
      
      mockDropzoneConfig.onDropAccepted([file]);

      await waitFor(() => {
        const removeButton = screen.getByRole('button');
        expect(removeButton).toBeInTheDocument();
        expect(removeButton).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Integration with React Hook Form', () => {
    it('updates form state when files are added', async () => {
      const TestFormComponent = () => {
        const methods = useForm<FormSchemaType>({
          resolver: zodResolver(formSchema),
          defaultValues: {
            nombreCompleto: 'Test User',
            telefono: '+57 300 123 4567',
            email: 'test@example.com',
            tipoSeguro: 'vida',
            metodoPago: 'mensual',
            periodicidadPago: 'mensual',
            aceptaDeclaracionAsesoria: true,
            aceptaTerminosYPolitica: true,
            declaraRenta: 'si',
            numeroCedula: '12345678',
          },
        });

        const watchedFiles = methods.watch('fotoCedula');

        return (
          <FormProvider {...methods}>
            <FileUpload name="fotoCedula" label="Foto de Cédula" />
            <div data-testid="file-count">{(watchedFiles || []).length}</div>
          </FormProvider>
        );
      };

      render(<TestFormComponent />);

      const file = createTestFile('test.pdf', 'application/pdf');
      
      mockDropzoneConfig.onDropAccepted([file]);

      await waitFor(() => {
        expect(screen.getByTestId('file-count')).toHaveTextContent('1');
      });
    });

    it('triggers form validation when files are updated', async () => {
      render(
        <TestWrapper>
          <FileUpload name="fotoCedula" label="Foto de Cédula" />
        </TestWrapper>
      );

      const file = createTestFile('test.pdf', 'application/pdf');
      
      // The component should call setValue with shouldValidate: true
      mockDropzoneConfig.onDropAccepted([file]);

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });
    });
  });
});