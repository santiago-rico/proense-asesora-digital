export const EmailColors = {
  // Brand colors
  primary: '#008CFC',
  primaryLight: '#40A5FD',
  primaryDark: '#346797',
  secondary: '#5FCB83',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',
  
  // Neutral colors
  neutralGray: '#D5D6D8',
  
  // Light mode colors
  light: {
    background: '#f8f9fa',
    cardBackground: '#ffffff',
    text: '#2c3e50',
    textMuted: '#6c757d',
    border: '#e9ecef',
    tableBg: '#f8f9fa',
    tableAltBg: '#ffffff',
  },
  
  // Dark mode colors
  dark: {
    background: '#1a1a1a',
    cardBackground: '#2d2d2d',
    text: '#e0e0e0',
    textMuted: '#a0a0a0',
    border: '#404040',
    tableBg: '#2d2d2d',
    tableAltBg: '#363636',
  },
};

export const EmailFonts = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  
  // Font sizes
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
  },
  
  // Line heights
  lineHeights: {
    xs: '18px',
    sm: '21px',
    base: '24px',
    lg: '27px',
    xl: '30px',
    '2xl': '32px',
    '3xl': '36px',
    '4xl': '40px',
  },
  
  // Font weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const EmailSpacing = {
  // Padding values
  padding: {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '40px',
  },
  
  // Margin values
  margin: {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '40px',
  },
};

export const EmailBorders = {
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },
};

// Helper function to get styles based on theme
export function getThemeStyles(isDarkMode: boolean) {
  const colors = isDarkMode ? EmailColors.dark : EmailColors.light;
  
  return {
    // Typography styles
    h1: `margin: 0; font-family: ${EmailFonts.fontFamily}; font-size: ${EmailFonts.sizes['3xl']}; line-height: ${EmailFonts.lineHeights['3xl']}; font-weight: ${EmailFonts.weights.bold}; color: ${colors.text};`,
    
    h2: `margin: 0 0 ${EmailSpacing.margin.sm} 0; font-family: ${EmailFonts.fontFamily}; font-size: ${EmailFonts.sizes['2xl']}; line-height: ${EmailFonts.lineHeights['2xl']}; font-weight: ${EmailFonts.weights.semibold}; color: ${colors.text};`,
    
    h3: `margin: 0 0 ${EmailSpacing.margin.sm} 0; font-family: ${EmailFonts.fontFamily}; font-size: ${EmailFonts.sizes.xl}; line-height: ${EmailFonts.lineHeights.xl}; font-weight: ${EmailFonts.weights.semibold}; color: ${colors.text};`,
    
    p: `margin: 0 0 ${EmailSpacing.margin.sm} 0; font-family: ${EmailFonts.fontFamily}; font-size: ${EmailFonts.sizes.base}; line-height: ${EmailFonts.lineHeights.base}; color: ${colors.text};`,
    
    pLast: `margin: 0; font-family: ${EmailFonts.fontFamily}; font-size: ${EmailFonts.sizes.base}; line-height: ${EmailFonts.lineHeights.base}; color: ${colors.text};`,
    
    small: `font-family: ${EmailFonts.fontFamily}; font-size: ${EmailFonts.sizes.sm}; line-height: ${EmailFonts.lineHeights.sm}; color: ${colors.textMuted};`,
    
    // Component styles
    card: `background-color: ${colors.cardBackground}; border-radius: ${EmailBorders.radius.md}; padding: ${EmailSpacing.padding.lg}; border: ${EmailBorders.width.thin} solid ${colors.border};`,
    
    button: `display: inline-block; font-family: ${EmailFonts.fontFamily}; font-size: ${EmailFonts.sizes.base}; line-height: ${EmailFonts.lineHeights.base}; font-weight: ${EmailFonts.weights.semibold}; text-decoration: none; padding: ${EmailSpacing.padding.sm} ${EmailSpacing.padding.lg}; border-radius: ${EmailBorders.radius.md}; text-align: center;`,
    
    buttonPrimary: `background-color: ${EmailColors.primary}; color: #ffffff;`,
    
    buttonSecondary: `background-color: ${colors.border}; color: ${colors.text};`,
    
    table: `width: 100%; border-collapse: collapse; font-family: ${EmailFonts.fontFamily};`,
    
    tableHeader: `padding: ${EmailSpacing.padding.sm}; background-color: ${colors.tableBg}; border: ${EmailBorders.width.thin} solid ${colors.border}; font-weight: ${EmailFonts.weights.semibold}; text-align: left; color: ${colors.text};`,
    
    tableCell: `padding: ${EmailSpacing.padding.sm}; border: ${EmailBorders.width.thin} solid ${colors.border}; color: ${colors.text};`,
    
    tableCellAlt: `padding: ${EmailSpacing.padding.sm}; border: ${EmailBorders.width.thin} solid ${colors.border}; background-color: ${colors.tableAltBg}; color: ${colors.text};`,
    
    // Utility styles
    divider: `border: 0; height: ${EmailBorders.width.thin}; background-color: ${colors.border}; margin: ${EmailSpacing.margin.md} 0;`,
    
    alert: `padding: ${EmailSpacing.padding.sm}; border-radius: ${EmailBorders.radius.md}; margin-bottom: ${EmailSpacing.margin.sm};`,
    
    alertSuccess: `background-color: #d4edda; border: ${EmailBorders.width.thin} solid #c3e6cb; color: #155724;`,
    
    alertWarning: `background-color: #fff3cd; border: ${EmailBorders.width.thin} solid #ffeaa7; color: #856404;`,
    
    alertDanger: `background-color: #f8d7da; border: ${EmailBorders.width.thin} solid #f5c6cb; color: #721c24;`,
    
    alertInfo: `background-color: #d1ecf1; border: ${EmailBorders.width.thin} solid #bee5eb; color: #0c5460;`,
    
    // Layout styles
    container: `max-width: 600px; margin: 0 auto;`,
    
    section: `padding: ${EmailSpacing.padding.lg} 0;`,
    
    // Responsive classes
    mobileOnly: `display: none;`,
    desktopOnly: `display: table-cell;`,
  };
}

