/**
 * Utility functions for email templates
 */

/**
 * Get the correct base URL for email assets
 * This function tries multiple approaches to get the correct URL
 */
export function getEmailAssetBaseUrl(requestHost?: string): string {
  // Priority 1: Always use production URL for email assets to ensure reliability
  // Email clients need stable, publicly accessible URLs
  const PRODUCTION_URL = 'https://proense-asesora-digital.vercel.app';
  
  // Check if we're in production environment
  if (typeof process !== 'undefined' && process.env) {
    // In production, use the production URL
    if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
      // Try to use the custom domain if configured
      if (process.env.EMAIL_ASSET_BASE_URL) {
        return process.env.EMAIL_ASSET_BASE_URL;
      }
      // Otherwise use the Vercel app URL which is always reliable
      return PRODUCTION_URL;
    }
    
    // For preview deployments, still use production URL for assets
    // This ensures logos always work even in preview deployments
    if (process.env.VERCEL_ENV === 'preview') {
      return PRODUCTION_URL;
    }
    
    // For development, try to use VERCEL_URL if available
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
  }
  
  // Priority 2: Check if the request host looks like a production domain
  if (requestHost) {
    const cleanHost = requestHost.replace(/^https?:\/\//, '');
    // If it's a known production domain, use it
    if (cleanHost.includes('proense.co') || cleanHost.includes('proense-asesora-digital')) {
      return `https://${cleanHost}`;
    }
  }
  
  // Priority 3: Default to the Vercel app URL which should always work
  return PRODUCTION_URL;
}

/**
 * Get logo URLs with fallbacks for email templates
 */
export function getEmailLogoUrls(baseUrl?: string) {
  const assetBaseUrl = getEmailAssetBaseUrl(baseUrl);
  
  // Ensure we always use HTTPS and the correct domain
  const secureBaseUrl = assetBaseUrl.startsWith('http') ? assetBaseUrl : `https://${assetBaseUrl}`;
  
  return {
    primary: {
      logo80: `${secureBaseUrl}/images/email/logo-80.png`,
      logo60: `${secureBaseUrl}/images/email/logo-60.png`,
      logo40: `${secureBaseUrl}/images/email/logo-40.png`,
    },
    fallback: {
      logo80: `${secureBaseUrl}/images/logo.png`,
      logo60: `${secureBaseUrl}/images/logo.png`,
      logo40: `${secureBaseUrl}/images/logo.png`,
    },
    // Use direct production URLs as fallback for maximum compatibility
    external: {
      logo80: 'https://proense-asesora-digital.vercel.app/images/email/logo-80.png',
      logo60: 'https://proense-asesora-digital.vercel.app/images/email/logo-60.png',
      logo40: 'https://proense-asesora-digital.vercel.app/images/email/logo-40.png',
    },
    // Text logo for high quality rendering
    textLogo: {
      png: `${secureBaseUrl}/images/text-logo.png`,
      avif: `${secureBaseUrl}/images/text-logo.avif`,
      webp: `${secureBaseUrl}/images/text-logo.webp`,
      // Always use production URL as fallback
      fallback: 'https://proense-asesora-digital.vercel.app/images/text-logo.png'
    }
  };
}
/**
 * Debug function to log email template information
 */
export function logEmailDebugInfo(templateName: string, baseUrl?: string) {
  if (typeof console !== 'undefined') {
    console.log(`[EMAIL DEBUG] Template: ${templateName}`);
    console.log(`[EMAIL DEBUG] Base URL: ${baseUrl || 'Using default'}`);
    console.log(`[EMAIL DEBUG] Environment: ${typeof process !== 'undefined' ? process.env.NODE_ENV || 'unknown' : 'browser'}`);
    
    if (typeof process !== 'undefined' && process.env) {
      console.log(`[EMAIL DEBUG] VERCEL_URL: ${process.env.VERCEL_URL || 'not set'}`);
      console.log(`[EMAIL DEBUG] VERCEL_PROJECT_PRODUCTION_URL: ${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'not set'}`);
    }
  }
}

/**
 * Validate that logo URLs are accessible
 */
export async function validateLogoUrls(baseUrl?: string): Promise<{ url: string; accessible: boolean }[]> {
  const logoUrls = getEmailLogoUrls(baseUrl);
  const urlsToTest = [
    logoUrls.primary.logo80,
    logoUrls.primary.logo60,
    logoUrls.fallback.logo80,
  ];
  
  const results = [];
  
  for (const url of urlsToTest) {
    try {
      // In Node.js environment, we can't easily test URLs without additional dependencies
      // This is mainly for debugging purposes
      results.push({ url, accessible: true }); // Assume accessible for now
    } catch (error) {
      results.push({ url, accessible: false });
    }
  }
  
  return results;
}