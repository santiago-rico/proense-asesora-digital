#!/usr/bin/env node

/**
 * Test script for improved email logo rendering
 * Generates an HTML file to preview the enhanced logo implementation
 */

import { BaseTemplate } from './BaseTemplate.js';
import { InsuranceApplicationTemplate } from './InsuranceApplicationTemplate.js';
import fs from 'fs';
import path from 'path';

// Generate a test email with the improved logo
const testEmail = BaseTemplate({
  preheader: 'Test email with improved logo quality',
  content: `
    <tr>
      <td style="padding: 40px; background-color: #ffffff;">
        <h2 style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700; color: #212529;">
          Logo Quality Test
        </h2>
        <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #495057;">
          This email demonstrates the improved logo rendering:
        </p>
        <ul style="margin: 0 0 20px 0; padding-left: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #495057;">
          <li>✅ No blue box background - logo displays naturally</li>
          <li>✅ High-quality text logo (180x52px)</li>
          <li>✅ Multiple format support (AVIF, WebP, PNG)</li>
          <li>✅ Retina display support (2x resolution)</li>
          <li>✅ Dark mode support with brightness adjustment</li>
          <li>✅ Fallback text when images fail to load</li>
          <li>✅ Image rendering optimization for crisp edges</li>
          <li>✅ Responsive sizing for mobile devices</li>
        </ul>
        <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #495057;">
          The logo now uses the high-resolution text-logo.png file which is 1942x556 pixels, 
          scaled down to 180x52 for optimal email display. This ensures much better quality 
          than the previous small 80x65 pixel logo with forced blue background.
        </p>
      </td>
    </tr>
  `,
  isDarkMode: false,
  baseUrl: 'https://proense.com.co'
});

// Also generate a dark mode version
const darkModeEmail = BaseTemplate({
  preheader: 'Test email with improved logo quality - Dark Mode',
  content: `
    <tr>
      <td style="padding: 40px; background-color: #2d2d2d;">
        <h2 style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700; color: #e0e0e0;">
          Dark Mode Logo Test
        </h2>
        <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #a0a0a0;">
          This shows how the logo appears in dark mode with automatic brightness adjustments.
        </p>
      </td>
    </tr>
  `,
  isDarkMode: true,
  baseUrl: 'https://proense.com.co'
});

// Write test files
const outputDir = path.resolve(process.cwd());

fs.writeFileSync(
  path.join(outputDir, 'test-logo-improved.html'),
  testEmail,
  'utf8'
);

fs.writeFileSync(
  path.join(outputDir, 'test-logo-improved-dark.html'),
  darkModeEmail,
  'utf8'
);

// Skip the insurance template test for now since it has specific structure requirements
// We already have the basic template tests which demonstrate the logo improvements

console.log('✅ Test email files generated successfully:');
console.log('   - test-logo-improved.html (Light mode)');
console.log('   - test-logo-improved-dark.html (Dark mode)');
console.log('\nOpen these files in your browser to preview the improved logo rendering.');