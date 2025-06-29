/**
 * Tests for cookie consent utility functions
 */

import { 
  getCookieConsent, 
  setCookieConsent, 
  hasCookieConsent, 
  areCookiesAccepted,
  clearCookieConsent,
  shouldRequestConsentAgain 
} from './cookies';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Replace localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Cookie Consent Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getCookieConsent', () => {
    test('should return null when no consent is stored', () => {
      expect(getCookieConsent()).toBe(null);
    });

    test('should return stored consent value', () => {
      localStorage.setItem('proense-cookie-consent', 'accepted');
      expect(getCookieConsent()).toBe('accepted');
    });
  });

  describe('setCookieConsent', () => {
    test('should store consent value and timestamp', () => {
      const beforeTime = new Date().getTime();
      setCookieConsent('accepted');
      const afterTime = new Date().getTime();

      expect(localStorage.getItem('proense-cookie-consent')).toBe('accepted');
      
      const timestamp = localStorage.getItem('proense-cookie-consent-timestamp');
      expect(timestamp).toBeTruthy();
      
      const storedTime = new Date(timestamp!).getTime();
      expect(storedTime).toBeGreaterThanOrEqual(beforeTime);
      expect(storedTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('hasCookieConsent', () => {
    test('should return false when no consent is stored', () => {
      expect(hasCookieConsent()).toBe(false);
    });

    test('should return true when consent is accepted', () => {
      setCookieConsent('accepted');
      expect(hasCookieConsent()).toBe(true);
    });

    test('should return true when consent is declined', () => {
      setCookieConsent('declined');
      expect(hasCookieConsent()).toBe(true);
    });
  });

  describe('areCookiesAccepted', () => {
    test('should return false when no consent is stored', () => {
      expect(areCookiesAccepted()).toBe(false);
    });

    test('should return true when cookies are accepted', () => {
      setCookieConsent('accepted');
      expect(areCookiesAccepted()).toBe(true);
    });

    test('should return false when cookies are declined', () => {
      setCookieConsent('declined');
      expect(areCookiesAccepted()).toBe(false);
    });
  });

  describe('clearCookieConsent', () => {
    test('should remove consent and timestamp from localStorage', () => {
      setCookieConsent('accepted');
      expect(hasCookieConsent()).toBe(true);
      
      clearCookieConsent();
      expect(hasCookieConsent()).toBe(false);
      expect(localStorage.getItem('proense-cookie-consent-timestamp')).toBe(null);
    });
  });

  describe('shouldRequestConsentAgain', () => {
    test('should return true when no consent exists', () => {
      expect(shouldRequestConsentAgain()).toBe(true);
    });

    test('should return false when consent is recent', () => {
      setCookieConsent('accepted');
      expect(shouldRequestConsentAgain(12)).toBe(false);
    });

    test('should return true when consent is old', () => {
      // Set consent with old timestamp
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 2); // 2 years ago
      
      localStorage.setItem('proense-cookie-consent', 'accepted');
      localStorage.setItem('proense-cookie-consent-timestamp', oldDate.toISOString());
      
      expect(shouldRequestConsentAgain(12)).toBe(true);
    });
  });

  describe('error handling', () => {
    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw errors
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error('LocalStorage error');
      };

      // Should not throw and return null
      expect(getCookieConsent()).toBe(null);

      // Restore original implementation
      localStorage.getItem = originalGetItem;
    });
  });
});