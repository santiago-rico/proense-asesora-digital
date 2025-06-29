/**
 * Cookie management utility for Colombian market compliance
 * Simple cookie notification system (not GDPR)
 */

export type CookieConsent = 'accepted' | 'declined' | null;

const COOKIE_CONSENT_KEY = 'proense-cookie-consent';
const COOKIE_CONSENT_TIMESTAMP_KEY = 'proense-cookie-consent-timestamp';

/**
 * Get the current cookie consent status from localStorage
 */
export const getCookieConsent = (): CookieConsent => {
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY) as CookieConsent;
    return consent;
  } catch (error) {
    console.warn('Error reading cookie consent from localStorage:', error);
    return null;
  }
};

/**
 * Set the cookie consent status in localStorage
 */
export const setCookieConsent = (consent: 'accepted' | 'declined'): void => {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, consent);
    localStorage.setItem(COOKIE_CONSENT_TIMESTAMP_KEY, new Date().toISOString());
  } catch (error) {
    console.warn('Error saving cookie consent to localStorage:', error);
  }
};

/**
 * Check if cookie consent has been given (either accepted or declined)
 */
export const hasCookieConsent = (): boolean => {
  return getCookieConsent() !== null;
};

/**
 * Check if cookies have been accepted
 */
export const areCookiesAccepted = (): boolean => {
  return getCookieConsent() === 'accepted';
};

/**
 * Clear cookie consent (for testing purposes)
 */
export const clearCookieConsent = (): void => {
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_CONSENT_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Error clearing cookie consent from localStorage:', error);
  }
};

/**
 * Get the timestamp when consent was given
 */
export const getCookieConsentTimestamp = (): Date | null => {
  try {
    const timestamp = localStorage.getItem(COOKIE_CONSENT_TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.warn('Error reading cookie consent timestamp:', error);
    return null;
  }
};

/**
 * Check if consent should be re-requested (e.g., after 1 year)
 * For Colombian compliance, this is optional but good practice
 */
export const shouldRequestConsentAgain = (monthsInterval: number = 12): boolean => {
  const timestamp = getCookieConsentTimestamp();
  if (!timestamp) return true;
  
  const now = new Date();
  const monthsAgo = new Date(now.getFullYear(), now.getMonth() - monthsInterval, now.getDate());
  
  return timestamp < monthsAgo;
};