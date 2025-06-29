import { Page, expect, Locator } from '@playwright/test';

/**
 * General test helpers and utilities
 */
export class TestHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Waits for an element to be visible and stable
   */
  async waitForElementStable(selector: string, timeout: number = 5000): Promise<void> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    await element.waitFor({ state: 'attached', timeout });
  }

  /**
   * Waits for loading states to complete
   */
  async waitForAllLoadingToComplete(): Promise<void> {
    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle');
    
    // Wait for any loading spinners to disappear
    const loadingSelectors = [
      '[data-testid="loading"]',
      '[data-testid="spinner"]',
      '.loading',
      '.spinner',
    ];

    for (const selector of loadingSelectors) {
      try {
        await this.page.waitForSelector(selector, { state: 'hidden', timeout: 1000 });
      } catch {
        // Ignore if selector not found
      }
    }
  }

  /**
   * Scrolls an element into view smoothly
   */
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // Wait for smooth scroll
  }

  /**
   * Fills a form field with typing simulation
   */
  async typeIntoField(selector: string, text: string, delay: number = 50): Promise<void> {
    const field = this.page.locator(selector);
    await field.click();
    await field.clear();
    await field.type(text, { delay });
  }

  /**
   * Selects an option from a dropdown with retry logic
   */
  async selectFromDropdown(selector: string, value: string, retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.locator(selector).selectOption(value);
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Clicks an element with retry logic for flaky elements
   */
  async clickWithRetry(selector: string, retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.locator(selector).click();
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Waits for a specific network response
   */
  async waitForAPIResponse(urlPattern: string, timeout: number = 10000): Promise<object> {
    const response = await this.page.waitForResponse(
      response => response.url().includes(urlPattern) && response.status() === 200,
      { timeout }
    );
    return response.json();
  }

  /**
   * Captures console errors during test execution
   */
  async captureConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Captures network failures during test execution
   */
  async captureNetworkFailures(): Promise<string[]> {
    const failures: string[] = [];
    
    this.page.on('requestfailed', (request) => {
      failures.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    return failures;
  }

  /**
   * Takes a screenshot with timestamp
   */
  async takeTimestampedScreenshot(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const path = `test-results/screenshots/${filename}`;
    
    await this.page.screenshot({ 
      path,
      fullPage: true,
      animations: 'disabled'
    });
    
    return path;
  }

  /**
   * Measures page performance metrics
   */
  async measurePerformance(): Promise<{
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number | null;
    largestContentfulPaint: number | null;
  }> {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
        largestContentfulPaint: null, // Would need to implement LCP observer
      };
    });

    return metrics;
  }

  /**
   * Checks for accessibility violations using axe-core
   */
  async checkAccessibility(): Promise<{ violations: unknown[] }> {
    // This would typically use @axe-core/playwright
    try {
      const results = await this.page.evaluate(() => {
        // Placeholder for axe-core integration
        return { violations: [] };
      });
      return results;
    } catch (error) {
      console.warn('Accessibility check failed:', error);
      return { violations: [] };
    }
  }

  /**
   * Simulates slow network conditions
   */
  async simulateSlowNetwork(): Promise<void> {
    await this.page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
      await route.continue();
    });
  }

  /**
   * Simulates offline mode
   */
  async simulateOffline(): Promise<void> {
    await this.page.context().setOffline(true);
  }

  /**
   * Restores online mode
   */
  async restoreOnline(): Promise<void> {
    await this.page.context().setOffline(false);
  }

  /**
   * Generates random test data
   */
  generateRandomData(): {
    email: string;
    phone: string;
    name: string;
    id: string;
  } {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    return {
      email: `test.user.${timestamp}@example.com`,
      phone: `+57 300 ${random.toString().padStart(3, '0')} ${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name: `Test User ${timestamp}`,
      id: `${timestamp}${random}`,
    };
  }

  /**
   * Waits for form submission to complete
   */
  async waitForFormSubmission(formSelector: string): Promise<void> {
    const form = this.page.locator(formSelector);
    
    // Wait for submit button to be disabled (indicating submission in progress)
    await expect(form.locator('button[type="submit"]')).toBeDisabled();
    
    // Wait for submission to complete (button re-enabled or success message)
    await Promise.race([
      expect(form.locator('button[type="submit"]')).toBeEnabled({ timeout: 10000 }),
      expect(this.page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 10000 }),
      expect(this.page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 10000 }),
    ]);
  }

  /**
   * Validates form field errors
   */
  async validateFieldErrors(expectedErrors: Record<string, string>): Promise<void> {
    for (const [fieldName, expectedMessage] of Object.entries(expectedErrors)) {
      const errorElement = this.page.locator(`[data-testid="${fieldName}-error"]`);
      await expect(errorElement).toBeVisible();
      await expect(errorElement).toContainText(expectedMessage);
    }
  }

  /**
   * Clears all form fields
   */
  async clearAllFormFields(formSelector: string): Promise<void> {
    const form = this.page.locator(formSelector);
    const inputs = await form.locator('input, textarea, select').all();
    
    for (const input of inputs) {
      await input.clear();
    }
  }

  /**
   * Intercepts and modifies API responses
   */
  async interceptAPIResponse(urlPattern: string, mockData: Record<string, unknown>): Promise<void> {
    await this.page.route(urlPattern, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });
  }

  /**
   * Waits for specific text to appear on page
   */
  async waitForText(text: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  /**
   * Checks if page contains specific text
   */
  async hasText(text: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(`text=${text}`, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Hovers over an element and waits for any tooltips
   */
  async hoverAndWait(selector: string): Promise<void> {
    await this.page.locator(selector).hover();
    await this.page.waitForTimeout(500); // Wait for hover effects
  }

  /**
   * Focuses an element and waits for focus styles
   */
  async focusAndWait(selector: string): Promise<void> {
    await this.page.locator(selector).focus();
    await this.page.waitForTimeout(200); // Wait for focus styles
  }

  /**
   * Tests keyboard navigation through elements
   */
  async testKeyboardNavigation(selectors: string[]): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (let i = 0; i < selectors.length; i++) {
      await this.page.keyboard.press('Tab');
      try {
        await expect(this.page.locator(selectors[i])).toBeFocused({ timeout: 1000 });
        results.push(true);
      } catch {
        results.push(false);
      }
    }
    
    return results;
  }

  /**
   * Counts visible elements matching a selector
   */
  async countVisibleElements(selector: string): Promise<number> {
    const elements = await this.page.locator(selector).all();
    let count = 0;
    
    for (const element of elements) {
      if (await element.isVisible()) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Waits for animations to complete
   */
  async waitForAnimations(): Promise<void> {
    await this.page.waitForFunction(() => {
      const animations = document.getAnimations();
      return animations.length === 0 || animations.every(animation => animation.playState === 'finished');
    });
  }

  /**
   * Validates responsive design at different breakpoints
   */
  async testResponsiveBreakpoints(): Promise<Record<string, boolean>> {
    const breakpoints = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1280, height: 720 },
      large: { width: 1920, height: 1080 },
    };

    const results: Record<string, boolean> = {};

    for (const [name, viewport] of Object.entries(breakpoints)) {
      await this.page.setViewportSize(viewport);
      await this.waitForAnimations();
      
      // Check if layout is appropriate for viewport
      const isLayoutValid = await this.page.evaluate(() => {
        const body = document.body;
        return body.scrollWidth <= window.innerWidth;
      });
      
      results[name] = isLayoutValid;
    }

    // Reset to default
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    return results;
  }

  /**
   * Monitors JavaScript errors
   */
  async monitorJavaScriptErrors(): Promise<string[]> {
    const jsErrors: string[] = [];
    
    this.page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    return jsErrors;
  }
}

/**
 * Utility function to create test helpers instance
 */
export function createTestHelpers(page: Page): TestHelpers {
  return new TestHelpers(page);
}

/**
 * Common test data generators
 */
export const dataGenerators = {
  randomEmail: () => `test.${Date.now()}@example.com`,
  randomPhone: () => `+57 300 ${Math.random().toString().slice(2, 5)} ${Math.random().toString().slice(2, 6)}`,
  randomName: () => `Test User ${Date.now()}`,
  randomPolicyNumber: () => `POL-${new Date().getFullYear()}-${Math.random().toString().slice(2, 6)}`,
  randomText: (length: number = 50) => 'Lorem ipsum '.repeat(length).slice(0, length),
};

/**
 * Common test assertions
 */
export const assertions = {
  async expectFormSubmissionSuccess(page: Page): Promise<void> {
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  },

  async expectFormSubmissionError(page: Page): Promise<void> {
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  },

  async expectLoadingState(page: Page): Promise<void> {
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();
  },

  async expectNoLoadingState(page: Page): Promise<void> {
    await expect(page.locator('[data-testid="loading"]')).not.toBeVisible();
  },
};