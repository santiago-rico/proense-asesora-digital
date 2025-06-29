import { test, expect } from '@playwright/test';
import { InsuranceFormPage } from '../../fixtures/page-objects/insurance-form';
import { createCSRFHelper } from '../../utils/csrf-helper';
import { createFileUploadHelper } from '../../utils/file-upload-helper';
import { createTestHelpers } from '../../utils/test-helpers';
import { testData } from '../../fixtures/test-data';

test.describe('Insurance Application Flow', () => {
  let insuranceFormPage: InsuranceFormPage;
  let csrfHelper: any;
  let fileUploadHelper: any;
  let testHelpers: any;

  test.beforeEach(async ({ page }) => {
    insuranceFormPage = new InsuranceFormPage(page);
    csrfHelper = createCSRFHelper(page);
    fileUploadHelper = createFileUploadHelper(page);
    testHelpers = createTestHelpers(page);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup any uploaded test files
    fileUploadHelper.cleanupAllTestFiles();
  });

  test.describe('Complete Application Flow', () => {
    test('should complete auto insurance application successfully', async () => {
      // Navigate to insurance form
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Verify page title and heading
      await expect(insuranceFormPage.page).toHaveTitle(/Emisión.*Seguros/);
      await insuranceFormPage.expectElementToBeVisible('h1');
      
      // Step 1: Fill basic information
      await insuranceFormPage.fillStep1BasicInfo();
      await insuranceFormPage.expectNoValidationErrors();
      await insuranceFormPage.proceedToStep2();
      
      // Step 2: Select auto insurance
      await insuranceFormPage.selectInsuranceTypes(['auto']);
      await insuranceFormPage.proceedToStep3();
      
      // Step 3: Fill auto insurance details
      await insuranceFormPage.fillAutoInsuranceDetails();
      await insuranceFormPage.proceedToStep4();
      
      // Step 4: Accept terms and upload documents
      await insuranceFormPage.acceptTermsAndPrivacy();
      
      // Create and upload test documents
      const testPdf = fileUploadHelper.createTestPDF('cedula.pdf', 500);
      const testImage = fileUploadHelper.createTestImage('vehiculo.jpg', 300);
      
      await insuranceFormPage.uploadDocuments([testPdf, testImage]);
      await insuranceFormPage.proceedToStep5();
      
      // Step 5: Review and submit
      await insuranceFormPage.reviewAndSubmit();
      
      // Verify successful submission
      await insuranceFormPage.expectSuccessfulSubmission();
      
      // Verify application number is displayed
      await expect(insuranceFormPage.applicationNumberDisplay).toContainText(/\d+/);
      
      // Take screenshot of success page
      await testHelpers.takeTimestampedScreenshot('insurance-application-success');
    });

    test('should complete health insurance application successfully', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Complete basic steps
      await insuranceFormPage.fillStep1BasicInfo();
      await insuranceFormPage.proceedToStep2();
      
      // Select health insurance
      await insuranceFormPage.selectInsuranceTypes(['salud']);
      await insuranceFormPage.proceedToStep3();
      
      // Fill health insurance details
      await insuranceFormPage.fillHealthInsuranceDetails();
      await insuranceFormPage.proceedToStep4();
      
      // Complete form
      await insuranceFormPage.acceptTermsAndPrivacy();
      
      const testPdf = fileUploadHelper.createTestPDF('examen-medico.pdf', 800);
      await insuranceFormPage.uploadDocuments([testPdf]);
      
      await insuranceFormPage.proceedToStep5();
      await insuranceFormPage.reviewAndSubmit();
      await insuranceFormPage.expectSuccessfulSubmission();
    });

    test('should complete multi-insurance application successfully', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Complete basic steps
      await insuranceFormPage.fillStep1BasicInfo();
      await insuranceFormPage.proceedToStep2();
      
      // Select multiple insurance types
      await insuranceFormPage.selectInsuranceTypes(['auto', 'vida']);
      await insuranceFormPage.proceedToStep3();
      
      // Fill details for both insurance types
      await insuranceFormPage.fillAutoInsuranceDetails();
      await insuranceFormPage.fillLifeInsuranceDetails();
      await insuranceFormPage.proceedToStep4();
      
      // Complete form
      await insuranceFormPage.acceptTermsAndPrivacy();
      
      const testPdf1 = fileUploadHelper.createTestPDF('cedula.pdf', 500);
      const testPdf2 = fileUploadHelper.createTestPDF('tarjeta-propiedad.pdf', 600);
      const testImage = fileUploadHelper.createTestImage('vehiculo.jpg', 400);
      
      await insuranceFormPage.uploadDocuments([testPdf1, testPdf2, testImage]);
      
      await insuranceFormPage.proceedToStep5();
      await insuranceFormPage.reviewAndSubmit();
      await insuranceFormPage.expectSuccessfulSubmission();
    });
  });

  test.describe('Form Navigation', () => {
    test('should navigate back and forth between steps', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Go through all steps
      await insuranceFormPage.fillStep1BasicInfo();
      await insuranceFormPage.proceedToStep2();
      await insuranceFormPage.selectInsuranceTypes(['auto']);
      await insuranceFormPage.proceedToStep3();
      await insuranceFormPage.fillAutoInsuranceDetails();
      
      // Navigate back to previous steps
      await insuranceFormPage.goBackToStep(2);
      await insuranceFormPage.expectStepToBeActive(2);
      
      await insuranceFormPage.goBackToStep(1);
      await insuranceFormPage.expectStepToBeActive(1);
      
      // Verify data persistence
      await expect(insuranceFormPage.fullNameInput).toHaveValue(testData.insuranceApplication.basicInfo.fullName);
      
      // Go forward again
      await insuranceFormPage.proceedToStep2();
      await insuranceFormPage.proceedToStep3();
      
      // Verify auto insurance data is still there
      await expect(insuranceFormPage.vehicleBrandInput).toHaveValue(testData.insuranceApplication.autoInsurance.vehicleBrand);
    });

    test('should show correct progress bar state', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Check initial progress
      await expect(insuranceFormPage.progressBar).toBeVisible();
      
      // Progress through steps and verify progress bar updates
      await insuranceFormPage.fillStep1BasicInfo();
      await insuranceFormPage.proceedToStep2();
      await expect(insuranceFormPage.progressBar).toContainText('2');
      
      await insuranceFormPage.selectInsuranceTypes(['auto']);
      await insuranceFormPage.proceedToStep3();
      await expect(insuranceFormPage.progressBar).toContainText('3');
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation errors for empty required fields', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Try to proceed without filling required fields
      await insuranceFormPage.proceedToStep2();
      
      // Verify validation errors are shown
      await insuranceFormPage.expectValidationError('fullName');
      await insuranceFormPage.expectValidationError('email');
      await insuranceFormPage.expectValidationError('phone');
      await insuranceFormPage.expectValidationError('identificationNumber');
    });

    test('should validate email format', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Enter invalid email
      await insuranceFormPage.emailInput.fill('invalid-email');
      await insuranceFormPage.emailInput.blur();
      
      // Verify email validation error
      await insuranceFormPage.expectValidationError('email');
      await expect(insuranceFormPage.page.locator('[data-testid="email-error"]')).toContainText('válido');
    });

    test('should validate phone number format', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Enter invalid phone
      await insuranceFormPage.phoneInput.fill('123');
      await insuranceFormPage.phoneInput.blur();
      
      // Verify phone validation error
      await insuranceFormPage.expectValidationError('phone');
    });

    test('should validate date fields', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Enter invalid birth date (future date)
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      await insuranceFormPage.birthDateInput.fill(futureDate.toISOString().split('T')[0]);
      await insuranceFormPage.birthDateInput.blur();
      
      // Verify date validation error
      await insuranceFormPage.expectValidationError('birthDate');
    });
  });

  test.describe('File Upload Functionality', () => {
    test('should upload valid files successfully', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      await insuranceFormPage.completeFormToStep4();
      
      // Create test files
      const testPdf = fileUploadHelper.createTestPDF('valid-document.pdf', 1000);
      const testImage = fileUploadHelper.createTestImage('valid-image.jpg', 500);
      
      // Upload files
      await insuranceFormPage.uploadDocuments([testPdf, testImage]);
      
      // Verify files are listed
      await expect(insuranceFormPage.uploadedFilesList).toContainText('valid-document.pdf');
      await expect(insuranceFormPage.uploadedFilesList).toContainText('valid-image.jpg');
    });

    test('should reject files exceeding size limit', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      await insuranceFormPage.completeFormToStep4();
      
      // Test file size validation
      const result = await fileUploadHelper.testFileSizeLimit('[data-testid="file-upload-input"]', 5120);
      expect(result).toBeTruthy();
    });

    test('should reject invalid file types', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      await insuranceFormPage.completeFormToStep4();
      
      // Test file type validation
      const result = await fileUploadHelper.testFileTypeValidation('[data-testid="file-upload-input"]');
      expect(result).toBeTruthy();
    });
  });

  test.describe('Security Testing', () => {
    test('should protect against CSRF attacks', async () => {
      // Test CSRF protection
      const isProtected = await csrfHelper.testCSRFProtection('/api/send-insurance-application-email', {
        test: 'data'
      });
      expect(isProtected).toBeTruthy();
    });

    test('should reject requests with invalid CSRF token', async () => {
      // Test invalid CSRF token
      const isProtected = await csrfHelper.testInvalidCSRFToken('/api/send-insurance-application-email', {
        test: 'data'
      });
      expect(isProtected).toBeTruthy();
    });

    test('should sanitize input data', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Try to submit XSS payload
      const xssPayload = '<script>alert("xss")</script>';
      
      await insuranceFormPage.fullNameInput.fill(xssPayload);
      await insuranceFormPage.emailInput.fill('test@example.com');
      await insuranceFormPage.phoneInput.fill('+57 300 123 4567');
      await insuranceFormPage.identificationNumberInput.fill('12345678');
      
      // Continue through form
      await insuranceFormPage.proceedToStep2();
      await insuranceFormPage.selectInsuranceTypes(['auto']);
      await insuranceFormPage.proceedToStep3();
      await insuranceFormPage.fillAutoInsuranceDetails();
      await insuranceFormPage.proceedToStep4();
      await insuranceFormPage.acceptTermsAndPrivacy();
      await insuranceFormPage.proceedToStep5();
      
      // Verify XSS payload is sanitized in summary
      const summaryContent = await insuranceFormPage.summarySection.textContent();
      expect(summaryContent).not.toContain('<script>');
      expect(summaryContent).not.toContain('alert');
    });

    test('should detect and handle bot submissions', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Fill form normally
      await insuranceFormPage.fillStep1BasicInfo();
      await insuranceFormPage.proceedToStep2();
      await insuranceFormPage.selectInsuranceTypes(['auto']);
      await insuranceFormPage.proceedToStep3();
      await insuranceFormPage.fillAutoInsuranceDetails();
      await insuranceFormPage.proceedToStep4();
      await insuranceFormPage.acceptTermsAndPrivacy();
      
      // Fill honeypot field (simulating bot behavior)
      await insuranceFormPage.page.locator('[data-testid="honeypot"]').fill('bot-content');
      
      await insuranceFormPage.proceedToStep5();
      await insuranceFormPage.reviewAndSubmit();
      
      // Should appear successful but not actually process
      await insuranceFormPage.expectSuccessfulSubmission();
    });
  });

  test.describe('Accessibility Testing', () => {
    test('should be navigable with keyboard', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Test keyboard navigation
      const navigationResults = await testHelpers.testKeyboardNavigation([
        '[data-testid="fullName"]',
        '[data-testid="email"]',
        '[data-testid="phone"]',
        '[data-testid="identificationType"]',
      ]);
      
      // All fields should be keyboard accessible
      expect(navigationResults.every(result => result)).toBeTruthy();
    });

    test('should have proper ARIA labels', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Check for required ARIA attributes
      await expect(insuranceFormPage.fullNameInput).toHaveAttribute('aria-label');
      await expect(insuranceFormPage.emailInput).toHaveAttribute('aria-label');
      await expect(insuranceFormPage.phoneInput).toHaveAttribute('aria-label');
    });

    test('should announce form errors to screen readers', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Trigger validation errors
      await insuranceFormPage.proceedToStep2();
      
      // Check that error messages have proper ARIA attributes
      await expect(insuranceFormPage.page.locator('[data-testid="fullName-error"]')).toHaveAttribute('role', 'alert');
      await expect(insuranceFormPage.page.locator('[data-testid="email-error"]')).toHaveAttribute('role', 'alert');
    });
  });

  test.describe('Performance Testing', () => {
    test('should load form within acceptable time', async () => {
      const startTime = Date.now();
      await insuranceFormPage.navigateToInsuranceForm();
      const loadTime = Date.now() - startTime;
      
      // Form should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle form submission within acceptable time', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Complete form quickly
      await insuranceFormPage.fillStep1BasicInfo();
      await insuranceFormPage.proceedToStep2();
      await insuranceFormPage.selectInsuranceTypes(['auto']);
      await insuranceFormPage.proceedToStep3();
      await insuranceFormPage.fillAutoInsuranceDetails();
      await insuranceFormPage.proceedToStep4();
      await insuranceFormPage.acceptTermsAndPrivacy();
      await insuranceFormPage.proceedToStep5();
      
      // Measure submission time
      const startTime = Date.now();
      await insuranceFormPage.reviewAndSubmit();
      await insuranceFormPage.expectSuccessfulSubmission();
      const submissionTime = Date.now() - startTime;
      
      // Submission should complete within 10 seconds
      expect(submissionTime).toBeLessThan(10000);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work properly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Verify form is responsive
      const formWidth = await insuranceFormPage.page.locator('form').boundingBox();
      expect(formWidth?.width).toBeLessThanOrEqual(375);
      
      // Test form functionality on mobile
      await insuranceFormPage.fillStep1BasicInfo();
      await insuranceFormPage.proceedToStep2();
      
      // Verify progress bar is visible on mobile
      await expect(insuranceFormPage.progressBar).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Simulate network failure
      await insuranceFormPage.page.route('/api/send-insurance-application-email', async (route) => {
        await route.abort('networkerror');
      });
      
      // Complete form and submit
      await insuranceFormPage.completeFullApplication(['auto']);
      
      // Should show error message
      await expect(insuranceFormPage.errorMessage).toBeVisible();
      await expect(insuranceFormPage.errorMessage).toContainText('error');
    });

    test('should handle server errors gracefully', async () => {
      await insuranceFormPage.navigateToInsuranceForm();
      
      // Simulate server error
      await insuranceFormPage.page.route('/api/send-insurance-application-email', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });
      
      // Complete form and submit
      await insuranceFormPage.completeFullApplication(['auto']);
      
      // Should show error message
      await expect(insuranceFormPage.errorMessage).toBeVisible();
    });
  });
});