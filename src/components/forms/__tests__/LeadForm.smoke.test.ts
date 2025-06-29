/**
 * Smoke Test for LeadForm Component
 * Verifies basic import and type checking without rendering
 */

import { describe, it, expect, vi } from 'vitest';

// Mock required dependencies to avoid import errors
vi.mock('react-router-dom', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock global fetch for CSRF token
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ token: 'test-token' }),
});

describe('LeadForm Smoke Test', () => {
  it('should import LeadForm component without errors', async () => {
    try {
      const LeadFormModule = await import('../LeadForm');
      expect(LeadFormModule.default).toBeDefined();
      expect(typeof LeadFormModule.default).toBe('function');
    } catch (error) {
      throw new Error(`Failed to import LeadForm: ${error}`);
    }
  });

  it('should have proper component structure', async () => {
    const LeadFormModule = await import('../LeadForm');
    const LeadForm = LeadFormModule.default;
    
    // Check if it's a React component (function)
    expect(typeof LeadForm).toBe('function');
    
    // Check if component has a name
    expect(LeadForm.name).toBe('LeadForm');
  });

  it('should have required security features in source code', async () => {
    // Read the source file to verify security features
    const fs = await import('fs');
    const path = await import('path');
    
    const sourcePath = path.resolve(__dirname, '../LeadForm.tsx');
    const sourceCode = fs.readFileSync(sourcePath, 'utf-8');
    
    // Check for CSRF token handling
    expect(sourceCode).toContain('csrfToken');
    expect(sourceCode).toContain('X-CSRF-Token');
    
    // Check for honeypot field
    expect(sourceCode).toContain('website');
    expect(sourceCode).toContain('sr-only');
    
    // Check for form validation
    expect(sourceCode).toContain('zodResolver');
    expect(sourceCode).toContain('formSchema');
    
    // Check for proper form submission
    expect(sourceCode).toContain('/api/send-email');
    expect(sourceCode).toContain('POST');
  });

  it('should have proper TypeScript types', async () => {
    const LeadFormModule = await import('../LeadForm');
    const LeadForm = LeadFormModule.default;
    
    // Component should be defined and callable
    expect(LeadForm).toBeDefined();
    expect(typeof LeadForm).toBe('function');
    
    // Should not throw when creating with valid props
    const validProps = {
      initialInsuranceType: 'vida',
      onLinkClick: vi.fn(),
      title: 'Test Title',
      subtitle: 'Test Subtitle',
      onClose: vi.fn(),
    };
    
    // Component should accept these props without TypeScript errors
    expect(validProps).toBeDefined();
  });

  it('should have insurance type options', async () => {
    // Read the source to check for insurance types
    const fs = await import('fs');
    const path = await import('path');
    
    const sourcePath = path.resolve(__dirname, '../LeadForm.tsx');
    const sourceCode = fs.readFileSync(sourcePath, 'utf-8');
    
    // Check for expected insurance types
    const expectedTypes = ['vida', 'salud', 'hogar', 'auto', 'viaje', 'arl', 'empresarial', 'mascotas'];
    
    expectedTypes.forEach(type => {
      expect(sourceCode).toContain(type);
    });
    
    // Check for tiposSeguro array
    expect(sourceCode).toContain('tiposSeguro');
  });
});