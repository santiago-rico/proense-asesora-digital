# MultiStepForm Security & Usability Implementation Plan

## Overview
This document provides a comprehensive implementation plan to address all issues identified in the MultiStepForm audit. The plan follows the security patterns outlined in the FORM_SECURITY_IMPLEMENTATION_GUIDE.md and addresses each failing criterion systematically.

## Audit Summary
### Failing Areas:
1. **Usability**: Missing autocomplete attributes
2. **Security**: No CSRF protection
3. **Security**: No bot protection (honeypot/CAPTCHA)
4. **Data Validation**: No client-side data trimming
5. **Unknown Status**: Server-side validation, XSS protection, HTTPS enforcement

## Implementation Tasks

### Phase 1: Security Infrastructure Setup

#### Task 1.1: Install Required Security Dependencies
```bash
npm install csrf cookie dompurify jsdom
npm install --save-dev @types/cookie @types/dompurify @types/jsdom
```

#### Task 1.2: Create CSRF Token Endpoint
**File**: `/api/csrf-token.ts`
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serialize } from 'cookie';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { default: Tokens } = await import('csrf') as any;
    const tokens = new Tokens();
    
    const secret = tokens.secretSync();
    const token = tokens.create(secret);
    
    const cookie = serialize('_csrf_secret', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    
    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error in csrf-token handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

#### Task 1.3: Update Environment Variables
Verify `.env` contains:
```env
BREVO_API_KEY=your-brevo-api-key
NOTIFICATION_EMAIL=notification@example.com
BREVO_SENDER_EMAIL=sender@example.com
BREVO_SENDER_NAME=ProEnse Asesora Digital
```

### Phase 2: Backend Security Implementation

#### Task 2.1: Enhance `/api/send-insurance-application-email.ts`

**Complete Security Enhancement Implementation**:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { JSDOM } from 'jsdom';
import formidable from 'formidable';

// Backend validation schema with trimming
const backendSchema = z.object({
  // Personal Information
  nombre: z.string().trim().min(2).max(100),
  apellido: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  telefono: z.string().trim().regex(/^\+?[0-9]{10,15}$/),
  tipoIdentificacion: z.enum(['cedula', 'pasaporte', 'nit']),
  numeroIdentificacion: z.string().trim().min(5).max(20),
  fechaNacimiento: z.string().trim(),
  genero: z.enum(['masculino', 'femenino', 'otro']),
  
  // Insurance Information
  tipoSeguro: z.string().trim().min(1),
  
  // Conditional fields based on insurance type
  // ... (copy all conditional fields from frontend schema)
  
  // Files
  archivos: z.array(z.any()).optional(),
  
  // Declaration
  declaraSalud: z.enum(['true', 'false']),
  autorizaDatos: z.enum(['true', 'false']),
  declaraVeracidad: z.enum(['true', 'false']),
  
  // Honeypot
  website: z.string().optional(),
});

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
    
    // Verify CSRF token
    const cookies = parse(req.headers.cookie || '');
    const secret = cookies._csrf_secret;
    const token = req.headers['x-csrf-token'] as string;
    
    if (!secret || !token || !tokens.verify(secret, token)) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
    
    // Parse multipart form data
    const form = formidable({
      multiples: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });
    
    const [fields, files] = await form.parse(req);
    
    // Check honeypot field
    if (fields.website && fields.website[0] && fields.website[0].length > 0) {
      return res.status(200).json({ 
        message: 'Solicitud enviada con éxito.',
        data: { messageId: 'spam-filtered' }
      });
    }
    
    // Prepare data for validation
    const formData: any = {};
    for (const [key, value] of Object.entries(fields)) {
      formData[key] = Array.isArray(value) ? value[0] : value;
    }
    
    // Validate with backend schema
    const validationResult = backendSchema.safeParse(formData);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos inválidos.',
        errors: validationResult.error.flatten().fieldErrors,
      });
    }
    
    const data = validationResult.data;
    
    // Sanitize all text fields
    const sanitizedData = {
      ...data,
      nombre: DOMPurifyInstance.sanitize(data.nombre),
      apellido: DOMPurifyInstance.sanitize(data.apellido),
      numeroIdentificacion: DOMPurifyInstance.sanitize(data.numeroIdentificacion),
      // Sanitize all other text fields...
    };
    
    // Validate file uploads
    const uploadedFiles = files.archivos || [];
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    for (const file of uploadedFiles) {
      if (!allowedTypes.includes(file.mimetype || '')) {
        return res.status(400).json({ 
          message: 'Tipo de archivo no permitido' 
        });
      }
    }
    
    // Send email with sanitized data
    // ... (existing email sending logic)
    
    res.status(200).json({
      message: 'Solicitud enviada con éxito.',
      data: { messageId: 'success' },
    });
    
  } catch (error) {
    console.error('Error in send-insurance-application-email:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud. Por favor, intenta de nuevo.' 
    });
  }
}
```

### Phase 3: Frontend Implementation

#### Task 3.1: Update MultiStepForm Component

**Add to MultiStepForm.tsx**:

```typescript
// Add to imports
import { useEffect, useState } from 'react';

