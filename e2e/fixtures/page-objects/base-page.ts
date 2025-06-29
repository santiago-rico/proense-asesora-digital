import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common locators
  get navbar(): Locator {
    return this.page.locator('[data-testid="navbar"]');
  }

  get footer(): Locator {
    return this.page.locator('[data-testid="footer"]');
  }

  get skipToContentLink(): Locator {
    return this.page.locator('[data-testid="skip-to-content"]');
  }

  get cookieConsent(): Locator {
    return this.page.locator('[data-testid="cookie-consent"]');
  }

  get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading-spinner"]');
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-testid="error-message"]');
  }

  get successMessage(): Locator {
    return this.page.locator('[data-testid="success-message"]');
  }

  // Navigation methods
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async clickNavbarLink(linkText: string): Promise<void> {
    await this.navbar.locator(`text="${linkText}"`).click();
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('body', { state: 'attached' });
  }

  // Cookie consent methods
  async acceptCookies(): Promise<void> {
    const cookieConsent = this.cookieConsent;
    if (await cookieConsent.isVisible()) {
      await cookieConsent.locator('button:has-text("Aceptar")').click();
      await expect(cookieConsent).not.toBeVisible();
    }
  }

  async rejectCookies(): Promise<void> {
    const cookieConsent = this.cookieConsent;
    if (await cookieConsent.isVisible()) {
      await cookieConsent.locator('button:has-text("Rechazar")').click();
      await expect(cookieConsent).not.toBeVisible();
    }
  }

  // Form helpers
  async fillInput(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).fill(value);
  }

  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).selectOption(value);
  }

  async clickButton(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  async uploadFile(selector: string, filePath: string): Promise<void> {
    await this.page.locator(selector).setInputFiles(filePath);
  }

  // Validation helpers
  async expectElementToBeVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectElementToHaveText(selector: string, text: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  async expectPageTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  async expectUrl(url: string): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }

  // Error handling
  async checkForErrors(): Promise<void> {
    const errorMessage = this.errorMessage;
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      throw new Error(`Page error detected: ${errorText}`);
    }
  }

  // Loading state helpers
  async waitForLoadingToComplete(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    
    // Wait for loading spinner to disappear if present
    const spinner = this.loadingSpinner;
    if (await spinner.isVisible()) {
      await expect(spinner).not.toBeVisible({ timeout: 10000 });
    }
  }

  // Accessibility helpers
  async checkAccessibility(): Promise<void> {
    // Check for skip to content link
    await expect(this.skipToContentLink).toBeAttached();
    
    // Check that main content has proper heading structure
    const h1Count = await this.page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1); // Should have exactly one h1
  }

  // Keyboard navigation helpers
  async navigateWithKeyboard(key: string, times: number = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.page.keyboard.press(key);
    }
  }

  async expectFocusedElement(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeFocused();
  }

  // Mobile helpers
  async checkMobileResponsiveness(): Promise<void> {
    // Check mobile menu toggle
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.expectElementToBeVisible('[data-testid="mobile-menu-toggle"]');
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  // Performance helpers
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.waitForPageLoad();
    return Date.now() - startTime;
  }

  // Screenshot helpers
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  // Console error tracking
  async checkForConsoleErrors(): Promise<void> {
    const consoleErrors: string[] = [];
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // If there are console errors, throw an error
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors detected: ${consoleErrors.join(', ')}`);
    }
  }

  // Network helpers
  async interceptNetworkRequest(url: string, response: any): Promise<void> {
    await this.page.route(url, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  async waitForNetworkResponse(url: string): Promise<void> {
    await this.page.waitForResponse(url);
  }
}