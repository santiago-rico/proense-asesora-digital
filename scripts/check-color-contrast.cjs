#!/usr/bin/env node

/**
 * Color contrast checker for WCAG compliance
 * Checks all color combinations in the Tailwind config
 */

// Calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

// Check if contrast meets WCAG standards
function meetsWCAG(ratio, level = 'AA', largeText = false) {
  if (level === 'AA') {
    return largeText ? ratio >= 3 : ratio >= 4.5;
  } else if (level === 'AAA') {
    return largeText ? ratio >= 4.5 : ratio >= 7;
  }
  return false;
}

// Proense color palette
const colors = {
  primary: {
    DEFAULT: '#008CFC',
    foreground: '#FFFFFF',
    hover: '#0073D1',
  },
  secondary: {
    DEFAULT: '#5FCB83',
    foreground: '#FFFFFF',
    hover: '#4DB36E',
  },
  accent: {
    DEFAULT: '#346797',
    foreground: '#FFFFFF',
  },
  neutral: {
    DEFAULT: '#D5D6D8',
    foreground: '#000000',
  },
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

console.log('🎨 Proense Color Contrast Analysis');
console.log('==================================\n');

// Check main color combinations
const checks = [
  // Primary combinations
  { bg: 'primary.DEFAULT', fg: 'primary.foreground', name: 'Primary Button' },
  { bg: 'primary.hover', fg: 'primary.foreground', name: 'Primary Button Hover' },
  
  // Secondary combinations
  { bg: 'secondary.DEFAULT', fg: 'secondary.foreground', name: 'Secondary Button' },
  { bg: 'secondary.hover', fg: 'secondary.foreground', name: 'Secondary Button Hover' },
  
  // Accent combinations
  { bg: 'accent.DEFAULT', fg: 'accent.foreground', name: 'Accent Elements' },
  
  // Neutral combinations
  { bg: 'neutral.DEFAULT', fg: 'neutral.foreground', name: 'Neutral Elements' },
  
  // Text on white
  { bg: 'white', fg: 'gray.500', name: 'Body Text on White' },
  { bg: 'white', fg: 'gray.600', name: 'Darker Text on White' },
  { bg: 'white', fg: 'gray.700', name: 'Headings on White' },
  
  // Links
  { bg: 'white', fg: 'primary.DEFAULT', name: 'Links on White' },
  { bg: 'white', fg: 'secondary.DEFAULT', name: 'Success Text on White' },
  { bg: 'white', fg: 'accent.DEFAULT', name: 'Accent Text on White' },
];

const issues = [];

checks.forEach(({ bg, fg, name }) => {
  const bgColor = bg.split('.').reduce((obj, key) => obj[key], colors);
  const fgColor = fg.split('.').reduce((obj, key) => obj[key], colors);
  
  const bgRgb = hexToRgb(bgColor);
  const fgRgb = hexToRgb(fgColor);
  
  if (!bgRgb || !fgRgb) {
    console.log(`❌ Error: Invalid color for ${name}`);
    return;
  }
  
  const ratio = getContrastRatio(bgRgb, fgRgb);
  const meetsAA = meetsWCAG(ratio, 'AA');
  const meetsAALarge = meetsWCAG(ratio, 'AA', true);
  const meetsAAA = meetsWCAG(ratio, 'AAA');
  
  const status = meetsAA ? '✅' : meetsAALarge ? '⚠️' : '❌';
  
  console.log(`${status} ${name}`);
  console.log(`   Background: ${bgColor} | Foreground: ${fgColor}`);
  console.log(`   Contrast Ratio: ${ratio.toFixed(2)}:1`);
  console.log(`   WCAG AA: ${meetsAA ? 'Pass' : 'Fail'} | AA Large: ${meetsAALarge ? 'Pass' : 'Fail'} | AAA: ${meetsAAA ? 'Pass' : 'Fail'}`);
  console.log('');
  
  if (!meetsAA) {
    issues.push({ name, bg: bgColor, fg: fgColor, ratio, meetsAALarge });
  }
});

// Print summary
console.log('\n📊 Summary');
console.log('==========');
console.log(`Total checks: ${checks.length}`);
console.log(`Passed: ${checks.length - issues.length}`);
console.log(`Failed: ${issues.length}`);

if (issues.length > 0) {
  console.log('\n❌ Issues Found:');
  issues.forEach(({ name, bg, fg, ratio, meetsAALarge }) => {
    console.log(`\n${name}:`);
    console.log(`  Current ratio: ${ratio.toFixed(2)}:1`);
    console.log(`  Required: 4.5:1 (AA) or 3:1 (AA Large Text)`);
    
    if (meetsAALarge) {
      console.log(`  ⚠️  Only passes for large text (18px+ or 14px+ bold)`);
    }
    
    // Suggest fixes
    const bgRgb = hexToRgb(bg);
    const targetRatio = 4.5;
    
    // Try darkening the foreground
    if (fg === '#FFFFFF') {
      console.log(`  💡 Suggestion: Consider using a darker background color`);
    } else {
      console.log(`  💡 Suggestion: Consider using a darker foreground color`);
    }
  });
} else {
  console.log('\n✅ All color combinations meet WCAG AA standards!');
}

// Additional recommendations
console.log('\n💡 Recommendations:');
console.log('1. Use gray-700 (#374151) or darker for body text on white backgrounds');
console.log('2. Ensure all interactive elements have sufficient contrast');
console.log('3. Test with actual browser tools for real-world validation');
console.log('4. Consider using tools like axe DevTools or WAVE for comprehensive testing');