// Add to component
const [csrfToken, setCsrfToken] = useState('');

// Add useEffect for CSRF token
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
}, []);

// Update form schema to include honeypot
const formSchema = z.object({
  // ... existing fields ...
  website: z.string().optional(), // Honeypot field
});

// Update onSubmit function
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  if (!csrfToken) {
    toast({
      title: "Error",
      description: "Por favor, recarga la página e intenta nuevamente.",
      variant: "destructive",
    });
    return;
  }
  
  try {
    setIsSubmitting(true);
    const formData = buildFormData(values);
    
    const response = await fetch("/api/send-insurance-application-email", {
      method: "POST",
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
    });
    
    // ... rest of submission logic
  } catch (error) {
    // ... error handling
  }
};

// Add honeypot field to form (after all other fields)
<input
  type="text"
  {...form.register('website')}
  style={{ display: 'none' }}
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
/>

// Update submit button to be disabled without CSRF token
<Button 
  type="submit" 
  disabled={isSubmitting || !csrfToken}
  className="w-full"
>
  {isSubmitting ? "Enviando..." : "Firmar y Enviar Solicitud"}
</Button>
```

#### Task 3.2: Update Step1_BasicInfo.tsx

**Add autocomplete attributes to all fields**:

```typescript
// nombre field
<Input
  {...field}
  autoComplete="given-name"
  required={true}
  aria-required="true"
  placeholder="Ingresa tu nombre"
/>

// apellido field
<Input
  {...field}
  autoComplete="family-name"
  required={true}
  aria-required="true"
  placeholder="Ingresa tu apellido"
/>

// email field
<Input
  {...field}
  type="email"
  autoComplete="email"
  required={true}
  aria-required="true"
  placeholder="ejemplo@correo.com"
/>

// telefono field
<PhoneInput
  {...field}
  autoComplete="tel"
  required={true}
  aria-required="true"
  international
  defaultCountry="CO"
/>

// numeroIdentificacion field
<Input
  {...field}
  autoComplete="off"
  required={true}
  aria-required="true"
  placeholder="Número de identificación"
/>

// fechaNacimiento field
<Input
  {...field}
  type="date"
  autoComplete="bday"
  required={true}
  aria-required="true"
/>
```

#### Task 3.3: Update Step3_ConditionalFields.tsx

**Add autocomplete to address fields**:

```typescript
// direccion field
<Input
  {...field}
  autoComplete="street-address"
  required={true}
  aria-required="true"
  placeholder="Dirección completa"
/>

// ciudad field
<Input
  {...field}
  autoComplete="address-level2"
  required={true}
  aria-required="true"
  placeholder="Ciudad"
/>

// departamento field
<Input
  {...field}
  autoComplete="address-level1"
  required={true}
  aria-required="true"
  placeholder="Departamento"
/>

// codigoPostal field
<Input
  {...field}
  autoComplete="postal-code"
  placeholder="Código postal"
