# Form Security Implementation Guide

## Overview
This guide provides comprehensive technical implementation details for adding CSRF protection, XSS sanitization, and other security features to forms in a Vercel/Next.js ES Module environment.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Required Dependencies](#required-dependencies)
3. [API Endpoint Implementation](#api-endpoint-implementation)
4. [Frontend Form Implementation](#frontend-form-implementation)
5. [Testing Security Features](#testing-security-features)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [Security Checklist](#security-checklist)

## Prerequisites

### Environment Configuration
- Project must be configured as ES Module (`"type": "module"` in package.json)
- Vercel/Next.js serverless environment
- TypeScript configuration should NOT include `esModuleInterop` or `allowSyntheticDefaultImports`

### Required Environment Variables
```env
# Email service configuration
BREVO_API_KEY=your-brevo-api-key
LEAD_NOTIFICATION_EMAIL=notification@example.com
BREVO_SENDER_EMAIL=sender@example.com
BREVO_SENDER_NAME=Your Company Name

# Note: CSRF_SECRET is NOT required with the current implementation
# The csrf library generates dynamic secrets per session automatically
```

## Required Dependencies

Install these packages for security implementation:

```bash
# Core security packages
npm install csrf cookie dompurify jsdom

# TypeScript types
npm install --save-dev @types/cookie @types/dompurify

# Email service (if using Brevo)
npm install sib-api-v3-sdk

# Validation
npm install zod
```

## API Endpoint Implementation

### 1. CSRF Token Endpoint (`/api/csrf-token.ts`)

```typescript
import type { VercelRequest, VercelResponse } from './_utils/vercel-types.js';
import { serialize } from 'cookie';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Dynamic import for the csrf library
    const { default: Tokens } = await import('csrf') as any;
    const tokens = new Tokens();
    
    // Generate a secret for this session
    const secret = tokens.secretSync();
    const token = tokens.create(secret);
    
    // Store the secret in an httpOnly cookie
    const cookie = serialize('_csrf_secret', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error in csrf-token handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 2. Form Submission Endpoint (`/api/send-email.ts`)

```typescript
import type { VercelRequest, VercelResponse } from './_utils/vercel-types.js';
import { z } from 'zod';
import { JSDOM } from 'jsdom';

// Define your form schema
const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  telefono: z.string().regex(/^\+?[0-9]{10,15}$/, 'Número de teléfono inválido'),
  tipoSeguro: z.string().min(1, 'Debe seleccionar un tipo de seguro'),
  mensaje: z.string().optional(),
  website: z.string().optional(), // Honeypot field
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Dynamic imports for CommonJS modules
    const dompurifyModule = await import('dompurify');
    const DOMPurify = (dompurifyModule as any).default || dompurifyModule;
    const { parse } = await import('cookie');
    const { default: Tokens } = await import('csrf') as any;
    const tokens = new Tokens();
    
    // Initialize DOMPurify with JSDOM
    const window = new JSDOM('').window;
    const DOMPurifyInstance = DOMPurify(window);
    
    // Verify CSRF token
    const cookies = parse(req.headers.cookie || '');
    const secret = cookies._csrf_secret;
    const token = req.headers['x-csrf-token'] as string;
    
    if (!secret || !token || !tokens.verify(secret, token)) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    // Parse and validate request body
    const validationResult = formSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos inválidos.',
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const data = validationResult.data;

    // Check honeypot field
    if (data.website && data.website.length > 0) {
      // Silently accept but don't process spam submissions
      return res.status(200).json({ 
        message: 'Solicitud enviada con éxito.',
        data: { messageId: 'spam-filtered' }
      });
    }

    // Sanitize user inputs
    const sanitizedData = {
      ...data,
      nombre: DOMPurifyInstance.sanitize(data.nombre),
      mensaje: data.mensaje ? DOMPurifyInstance.sanitize(data.mensaje) : '',
    };

    // Send email (example with Brevo)
    const SibApiV3Sdk = await import('sib-api-v3-sdk');
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = `Nueva solicitud de ${sanitizedData.tipoSeguro}`;
    sendSmtpEmail.htmlContent = `
      <h2>Nueva solicitud de información</h2>
      <p><strong>Nombre:</strong> ${sanitizedData.nombre}</p>
      <p><strong>Email:</strong> ${sanitizedData.email}</p>
      <p><strong>Teléfono:</strong> ${sanitizedData.telefono}</p>
      <p><strong>Tipo de Seguro:</strong> ${sanitizedData.tipoSeguro}</p>
      ${sanitizedData.mensaje ? `<p><strong>Mensaje:</strong> ${sanitizedData.mensaje}</p>` : ''}
    `;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL,
    };
    sendSmtpEmail.to = [{
      email: process.env.LEAD_NOTIFICATION_EMAIL,
      name: 'Proense Notifications',
    }];

    const emailResponse = await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.status(200).json({
      message: 'Solicitud enviada con éxito.',
      data: { messageId: emailResponse.messageId },
    });

  } catch (error) {
    console.error('Error in send-email handler:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud. Por favor, intenta de nuevo.' 
    });
  }
}
```

## Frontend Form Implementation

### 1. Form Component Structure

```tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';