// Common responsive styles for media queries
export const responsiveStyles = `
@media screen and (max-width: 600px) {
  .mobile-padding { padding: 20px !important; }
  .mobile-padding-sm { padding: 10px !important; }
  .mobile-header { font-size: 24px !important; line-height: 32px !important; }
  .mobile-text { font-size: 16px !important; line-height: 24px !important; }
  .mobile-text-sm { font-size: 14px !important; line-height: 21px !important; }
  .mobile-button { width: 100% !important; display: block !important; }
  .mobile-hide { display: none !important; }
  .mobile-show { display: block !important; }
  .mobile-center { text-align: center !important; }
  .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
  .mobile-gap { height: 20px !important; }
  
  /* Table responsiveness */
  .responsive-table { width: 100% !important; }
  .responsive-table td { display: block !important; width: 100% !important; text-align: left !important; padding: 10px !important; }
  .responsive-table td:first-child { font-weight: bold !important; background-color: #f8f9fa !important; }
}
`;

// Dark mode styles
export const darkModeStyles = `
@media (prefers-color-scheme: dark) {
  .darkmode-bg { background-color: ${EmailColors.dark.background} !important; }
  .darkmode-card { background-color: ${EmailColors.dark.cardBackground} !important; }
  .darkmode-text { color: ${EmailColors.dark.text} !important; }
  .darkmode-muted { color: ${EmailColors.dark.textMuted} !important; }
  .darkmode-border { border-color: ${EmailColors.dark.border} !important; }
  .darkmode-table-bg { background-color: ${EmailColors.dark.tableBg} !important; }
  .darkmode-table-alt { background-color: ${EmailColors.dark.tableAltBg} !important; }
  
  /* Dark mode button adjustments */
  .darkmode-button-secondary { 
    background-color: ${EmailColors.dark.border} !important; 
    color: ${EmailColors.dark.text} !important; 
  }
}
`;