/>
```

### Phase 4: Data Validation Enhancements

#### Task 4.1: Update Frontend Schema with Transforms

**In MultiStepForm.tsx, update schema**:

```typescript
const formSchema = z.object({
  // Personal Information with trimming
  nombre: z.string()
    .transform(str => str.trim())
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string()
    .transform(str => str.trim())
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string()
    .transform(str => str.trim().toLowerCase())
    .email('Correo electrónico inválido'),
  telefono: z.string()
    .transform(str => str.trim())
    .regex(/^\+?[0-9]{10,15}$/, 'Número de teléfono inválido'),
  numeroIdentificacion: z.string()
    .transform(str => str.trim())
    .min(5, 'Número de identificación inválido'),
  
  // Apply similar transforms to all string fields...
  
  // Honeypot
  website: z.string().optional(),
});
```

### Phase 5: Testing Implementation

#### Task 5.1: Create Test Script

**File**: `test-multistep-form-security.js`

```javascript
async function testMultiStepFormSecurity() {
  const baseUrl = 'http://localhost:8080';
  
  try {
    // Test 1: CSRF Token Generation
    console.log('1. Testing CSRF token generation...');
    const tokenResponse = await fetch(`${baseUrl}/api/csrf-token`, {
      credentials: 'include'
    });
    
    const { token } = await tokenResponse.json();
    const setCookie = tokenResponse.headers.get('set-cookie');
    console.log('✓ CSRF token received:', token);
    
    // Test 2: Valid Submission with XSS Attempts
    console.log('\n2. Testing form submission with XSS attempts...');
    const formData = new FormData();
    formData.append('nombre', 'Test <script>alert("XSS")</script>');
    formData.append('apellido', 'User');
    formData.append('email', 'test@example.com');
    formData.append('telefono', '+573001234567');
    formData.append('tipoIdentificacion', 'cedula');
    formData.append('numeroIdentificacion', '12345678');
    formData.append('fechaNacimiento', '1990-01-01');
    formData.append('genero', 'masculino');
    formData.append('tipoSeguro', 'vida');
    formData.append('declaraSalud', 'true');
    formData.append('autorizaDatos', 'true');
    formData.append('declaraVeracidad', 'true');
    formData.append('website', ''); // Honeypot empty
    
    const submitResponse = await fetch(`${baseUrl}/api/send-insurance-application-email`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: formData,
      credentials: 'include'
    });
    
    console.log(`✓ Response status: ${submitResponse.status}`);
    const result = await submitResponse.json();
    console.log('✓ Response:', result);
    
    // Test 3: Honeypot Protection
    console.log('\n3. Testing honeypot protection...');
    formData.set('website', 'spam.com');
    
    const honeypotResponse = await fetch(`${baseUrl}/api/send-insurance-application-email`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: formData,
      credentials: 'include'
    });
    
    console.log(`✓ Honeypot test: ${honeypotResponse.status} (should be 200 with spam-filtered)`);
    const honeypotResult = await honeypotResponse.json();
    console.log('✓ Honeypot result:', honeypotResult);
    
    // Test 4: CSRF Protection
    console.log('\n4. Testing CSRF protection...');
    formData.set('website', ''); // Reset honeypot
    
    const csrfTestResponse = await fetch(`${baseUrl}/api/send-insurance-application-email`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': 'invalid-token',
        'Cookie': setCookie || ''
      },
      body: formData,
      credentials: 'include'
    });
    
    console.log(`✓ CSRF test: ${csrfTestResponse.status} (should be 403)`);
    
    // Test 5: File Upload Validation
    console.log('\n5. Testing file upload validation...');
    const fileData = new FormData();
    // Copy all fields from formData
    for (let [key, value] of formData.entries()) {
      fileData.append(key, value);
    }
    
    // Add invalid file type
    const blob = new Blob(['test'], { type: 'text/plain' });
    fileData.append('archivos', blob, 'test.txt');
    
    const fileResponse = await fetch(`${baseUrl}/api/send-insurance-application-email`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: fileData,
      credentials: 'include'
    });
    
    console.log(`✓ File validation test: ${fileResponse.status} (should be 400)`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMultiStepFormSecurity();
```

### Phase 6: Production Security

#### Task 6.1: Update vercel.json

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
      ]
    }
  ]
}
```

## Implementation Checklist

### Security Tasks
- [ ] Install security dependencies (csrf, cookie, dompurify, jsdom)
- [ ] Create CSRF token endpoint
- [ ] Add CSRF verification to API endpoint
- [ ] Implement XSS sanitization with DOMPurify
- [ ] Add honeypot field validation
- [ ] Implement server-side data trimming
- [ ] Add comprehensive server-side validation
- [ ] Validate file uploads (type and size)

### Frontend Tasks
- [ ] Add CSRF token fetching on form mount
- [ ] Include CSRF token in form submission
- [ ] Add honeypot field (hidden)
- [ ] Add autocomplete attributes to all fields
- [ ] Add required attributes to mandatory fields
- [ ] Implement client-side data trimming
- [ ] Disable submit button without CSRF token

### Testing Tasks
- [ ] Create comprehensive test script
- [ ] Test CSRF protection
- [ ] Test XSS sanitization
- [ ] Test honeypot functionality
- [ ] Test file upload validation
- [ ] Test data trimming
- [ ] Manual accessibility testing

### Deployment Tasks
- [ ] Verify HTTPS in production
- [ ] Add security headers
- [ ] Test on staging environment
- [ ] Monitor for spam submissions
- [ ] Document rollback procedure

## Success Metrics

1. **Security**: All forms pass security tests (CSRF, XSS, bot protection)
2. **Usability**: All fields have appropriate autocomplete attributes
3. **Validation**: Data is properly trimmed and validated on both client and server
4. **Accessibility**: Forms maintain WCAG compliance
5. **Performance**: No noticeable impact on form submission time

## Timeline

- **Week 1**: Security infrastructure and backend implementation
- **Week 2**: Frontend updates and testing
- **Week 3**: Production deployment and monitoring

*Last updated: 28-Jun-2025*
