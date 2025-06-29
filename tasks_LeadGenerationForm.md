# Implementation Plan for LeadForm.tsx Audit

This document outlines the tasks required to address the findings from the `form_audit_LeadGenerationForm.md` report. The tasks are categorized based on the audit sections.

---

### **Category 1: Usability and User Experience (UX)**

#### **Task 1.1: Implement Autocomplete Functionality**

*   **Status:** Done
*   **File to Modify:** `src/components/forms/LeadForm.tsx`
*   **Details:**
    *   Add the `autocomplete="name"` attribute to the `Input` component for the `nombre` field.
    *   Add the `autocomplete="email"` attribute to the `Input` component for the `email` field.
    *   For the `telefono` field, pass `autoComplete="tel"` to the underlying input of the `PhoneInput` component.

#### **Task 1.2: Add `required` Attribute for Native HTML5 Validation**

*   **Status:** Done
*   **File to Modify:** `src/components/forms/LeadForm.tsx`
*   **Details:**
    *   Propagate the `required` attribute to the underlying HTML elements for all mandatory fields. This enhances accessibility and provides immediate browser-native validation cues.
    *   Modify the `Input` for `nombre` and `email` to include the `required` attribute.
    *   Modify the `PhoneInput` for `telefono` to include the `required` attribute.
    *   Modify the `SelectTrigger` for `tipoSeguro` to include the `required` attribute.
    *   Modify the `Checkbox` for `terminos` to include the `required` attribute.

---

### **Category 2: Data Validation and Functionality (Server-Side)**

#### **Task 2.1: Implement Robust Server-Side Validation**

*   **Status:** Done
*   **File to Modify:** `api/send-email.ts`
*   **Details:**
    *   Implement server-side validation using Zod to mirror the client-side schema.
    *   Validate the presence, type, and format of `nombre`, `email`, `telefono`, `tipoSeguro`, and `terminos`.
    *   If validation fails, return a `400 Bad Request` status with a clear error message.

#### **Task 2.2: Implement Data Trimming on Server**

*   **Status:** Done
*   **File to Modify:** `api/send-email.ts`
*   **Details:**
    *   Before validation, trim leading/trailing whitespace from all user-submitted string inputs (`nombre`, `email`, `mensaje`).
    *   This can be achieved by adding `.trim()` to the Zod schema definitions on the server.

---

### **Category 3: Security (Safety Best Practices)**

#### **Task 3.1: Implement CSRF Protection**

*   **Status:** Done
*   **Files to Modify:** `api/send-email.ts`, `api/csrf-token.ts`, `src/components/forms/LeadForm.tsx`.
*   **Details:**
    1.  **Server-Side:** Use a library like `csrf-protect` or a custom implementation to generate and verify CSRF tokens for the user session.
    2.  **Client-Side:** Fetch the CSRF token and include it as a custom header (e.g., `X-CSRF-Token`) in the `fetch` request when submitting the form.

#### **Task 3.2: Implement Protection Against Cross-Site Scripting (XSS)**

*   **Status:** Done
*   **File to Modify:** `api/send-email.ts`
*   **Details:**
    *   Sanitize all user-provided string inputs (`nombre`, `mensaje`) on the server before they are included in the email body or stored.
    *   Use a library like `dompurify` (if generating HTML emails) or a simple HTML-escaping function to convert special characters to their entity equivalents (e.g., `<` to `&lt;`).

#### **Task 3.3: Implement Bot Protection (Honeypot Field)**

*   **Status:** Done
*   **Files to Modify:** `src/components/forms/LeadForm.tsx`, `api/send-email.ts`.
*   **Details:**
    1.  **Client-Side:** Add a visually hidden (e.g., with `className="sr-only"`) honeypot field to the form with `autocomplete="off"`.
    2.  **Server-Side:** In the API endpoint, check if the honeypot field has a value. If it does, treat the submission as spam and return a generic success response without processing the request.

#### **Task 3.4: Ensure Production Environment Uses HTTPS**

*   **Status:** To Do (Configuration Required)
*   **Area:** Deployment Configuration (e.g., Vercel, Netlify)
*   **Details:**
    *   This is a configuration task, not a code change. All necessary code has been implemented to support this.
    *   Verify that the production hosting environment is configured to enforce HTTPS across the entire application to protect data in transit.
