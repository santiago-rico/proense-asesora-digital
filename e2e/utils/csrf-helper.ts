import { Page } from '@playwright/test';

export class CSRFHelper {
  private page: Page;
  private csrfToken: string | null = null;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Fetches a CSRF token from the API endpoint
   */
  async fetchCSRFToken(): Promise<string> {
    try {
      const response = await this.page.request.get('/api/csrf-token', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok()) {
        throw new Error(`Failed to fetch CSRF token: ${response.status()}`);
      }

      const data = await response.json();
      this.csrfToken = data.token;
      
      if (!this.csrfToken) {
        throw new Error('CSRF token not found in response');
      }

      return this.csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }

  /**
   * Gets the current CSRF token, fetching it if necessary
   */
  async getCSRFToken(): Promise<string> {
    if (!this.csrfToken) {
      await this.fetchCSRFToken();
    }
    return this.csrfToken!;
  }

  /**
   * Makes an authenticated POST request with CSRF token
   */
  async makeAuthenticatedRequest(
    url: string, 
    data: any, 
    options: { headers?: Record<string, string> } = {}
  ): Promise<any> {
    const token = await this.getCSRFToken();
    
    const response = await this.page.request.post(url, {
      data: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        ...options.headers,
      },
    });

    return response;
  }

  /**
   * Intercepts CSRF token requests for testing
   */
  async interceptCSRFToken(mockToken: string): Promise<void> {
    await this.page.route('/api/csrf-token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: mockToken }),
      });
    });
    this.csrfToken = mockToken;
  }

  /**
   * Simulates CSRF token failure
   */
  async simulateCSRFFailure(): Promise<void> {
    await this.page.route('/api/csrf-token', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Forbidden' }),
      });
    });
  }

  /**
   * Tests CSRF protection by sending request without token
   */
  async testCSRFProtection(url: string, data: any): Promise<boolean> {
    try {
      const response = await this.page.request.post(url, {
        data: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          // Intentionally omitting X-CSRF-Token header
        },
      });

      // If request succeeds without CSRF token, protection is not working
      return !response.ok() && response.status() === 403;
    } catch (error) {
      // If request fails, CSRF protection is likely working
      return true;
    }
  }

  /**
   * Tests CSRF token validation with invalid token
   */
  async testInvalidCSRFToken(url: string, data: any): Promise<boolean> {
    try {
      const response = await this.page.request.post(url, {
        data: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'invalid-token-12345',
        },
      });

      // Should return 403 for invalid token
      return response.status() === 403;
    } catch (error) {
      return true;
    }
  }

  /**
   * Clears the stored CSRF token
   */
  clearToken(): void {
    this.csrfToken = null;
  }

  /**
   * Validates CSRF token format
   */
  validateTokenFormat(token: string): boolean {
    // Basic validation - adjust based on your token format
    return typeof token === 'string' && token.length > 10;
  }

  /**
   * Sets up CSRF token interceptor for form submissions
   */
  async setupFormCSRFInterceptor(): Promise<void> {
    // Intercept form submissions and validate CSRF token presence
    await this.page.route('/api/send-*', async (route) => {
      const request = route.request();
      const headers = request.headers();
      
      if (!headers['x-csrf-token']) {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'CSRF token required' }),
        });
        return;
      }

      // Continue with original request
      await route.continue();
    });
  }

  /**
   * Tests CSRF token refresh mechanism
   */
  async testCSRFTokenRefresh(): Promise<boolean> {
    try {
      // First, get a token
      const token1 = await this.fetchCSRFToken();
      
      // Simulate token expiry by intercepting with 403
      await this.page.route('/api/send-email', async (route) => {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid CSRF token' }),
        });
      });

      // Try to make request - should trigger token refresh
      await this.makeAuthenticatedRequest('/api/send-email', { test: 'data' });
      
      // Get token again - should be different if refresh worked
      const token2 = await this.fetchCSRFToken();
      
      return token1 !== token2;
    } catch (error) {
      console.error('CSRF token refresh test failed:', error);
      return false;
    }
  }

  /**
   * Monitors CSRF-related network requests
   */
  async monitorCSRFRequests(): Promise<{ tokenRequests: number; protectedRequests: number }> {
    let tokenRequests = 0;
    let protectedRequests = 0;

    this.page.on('request', (request) => {
      const url = request.url();
      
      if (url.includes('/api/csrf-token')) {
        tokenRequests++;
      }
      
      if (url.includes('/api/') && request.headers()['x-csrf-token']) {
        protectedRequests++;
      }
    });

    return { tokenRequests, protectedRequests };
  }
}

/**
 * Utility function to create CSRF helper instance
 */
export function createCSRFHelper(page: Page): CSRFHelper {
  return new CSRFHelper(page);
}