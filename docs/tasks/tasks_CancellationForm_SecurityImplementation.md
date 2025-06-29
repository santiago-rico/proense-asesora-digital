# CancellationForm Security Implementation Plan

## Overview
This document provides a comprehensive implementation plan to address all security, accessibility, and usability issues identified in the CancellationForm audit. The implementation follows the patterns established in the FORM_SECURITY_IMPLEMENTATION_GUIDE.md.

## Issues Summary from Audit

### Failed Items Requiring Implementation:
1. **Autocomplete Functionality** - Missing autocomplete attributes
2. **CSRF Protection** - No CSRF token implementation
3. **XSS Protection** - Server-side sanitization needed
4. **Bot Protection** - No honeypot or CAPTCHA implementation
5. **Data Trimming** - Server-side string trimming required
6. **Server-side Validation** - Cannot verify from client code

## Implementation Plan

### Phase 1: Backend Security Infrastructure

#### 1.1 Update API Endpoint (`/api/send-cancellation-request.ts`)

**Current Issues:**
- Missing CSRF protection
- No input sanitization against XSS
- No bot protection
- No server-side data trimming
- Insufficient server-side validation

**Implementation Steps:**

1. **Add Required Dependencies** (if not already installed)
   ```bash
   npm install csrf cookie dompurify jsdom zod
   npm install --save-dev @types/cookie @types/dompurify
   ```

2. **Create Comprehensive Zod Schema**
   ```typescript
   const cancellationSchema = z.object({
     nombreCompleto: z.string()
       .min(2, 'El nombre debe tener al menos 2 caracteres')
       .max(100, 'El nombre no puede exceder 100 caracteres'),
     numeroCedula: z.string()
       .min(7, 'La cédula debe tener al menos 7 caracteres')
       .max(20, 'La cédula no puede exceder 20 caracteres')
       .regex(/^[0-9A-Za-z\-]+$/, 'La cédula contiene caracteres inválidos'),
     email: z.string()
       .email('Correo electrónico inválido')
       .max(254, 'El correo no puede exceder 254 caracteres'),
     telefono: z.string()
       .regex(/^[\+]?[0-9\-\s\(\)]{10,20}$/, 'Número de teléfono inválido'),
     tipoSeguro: z.enum(['auto', 'vida', 'hogar', 'empresarial', 'otro'], {
       errorMap: () => ({ message: 'Debe seleccionar un tipo de seguro válido' })
     }),
     nombreAseguradora: z.string()
       .min(2, 'El nombre de la aseguradora debe tener al menos 2 caracteres')
       .max(100, 'El nombre de la aseguradora no puede exceder 100 caracteres'),
     numeroPoliza: z.string()
       .min(5, 'El número de póliza debe tener al menos 5 caracteres')
       .max(50, 'El número de póliza no puede exceder 50 caracteres'),
     otroSeguro: z.string()
       .max(100, 'El tipo de seguro no puede exceder 100 caracteres')
       .optional(),
     cancellationReason: z.string()
       .min(10, 'La razón de cancelación debe tener al menos 10 caracteres')
       .max(1000, 'La razón de cancelación no puede exceder 1000 caracteres'),
     aceptaTerminosYPolitica: z.boolean()
       .refine(val => val === true, {
         message: 'Debe aceptar los términos y condiciones'
       }),
     website: z.string().optional(), // Honeypot field
   }).superRefine((data, ctx) => {
     // Conditional validation for otroSeguro
     if (data.tipoSeguro === 'otro' && (!data.otroSeguro || data.otroSeguro.trim().length === 0)) {
       ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: 'Debe especificar el tipo de seguro',
         path: ['otroSeguro']
       });
     }
   });
   ```

