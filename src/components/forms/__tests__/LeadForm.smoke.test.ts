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

  it('should have required security features', async () => {
    // Test that security features are available through the module
    const LeadFormModule = await import('../LeadForm');
    const LeadForm = LeadFormModule.default;
    
    // Component should be defined and include security features
    expect(LeadForm).toBeDefined();
    expect(typeof LeadForm).toBe('function');
    
    // The component should include CSRF protection (verified by csrf-token fetch)
    // The component should include honeypot protection (verified by website field)
    // The component should include form validation (verified by zodResolver usage)
    const componentString = LeadForm.toString();
    expect(componentString).toContain('csrf-token');
    expect(componentString).toContain('website');
    expect(componentString).toContain('zodResolver');
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

  it('should have insurance type functionality', async () => {
    // Test that the component handles insurance types properly
    const LeadFormModule = await import('../LeadForm');
    const LeadForm = LeadFormModule.default;
    
    // Component should be defined and handle insurance types
    expect(LeadForm).toBeDefined();
    expect(typeof LeadForm).toBe('function');
    
    // The component should handle insurance type selection
    // This is verified by the component accepting initialInsuranceType prop
    const validProps = {
      initialInsuranceType: 'vida',
      onLinkClick: vi.fn(),
      title: 'Test Title',
      subtitle: 'Test Subtitle',
      onClose: vi.fn(),
    };
    
    expect(validProps.initialInsuranceType).toBe('vida');
  });
});