// Define form schema (should match backend)
const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  telefono: z.string().regex(/^\+?[0-9]{10,15}$/, 'Número de teléfono inválido'),
  tipoSeguro: z.string().min(1, 'Debe seleccionar un tipo de seguro'),
  mensaje: z.string().optional(),
  terminos: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
  website: z.string().optional(), // Honeypot
});

type FormData = z.infer<typeof formSchema>;

export const SecureForm: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        setCsrfToken(data.token);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
        toast({
          title: "Error de Seguridad",
          description: "No se pudo verificar la seguridad del formulario.",
          variant: "destructive",
        });
      }
    };

    fetchCsrfToken();
  }, [toast]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      tipoSeguro: "",
      mensaje: "",
      terminos: false,
      website: "", // Honeypot
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        tipoSeguro: data.tipoSeguro,
        mensaje: data.mensaje,
        website: data.website, // Include honeypot
      };

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al enviar la solicitud.');
      }

      // Success handling
      toast({
        title: "¡Éxito!",
        description: "Tu solicitud ha sido enviada correctamente.",
      });
      
      form.reset();

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Regular form fields */}
      
      {/* Honeypot field - hidden from users */}
      <input
        type="text"
        {...form.register('website')}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />
      
      {/* Submit button */}
      <button type="submit" disabled={isLoading || !csrfToken}>
        {isLoading ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
};
```

### 2. Important Frontend Considerations

1. **CSRF Token Management**:
   - Fetch token on component mount
   - Include token in request headers
   - Handle token fetch errors gracefully

2. **Honeypot Field**:
   - Must be completely hidden (display: none)
   - Set tabIndex to -1
   - Turn off autocomplete
   - Don't label it or make it required

3. **Form Validation**:
   - Use same validation schema as backend
   - Implement client-side validation for better UX
   - Always validate on backend regardless

## Testing Security Features

### Test Script (`test-form-submission.js`)

```javascript
async function testFormSubmission() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Step 1: Get CSRF token
    console.log('1. Fetching CSRF token...');
    const tokenResponse = await fetch(`${baseUrl}/api/csrf-token`, {
      credentials: 'include'
    });
    
    const { token } = await tokenResponse.json();
    const setCookie = tokenResponse.headers.get('set-cookie');
    console.log('✓ CSRF token received:', token);
    
    // Step 2: Test valid submission with XSS attempts
    console.log('\n2. Testing form submission with XSS attempts...');
    const formData = {
      nombre: 'Test <script>alert("XSS")</script>',
      email: 'test@example.com',
      telefono: '+573001234567',
      tipoSeguro: 'vida',
      mensaje: 'Message with <img src=x onerror=alert("XSS")>',
      website: ''
    };
    
    const submitResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: JSON.stringify(formData),
      credentials: 'include'
    });
    
    console.log(`✓ Response status: ${submitResponse.status}`);
    
    // Step 3: Test honeypot
    console.log('\n3. Testing honeypot protection...');
    const honeypotData = { ...formData, website: 'spam.com' };
    
    const honeypotResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: JSON.stringify(honeypotData),
      credentials: 'include'
    });
    
    console.log(`✓ Honeypot test: ${honeypotResponse.status}`);
    
    // Step 4: Test CSRF protection
    console.log('\n4. Testing CSRF protection...');
    const csrfTestResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'invalid-token',
        'Cookie': setCookie || ''
      },
      body: JSON.stringify(formData),
      credentials: 'include'
    });
    
    console.log(`✓ CSRF test: ${csrfTestResponse.status} (should be 403)`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFormSubmission();
```

## Common Issues and Solutions

### 1. Module Import Errors

**Problem**: `require is not defined in ES module scope`
```javascript
// ❌ Wrong
const csrf = require('csrf');

// ✅ Correct
const { default: Tokens } = await import('csrf') as any;
```

**Problem**: `X is not a constructor`
```javascript
// ❌ Wrong
const Tokens = await import('csrf');

// ✅ Correct
const { default: Tokens } = await import('csrf') as any;
```

### 2. DOMPurify Import Issues

**Problem**: TypeScript type errors with DOMPurify
```javascript
// ✅ Solution
const dompurifyModule = await import('dompurify');
const DOMPurify = (dompurifyModule as any).default || dompurifyModule;
```

### 3. CSRF Token Not Working

**Common causes**:
- Cookie not being set (check sameSite and secure settings)
- Token not included in request headers
- Cookie parsing issues

**Debug checklist**:
```javascript
// Check if cookie is set
console.log('Set-Cookie header:', response.headers.get('set-cookie'));

// Check if token is in headers
console.log('CSRF Token in request:', req.headers['x-csrf-token']);

// Check parsed cookies
const cookies = parse(req.headers.cookie || '');
console.log('Parsed cookies:', cookies);
```

### 4. TypeScript Configuration Issues

**Avoid these settings** in `tsconfig.json`:
```json
{
  "compilerOptions": {
    // ❌ Don't use these with ES modules
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## Security Checklist

### Backend Security
- [ ] CSRF token generation and verification implemented
- [ ] XSS sanitization for all user inputs
- [ ] Honeypot field for bot protection
- [ ] Server-side validation with Zod or similar
- [ ] Rate limiting (if applicable)
- [ ] Secure cookie settings (httpOnly, secure, sameSite)
- [ ] Environment variables for sensitive data
- [ ] Error messages don't leak sensitive information

### Frontend Security
- [ ] CSRF token fetched and included in requests
- [ ] Form validation matches backend
- [ ] Honeypot field properly hidden
- [ ] No sensitive data in client-side code
- [ ] Proper error handling without exposing details
- [ ] HTTPS enforced in production

### Testing
- [ ] CSRF protection tested (invalid tokens rejected)
- [ ] XSS attempts are sanitized
- [ ] Honeypot catches bot submissions
- [ ] Form validation works correctly
- [ ] Error scenarios handled gracefully

## Additional Recommendations

1. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
2. **CAPTCHA**: For high-risk forms, add CAPTCHA verification
3. **Input Length Limits**: Set maximum lengths for text inputs
4. **File Upload Security**: If handling files, validate type and size
5. **Monitoring**: Log security events for analysis
6. **Regular Updates**: Keep security packages updated

## Migration Checklist for Existing Forms

When migrating existing forms to include security features:

1. **Audit Current Implementation**
   - Identify all form endpoints
   - Check current validation logic
   - Note any existing security measures

2. **Install Dependencies**
   ```bash
   npm install csrf cookie dompurify jsdom
   npm install --save-dev @types/cookie @types/dompurify
   ```

3. **Create CSRF Token Endpoint**
   - Copy the template from this guide
   - Test token generation

4. **Update Form Submission Endpoint**
   - Add CSRF verification
   - Add input sanitization
   - Add honeypot check
   - Maintain existing business logic

5. **Update Frontend Forms**
   - Add CSRF token fetching
   - Include token in submissions
   - Add honeypot field
   - Update error handling

6. **Test Thoroughly**
   - Run security tests
   - Test form functionality
   - Verify email delivery

7. **Deploy and Monitor**
   - Check production logs
   - Monitor for errors
   - Verify security features work

## Conclusion

This guide provides a comprehensive approach to implementing security features in forms. Always prioritize security while maintaining good user experience. Regular security audits and updates are essential for maintaining a secure application.

For questions or issues not covered in this guide, consult the official documentation of the security packages used or seek expert security advice.
