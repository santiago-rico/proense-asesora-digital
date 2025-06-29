import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { testData } from '../test-data';

export class LeadFormPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Dialog and form locators
  get leadFormDialog(): Locator {
    return this.page.locator('[data-testid="lead-form-dialog"]');
  }

  get leadFormTrigger(): Locator {
    return this.page.locator('[data-testid="lead-form-trigger"]');
  }

  get dialogCloseButton(): Locator {
    return this.page.locator('[data-testid="dialog-close"]');
  }

  get dialogOverlay(): Locator {
    return this.page.locator('[data-testid="dialog-overlay"]');
  }

  // Form field locators
  get fullNameInput(): Locator {
    return this.page.locator('[data-testid="lead-fullName"]');
  }

  get emailInput(): Locator {
    return this.page.locator('[data-testid="lead-email"]');
  }

  get phoneInput(): Locator {
    return this.page.locator('[data-testid="lead-phone"]');
  }

  get insuranceTypeSelect(): Locator {
    return this.page.locator('[data-testid="lead-insuranceType"]');
  }

  get messageTextarea(): Locator {
    return this.page.locator('[data-testid="lead-message"]');
  }

  get honeypotField(): Locator {
    return this.page.locator('[data-testid="lead-honeypot"]');
  }

  // Form actions
  get submitButton(): Locator {
    return this.page.locator('[data-testid="lead-submit-button"]');
  }

  get cancelButton(): Locator {
    return this.page.locator('[data-testid="lead-cancel-button"]');
  }

  // Loading and success states
  get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="lead-loading"]');
  }

  get successMessage(): Locator {
    return this.page.locator('[data-testid="lead-success-message"]');
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-testid="lead-error-message"]');
  }

  // Validation error locators
  get fullNameError(): Locator {
    return this.page.locator('[data-testid="lead-fullName-error"]');
  }

  get emailError(): Locator {
    return this.page.locator('[data-testid="lead-email-error"]');
  }

  get phoneError(): Locator {
    return this.page.locator('[data-testid="lead-phone-error"]');
  }

  get insuranceTypeError(): Locator {
    return this.page.locator('[data-testid="lead-insuranceType-error"]');
  }

  get messageError(): Locator {
    return this.page.locator('[data-testid="lead-message-error"]');
  }

  // Methods for interacting with the lead form
  async openLeadForm(): Promise<void> {
    await this.leadFormTrigger.click();
    await expect(this.leadFormDialog).toBeVisible();
  }

  async closeLeadForm(): Promise<void> {
    await this.dialogCloseButton.click();
    await expect(this.leadFormDialog).not.toBeVisible();
  }

  async closeLeadFormByEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.leadFormDialog).not.toBeVisible();
  }

  async closeLeadFormByOverlay(): Promise<void> {
    await this.dialogOverlay.click({ position: { x: 10, y: 10 } });
    await expect(this.leadFormDialog).not.toBeVisible();
  }

  async fillLeadForm(data = testData.leadForm.valid): Promise<void> {
    await expect(this.leadFormDialog).toBeVisible();
    
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.insuranceTypeSelect.selectOption(data.insuranceType);
    await this.messageTextarea.fill(data.message);
  }

  async submitLeadForm(): Promise<void> {
    await this.submitButton.click();
  }

  async submitValidLeadForm(data = testData.leadForm.valid): Promise<void> {
    await this.openLeadForm();
    await this.fillLeadForm(data);
    await this.submitLeadForm();
  }

  async expectSuccessfulSubmission(): Promise<void> {
    await expect(this.loadingSpinner).toBeVisible();
    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 10000 });
    await expect(this.successMessage).toBeVisible();
  }

  async expectSubmissionError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  // Validation testing methods
  async submitEmptyForm(): Promise<void> {
    await this.openLeadForm();
    await this.submitLeadForm();
  }

  async expectValidationErrors(): Promise<void> {
    await expect(this.fullNameError).toBeVisible();
    await expect(this.emailError).toBeVisible();
    await expect(this.phoneError).toBeVisible();
    await expect(this.insuranceTypeError).toBeVisible();
    await expect(this.messageError).toBeVisible();
  }

  async fillInvalidEmail(invalidEmail: string): Promise<void> {
    await this.emailInput.fill(invalidEmail);
    await this.emailInput.blur();
    await expect(this.emailError).toBeVisible();
    await expect(this.emailError).toContainText('válido');
  }

  async fillInvalidPhone(invalidPhone: string): Promise<void> {
    await this.phoneInput.fill(invalidPhone);
    await this.phoneInput.blur();
    await expect(this.phoneError).toBeVisible();
  }

  async testFieldCharacterLimits(): Promise<void> {
    const longText = 'x'.repeat(1001); // Assuming 1000 char limit
    
    await this.fullNameInput.fill(longText);
    await expect(this.fullNameError).toBeVisible();
    
    await this.messageTextarea.fill(longText);
    await expect(this.messageError).toBeVisible();
  }

  // Security testing methods
  async testHoneypotField(): Promise<void> {
    await this.openLeadForm();
    await this.fillLeadForm();
    
    // Fill honeypot field (should be hidden)
    await this.honeypotField.fill('bot-content');
    await this.submitLeadForm();
    
    // Should appear successful but not actually submit
    await expect(this.successMessage).toBeVisible();
  }

  async testXSSAttempts(): Promise<void> {
    const xssPayloads = testData.security.xssAttempts;
    
    for (const payload of xssPayloads) {
      await this.openLeadForm();
      await this.fullNameInput.fill(payload);
      await this.emailInput.fill('test@example.com');
      await this.phoneInput.fill('+57 300 123 4567');
      await this.insuranceTypeSelect.selectOption('auto');
      await this.messageTextarea.fill(payload);
      
      await this.submitLeadForm();
      
      // Should not execute script or cause errors
      await this.expectSuccessfulSubmission();
      
      // Check that no script was executed
      const alertCount = await this.page.evaluate(() => {
        return (window as any).testAlertCount || 0;
      });
      expect(alertCount).toBe(0);
      
      await this.closeLeadForm();
    }
  }

  // Accessibility testing methods
  async testKeyboardNavigation(): Promise<void> {
    await this.openLeadForm();
    
    // Tab through all form fields
    await this.page.keyboard.press('Tab');
    await this.expectFocusedElement('[data-testid="lead-fullName"]');
    
    await this.page.keyboard.press('Tab');
    await this.expectFocusedElement('[data-testid="lead-email"]');
    
    await this.page.keyboard.press('Tab');
    await this.expectFocusedElement('[data-testid="lead-phone"]');
    
    await this.page.keyboard.press('Tab');
    await this.expectFocusedElement('[data-testid="lead-insuranceType"]');
    
    await this.page.keyboard.press('Tab');
    await this.expectFocusedElement('[data-testid="lead-message"]');
    
    await this.page.keyboard.press('Tab');
    await this.expectFocusedElement('[data-testid="lead-submit-button"]');
  }

  async testAriaLabels(): Promise<void> {
    await this.openLeadForm();
    
    // Check that all form fields have proper ARIA labels
    await expect(this.fullNameInput).toHaveAttribute('aria-label');
    await expect(this.emailInput).toHaveAttribute('aria-label');
    await expect(this.phoneInput).toHaveAttribute('aria-label');
    await expect(this.insuranceTypeSelect).toHaveAttribute('aria-label');
    await expect(this.messageTextarea).toHaveAttribute('aria-label');
  }

  async testErrorAnnouncements(): Promise<void> {
    await this.openLeadForm();
    await this.submitEmptyForm();
    
    // Check that errors have proper ARIA attributes
    await expect(this.fullNameError).toHaveAttribute('role', 'alert');
    await expect(this.emailError).toHaveAttribute('role', 'alert');
  }

  // Performance testing methods
  async measureFormOpenTime(): Promise<number> {
    const startTime = Date.now();
    await this.openLeadForm();
    await expect(this.leadFormDialog).toBeVisible();
    return Date.now() - startTime;
  }

  async measureFormSubmissionTime(): Promise<number> {
    await this.openLeadForm();
    await this.fillLeadForm();
    
    const startTime = Date.now();
    await this.submitLeadForm();
    await expect(this.successMessage).toBeVisible();
    return Date.now() - startTime;
  }

  // Mobile responsiveness testing
  async testMobileInteraction(): Promise<void> {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.openLeadForm();
    
    // Check that dialog is properly sized for mobile
    const dialogBox = await this.leadFormDialog.boundingBox();
    expect(dialogBox?.width).toBeLessThanOrEqual(375);
    
    // Check that form fields are accessible
    await expect(this.fullNameInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    
    // Reset viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  // Network error simulation
  async testNetworkErrorHandling(): Promise<void> {
    // Intercept and fail the API request
    await this.page.route('/api/send-email', async (route) => {
      await route.abort('networkfailure');
    });
    
    await this.openLeadForm();
    await this.fillLeadForm();
    await this.submitLeadForm();
    
    await this.expectSubmissionError();
    await expect(this.errorMessage).toContainText('error');
  }

  // CSRF token testing
  async testCSRFProtection(): Promise<void> {
    // Intercept CSRF token request and return invalid token
    await this.page.route('/api/csrf-token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'invalid-token' }),
      });
    });
    
    await this.openLeadForm();
    await this.fillLeadForm();
    await this.submitLeadForm();
    
    // Should handle CSRF error gracefully
    await this.expectSubmissionError();
  }
}