3. **Implement Complete API Endpoint**
   ```typescript
   import type { VercelRequest, VercelResponse } from '@vercel/node';
   import { z } from 'zod';
   import { JSDOM } from 'jsdom';
   
   export default async function handler(
     req: VercelRequest,
     res: VercelResponse,
   ) {
     if (req.method !== 'POST') {
       return res.status(405).json({ message: 'Method not allowed' });
     }
   
     try {
       // Dynamic imports for security modules
       const dompurifyModule = await import('dompurify');
       const DOMPurify = (dompurifyModule as any).default || dompurifyModule;
       const { parse } = await import('cookie');
       const { default: Tokens } = await import('csrf') as any;
       const tokens = new Tokens();
       
       // Initialize DOMPurify with JSDOM
       const window = new JSDOM('').window;
       const DOMPurifyInstance = DOMPurify(window);
       
       // CSRF Protection
       const cookies = parse(req.headers.cookie || '');
       const secret = cookies._csrf_secret;
       const token = req.headers['x-csrf-token'] as string;
       
       if (!secret || !token || !tokens.verify(secret, token)) {
         return res.status(403).json({ message: 'Invalid CSRF token' });
       }
   
       // Parse and validate request body
       const validationResult = cancellationSchema.safeParse(req.body);
       
       if (!validationResult.success) {
         return res.status(400).json({
           message: 'Datos inválidos.',
           errors: validationResult.error.flatten().fieldErrors,
         });
       }
   
       const data = validationResult.data;
   
       // Bot Protection - Honeypot Check
       if (data.website && data.website.length > 0) {
         // Silently accept but don't process spam submissions
         return res.status(200).json({ 
           message: 'Solicitud de cancelación enviada con éxito.',
           data: { messageId: 'spam-filtered' }
         });
       }
   
       // Data Trimming and Sanitization
       const sanitizedData = {
         nombreCompleto: DOMPurifyInstance.sanitize(data.nombreCompleto.trim()),
         numeroCedula: DOMPurifyInstance.sanitize(data.numeroCedula.trim()),
         email: data.email.trim().toLowerCase(),
         telefono: data.telefono.trim(),
         tipoSeguro: data.tipoSeguro,
         nombreAseguradora: DOMPurifyInstance.sanitize(data.nombreAseguradora.trim()),
         numeroPoliza: DOMPurifyInstance.sanitize(data.numeroPoliza.trim()),
         otroSeguro: data.otroSeguro ? DOMPurifyInstance.sanitize(data.otroSeguro.trim()) : '',
         cancellationReason: DOMPurifyInstance.sanitize(data.cancellationReason.trim()),
         aceptaTerminosYPolitica: data.aceptaTerminosYPolitica,
       };
   
       // Email sending logic (using existing Brevo setup)
       // ... implement email sending with sanitized data
   
       res.status(200).json({
         message: 'Solicitud de cancelación enviada con éxito.',
         data: { messageId: 'processed' },
       });
   
     } catch (error) {
       console.error('Error in cancellation request handler:', error);
       res.status(500).json({ 
         message: 'Error al procesar la solicitud. Por favor, intenta de nuevo.' 
       });
     }
   }
   ```

### Phase 2: Frontend Security Enhancements

#### 2.1 Create CSRF Hook (`src/hooks/useCsrf.ts`)

```typescript
import { useState, useEffect } from 'react';

interface CsrfState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useCsrf = () => {
  const [state, setState] = useState<CsrfState>({
    token: null,
    loading: true,
    error: null,
  });

  const fetchToken = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/csrf-token', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      setState({
        token: data.token,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        token: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return {
    ...state,
    refetch: fetchToken,
  };
};
```

#### 2.2 Update CancellationForm Component

**Key Changes Required:**

1. **Add Autocomplete Attributes**
   ```tsx
   // nombreCompleto field
   <Input
     {...field}
     autoComplete="name"
     placeholder="Nombre completo"
   />
   
   // numeroCedula field
   <Input
     {...field}
     autoComplete="on"
     placeholder="Número de cédula"
   />
   
   // email field
   <Input
     {...field}
     type="email"
     autoComplete="email"
     placeholder="Correo electrónico"
   />
   
   // telefono field (PhoneInput)
   <PhoneInput
     {...field}
     autoComplete="tel"
     placeholder="Número de teléfono"
   />
   
   // nombreAseguradora field
   <Input
     {...field}
     autoComplete="organization"
     placeholder="Nombre de la aseguradora"
   />
   
   // numeroPoliza field
   <Input
     {...field}
     autoComplete="off"
     placeholder="Número de póliza"
   />
   ```

2. **Add CSRF Protection**
   ```tsx
   import { useCsrf } from '@/hooks/useCsrf';
   
   const CancellationForm = () => {
     const { token: csrfToken, loading: csrfLoading, error: csrfError } = useCsrf();
     
     // Update submit button disable logic
     const isSubmitDisabled = isSubmitting || !csrfToken || csrfLoading;
     
     // Update onSubmit to include CSRF token
     const onSubmit = async (data: FormData) => {
       setIsSubmitting(true);
       try {
         const response = await fetch("/api/send-cancellation-request", {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             "X-CSRF-Token": csrfToken || "",
           },
           credentials: "include",
           body: JSON.stringify({
             ...data,
             website: data.website, // Include honeypot
           }),
         });
         
         // Handle 403 CSRF errors specifically
         if (response.status === 403) {
           toast({
             title: "Error de Seguridad",
             description: "Por favor, recarga la página e intenta de nuevo.",
             variant: "destructive",
           });
           return;
         }
         
         // Rest of existing logic...
       } catch (error) {
         // Handle network errors
       } finally {
         setIsSubmitting(false);
       }
     };
   };
   ```

3. **Add Honeypot Field**
   ```tsx
   // Add to form schema
   const formSchema = z.object({
     // ... existing fields
     website: z.string().optional(), // Honeypot field
   }).superRefine(/* existing logic */);
   
   // Add hidden field in form JSX
   <input
     type="text"
     {...register('website')}
     style={{ display: 'none' }}
     tabIndex={-1}
     autoComplete="off"
   />
   ```

4. **Enhanced Error Handling**
   ```tsx
   // Add CSRF error handling in component
   useEffect(() => {
     if (csrfError) {
       toast({
         title: "Error de Seguridad",
         description: "No se pudo verificar la seguridad del formulario. Recarga la página.",
         variant: "destructive",
       });
     }
   }, [csrfError, toast]);
   ```

### Phase 3: Testing and Validation

#### 3.1 Create Security Test Script (`test-cancellation-form-security.js`)

```javascript
async function testCancellationFormSecurity() {
  const baseUrl = 'http://localhost:8080'; // Use dev server port from CLAUDE.md
  
  console.log('🔒 Testing CancellationForm Security Implementation\n');
  
  try {
    // Test 1: CSRF Token Fetch
    console.log('1. Testing CSRF token generation...');
    const tokenResponse = await fetch(`${baseUrl}/api/csrf-token`, {
      credentials: 'include'
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`CSRF token fetch failed: ${tokenResponse.status}`);
    }
    
    const { token } = await tokenResponse.json();
    const setCookie = tokenResponse.headers.get('set-cookie');
    console.log('✅ CSRF token generated successfully');
    
    // Test 2: Valid Form Submission with XSS Attempts
    console.log('\n2. Testing form submission with XSS sanitization...');
    const validData = {
      nombreCompleto: 'Juan <script>alert("XSS")</script> Pérez',
      numeroCedula: '12345678',
      email: 'juan.perez@example.com',
      telefono: '+573001234567',
      tipoSeguro: 'auto',
      nombreAseguradora: 'Seguros <img src=x onerror=alert("XSS")> ABC',
      numeroPoliza: 'POL123456',
      otroSeguro: '',
      cancellationReason: 'Cambio de <b>proveedor</b> de seguros',
      aceptaTerminosYPolitica: true,
      website: '' // Empty honeypot
    };
    
    const submitResponse = await fetch(`${baseUrl}/api/send-cancellation-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: JSON.stringify(validData),
      credentials: 'include'
    });
    
    if (submitResponse.ok) {
      console.log('✅ Form submission successful with XSS sanitization');
    } else {
      console.log(`⚠️  Form submission failed: ${submitResponse.status}`);
    }
    
    // Test 3: Honeypot Protection
    console.log('\n3. Testing honeypot bot protection...');
    const honeypotData = { ...validData, website: 'https://spam-bot.com' };
    
    const honeypotResponse = await fetch(`${baseUrl}/api/send-cancellation-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: JSON.stringify(honeypotData),
      credentials: 'include'
    });
    
    if (honeypotResponse.ok) {
      const result = await honeypotResponse.json();
      if (result.data?.messageId === 'spam-filtered') {
        console.log('✅ Honeypot protection working correctly');
      } else {
        console.log('⚠️  Honeypot protection may not be working');
      }
    }
    
    // Test 4: CSRF Protection
    console.log('\n4. Testing CSRF protection...');
    const csrfTestResponse = await fetch(`${baseUrl}/api/send-cancellation-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'invalid-token-12345',
        'Cookie': setCookie || ''
      },
      body: JSON.stringify(validData),
      credentials: 'include'
    });
    
    if (csrfTestResponse.status === 403) {
      console.log('✅ CSRF protection working correctly');
    } else {
      console.log(`⚠️  CSRF protection failed: expected 403, got ${csrfTestResponse.status}`);
    }
    
    // Test 5: Validation Edge Cases
    console.log('\n5. Testing validation edge cases...');
    const invalidData = {
      nombreCompleto: 'A', // Too short
      numeroCedula: '123', // Too short
      email: 'invalid-email',
      telefono: '123',
      tipoSeguro: 'invalid',
      nombreAseguradora: 'A',
      numeroPoliza: '123',
      cancellationReason: 'Short', // Too short
      aceptaTerminosYPolitica: false, // Not accepted
      website: ''
    };
    
    const validationResponse = await fetch(`${baseUrl}/api/send-cancellation-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: JSON.stringify(invalidData),
      credentials: 'include'
    });
    
    if (validationResponse.status === 400) {
      console.log('✅ Server-side validation working correctly');
    } else {
      console.log(`⚠️  Validation failed: expected 400, got ${validationResponse.status}`);
    }
    
    console.log('\n🎉 Security testing completed!');
    
  } catch (error) {
    console.error('❌ Security test failed:', error);
  }
}

// Run the test
testCancellationFormSecurity();
```

#### 3.2 Manual Testing Checklist

- [ ] Form loads without errors
- [ ] CSRF token is fetched successfully
- [ ] All autocomplete attributes work correctly
- [ ] Honeypot field is completely hidden
- [ ] Form submission works with valid data
- [ ] CSRF protection blocks invalid tokens
- [ ] XSS attempts are sanitized on server
- [ ] Bot submissions are filtered out
- [ ] Validation errors display correctly
- [ ] Success/error states work properly

### Phase 4: Code Quality and Accessibility

#### 4.1 Additional Accessibility Improvements

1. **Enhanced Error Messages**
   ```tsx
   // Add specific error descriptions for better screen reader support
   const errorMessages = {
     nombreCompleto: "El nombre completo es requerido y debe tener al menos 2 caracteres",
     numeroCedula: "La cédula es requerida y debe tener entre 7 y 20 caracteres",
     email: "Se requiere un correo electrónico válido",
     // ... etc
   };
   ```

2. **Loading States**
   ```tsx
   // Improve submit button accessibility
   <Button 
     type="submit" 
     disabled={isSubmitDisabled}
     aria-describedby={csrfError ? "csrf-error" : undefined}
   >
     {isSubmitting ? (
       <>
         <span className="sr-only">Procesando solicitud...</span>
         Enviando Solicitud...
       </>
     ) : (
       'Enviar Solicitud de Cancelación'
     )}
   </Button>
   ```

#### 4.2 Performance Optimizations

1. **Debounced Validation**
   ```tsx
   // Add debounced validation for better UX
   const form = useForm<FormData>({
     resolver: zodResolver(formSchema),
     mode: "onBlur", // Keep existing setting
     reValidateMode: "onChange",
     defaultValues: {
       // ... existing defaults
       website: "", // Honeypot
     },
   });
   ```

### Phase 5: Documentation and Maintenance

#### 5.1 Update Component Documentation

Add comprehensive JSDoc comments to the component:

```tsx
/**
 * CancellationForm - Secure form for insurance policy cancellation requests
 * 
 * Security Features:
 * - CSRF protection via token validation
 * - XSS sanitization on server-side
 * - Bot protection via honeypot field
 * - Comprehensive input validation
 * - Accessibility compliant with WCAG 2.1
 * 
 * @returns React component for cancellation form
 */
```

#### 5.2 Environment Variables

Ensure required environment variables are documented:

```env
# Required for email functionality
BREVO_API_KEY=your-brevo-api-key
NOTIFICATION_EMAIL=notifications@yourcompany.com

# Email sender configuration
BREVO_SENDER_EMAIL=noreply@yourcompany.com
BREVO_SENDER_NAME=Your Company Name
```

## Implementation Timeline

### Week 1: Backend Security
- [ ] Day 1-2: Implement CSRF token endpoint
- [ ] Day 3-4: Update cancellation API endpoint with all security features
- [ ] Day 5: Create and run security tests

### Week 2: Frontend Updates
- [ ] Day 1-2: Add CSRF hook and update form component
- [ ] Day 3: Add autocomplete attributes and honeypot field
- [ ] Day 4-5: Comprehensive testing and bug fixes

### Week 3: Testing and Polish
- [ ] Day 1-2: Security testing and penetration testing
- [ ] Day 3-4: Accessibility testing and improvements
- [ ] Day 5: Documentation and code review

## Risk Assessment

### High Priority Risks
1. **CSRF Attacks** - Mitigated by token implementation
2. **XSS Attacks** - Mitigated by server-side sanitization
3. **Bot Spam** - Mitigated by honeypot field
4. **Data Injection** - Mitigated by Zod validation and sanitization

### Medium Priority Risks
1. **Rate Limiting** - Consider implementing for future enhancement
2. **CAPTCHA** - May be needed if bot attacks increase
3. **Session Management** - Current implementation uses cookies securely

## Success Criteria

- [ ] All audit failures are resolved
- [ ] Security tests pass 100%
- [ ] Form maintains existing functionality
- [ ] Accessibility compliance maintained
- [ ] Performance impact is minimal
- [ ] Code follows existing project patterns
- [ ] Documentation is complete and accurate

## Post-Implementation Monitoring

1. **Security Logs** - Monitor for blocked CSRF attempts
2. **Bot Activity** - Track honeypot field submissions
3. **Error Rates** - Monitor form submission success rates
4. **Performance** - Track form load and submission times

This comprehensive plan addresses all identified issues while maintaining the existing user experience and following established security best practices.