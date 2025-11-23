import { getThemeStyles, EmailColors, EmailSpacing } from './EmailStyles.js';

interface ButtonProps {
  href: string;
  text: string;
  variant?: 'primary' | 'secondary';
  isDarkMode?: boolean;
  fullWidth?: boolean;
}

export function Button({ href, text, variant = 'primary', isDarkMode = false, fullWidth = false }: ButtonProps): string {
  const styles = getThemeStyles(isDarkMode);
  const variantStyles = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
  const widthStyle = fullWidth ? 'width: 100%; display: block;' : '';
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" ${fullWidth ? 'width="100%"' : ''} style="margin: ${EmailSpacing.margin.sm} 0;">
      <tr>
        <td align="${fullWidth ? 'center' : 'left'}">
          <a href="${href}" target="_blank" style="${styles.button} ${variantStyles} ${widthStyle}" class="mobile-button ${variant === 'primary' ? 'darkmode-button-primary' : 'darkmode-button-secondary'}">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

interface HeadingProps {
  level: 1 | 2 | 3;
  text: string;
  isDarkMode?: boolean;
  align?: 'left' | 'center' | 'right';
}

export function Heading({ level, text, isDarkMode = false, align = 'left' }: HeadingProps): string {
  const styles = getThemeStyles(isDarkMode);
  const tag = `h${level}`;
  const style = styles[tag as keyof typeof styles];
  
  return `<${tag} style="${style} text-align: ${align};" class="darkmode-text mobile-${tag === 'h1' ? 'header' : 'text'}">${text}</${tag}>`;
}

interface ParagraphProps {
  text: string;
  isDarkMode?: boolean;
  isLast?: boolean;
  align?: 'left' | 'center' | 'right';
}

export function Paragraph({ text, isDarkMode = false, isLast = false, align = 'left' }: ParagraphProps): string {
  const styles = getThemeStyles(isDarkMode);
  const style = isLast ? styles.pLast : styles.p;
  
  return `<p style="${style} text-align: ${align};" class="darkmode-text mobile-text">${text}</p>`;
}

interface DividerProps {
  isDarkMode?: boolean;
  spacing?: 'sm' | 'md' | 'lg';
}

export function Divider({ isDarkMode = false, spacing = 'md' }: DividerProps): string {
  const styles = getThemeStyles(isDarkMode);
  const marginMap = {
    sm: EmailSpacing.margin.sm,
    md: EmailSpacing.margin.md,
    lg: EmailSpacing.margin.lg,
  };
  
  return `<hr style="${styles.divider} margin: ${marginMap[spacing]} 0;" class="darkmode-border">`;
}

interface AlertProps {
  type: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  message: string;
  isDarkMode?: boolean;
}

export function Alert({ type, title, message, isDarkMode = false }: AlertProps): string {
  const styles = getThemeStyles(isDarkMode);
  const alertStyles = {
    success: isDarkMode ? 'background-color: #1b4f1b; border: 1px solid #2d6a2d; color: #5fcb83;' : styles.alertSuccess,
    warning: isDarkMode ? 'background-color: #4a3a0f; border: 1px solid #6b5516; color: #ffc947;' : styles.alertWarning,
    danger: isDarkMode ? 'background-color: #4f1b1b; border: 1px solid #6a2d2d; color: #ff6b6b;' : styles.alertDanger,
    info: isDarkMode ? 'background-color: #1b3a4f; border: 1px solid #2d556a; color: #5fcbff;' : styles.alertInfo,
  };
  
  const icons = {
    success: '✓',
    warning: '⚠',
    danger: '✕',
    info: 'ℹ',
  };
  
  const darkModeClass = isDarkMode ? 'darkmode-alert' : '';
  
  return `
    <div style="${styles.alert} ${alertStyles[type]}" class="${darkModeClass}">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="40" valign="top" style="font-size: 24px; line-height: 1; padding-right: 10px;">
            ${icons[type]}
          </td>
          <td>
            ${title ? `<strong style="display: block; margin-bottom: 4px;">${title}</strong>` : ''}
            <span>${message}</span>
          </td>
        </tr>
      </table>
    </div>
  `;
}

interface CardProps {
  content: string;
  isDarkMode?: boolean;
  noPadding?: boolean;
}

export function Card({ content, isDarkMode = false, noPadding = false }: CardProps): string {
  const styles = getThemeStyles(isDarkMode);
  const padding = noPadding ? '' : `padding: ${EmailSpacing.padding.lg};`;
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: ${EmailSpacing.margin.md} 0;">
      <tr>
        <td style="${styles.card} ${padding}" class="darkmode-card darkmode-border mobile-padding">
          ${content}
        </td>
      </tr>
    </table>
  `;
}

interface DataTableRow {
  label: string;
  value: string;
  isHighlighted?: boolean;
}

interface DataTableProps {
  rows: DataTableRow[];
  isDarkMode?: boolean;
}

export function DataTable({ rows, isDarkMode = false }: DataTableProps): string {
  const styles = getThemeStyles(isDarkMode);
  
  const tableRows = rows.map((row, index) => {
    const cellStyle = index % 2 === 0 ? styles.tableCell : styles.tableCellAlt;
    const highlightStyle = row.isHighlighted ? `font-weight: 600;` : '';
    
    return `
      <tr>
        <td style="${styles.tableHeader} width: 40%;" class="darkmode-text darkmode-border darkmode-table-bg">
          ${row.label}
        </td>
        <td style="${cellStyle} ${highlightStyle}" class="darkmode-text darkmode-border ${index % 2 === 1 ? 'darkmode-table-alt' : 'darkmode-table-bg'}">
          ${row.value}
        </td>
      </tr>
    `;
  }).join('');
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="${styles.table}" class="responsive-table">
      ${tableRows}
    </table>
  `;
}

interface IconTextProps {
  icon: string;
  text: string;
  isDarkMode?: boolean;
}

export function IconText({ icon, text, isDarkMode = false }: IconTextProps): string {
  const styles = getThemeStyles(isDarkMode);
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: ${EmailSpacing.margin.xs} 0;">
      <tr>
        <td width="30" valign="middle" style="font-size: 20px; line-height: 1;">
          ${icon}
        </td>
        <td valign="middle">
          <span style="${styles.p} margin: 0;" class="darkmode-text">${text}</span>
        </td>
      </tr>
    </table>
  `;
}

interface ProgressStepProps {
  steps: string[];
  currentStep: number;
  isDarkMode?: boolean;
}

export function ProgressSteps({ steps, currentStep, isDarkMode = false }: ProgressStepProps): string {
  const activeColor = EmailColors.primary;
  const inactiveColor = isDarkMode ? EmailColors.dark.border : EmailColors.light.border;
  const textColor = isDarkMode ? EmailColors.dark.text : EmailColors.light.text;
  const mutedColor = isDarkMode ? EmailColors.dark.textMuted : EmailColors.light.textMuted;
  
  const stepsHtml = steps.map((step, index) => {
    const isActive = index < currentStep;
    const isCurrent = index === currentStep;
    const stepNumber = index + 1;
    
    const circleColor = isActive || isCurrent ? activeColor : inactiveColor;
    const textStyle = isCurrent ? `color: ${textColor}; font-weight: 600;` : `color: ${mutedColor};`;
    
    return `
      <td align="center" style="padding: 0 10px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${circleColor}; color: white; display: inline-block; line-height: 40px; font-weight: bold; margin-bottom: 8px;">
          ${isActive ? '✓' : stepNumber}
        </div>
        <div style="font-size: 14px; ${textStyle}" class="${isCurrent ? 'darkmode-text' : 'darkmode-muted'}">${step}</div>
      </td>
    `;
  }).join('');
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: ${EmailSpacing.margin.lg} 0;">
      <tr>
        ${stepsHtml}
      </tr>
    </table>
  `;
}

interface BulletListProps {
  items: string[];
  isDarkMode?: boolean;
  icon?: string;
}

export function BulletList({ items, isDarkMode = false, icon = '•' }: BulletListProps): string {
  const styles = getThemeStyles(isDarkMode);
  
  const listItems = items.map(item => `
    <tr>
      <td width="20" valign="top" style="padding-right: 10px; color: ${EmailColors.primary};">
        ${icon}
      </td>
      <td valign="top">
        <p style="${styles.p}" class="darkmode-text mobile-text">${item}</p>
      </td>
    </tr>
  `).join('');
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: ${EmailSpacing.margin.md} 0;">
      ${listItems}
    </table>
  `;
}

interface StatusBadgeProps {
  text: string;
  type: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  isDarkMode?: boolean;
}

export function StatusBadge({ text, type, isDarkMode = false }: StatusBadgeProps): string {
  const colors = {
    success: isDarkMode ? { bg: '#1b4f1b', text: '#5fcb83', border: '#2d6a2d' } : { bg: '#d4edda', text: '#155724', border: '#c3e6cb' },
    warning: isDarkMode ? { bg: '#4a3a0f', text: '#ffc947', border: '#6b5516' } : { bg: '#fff3cd', text: '#856404', border: '#ffeaa7' },
    danger: isDarkMode ? { bg: '#4f1b1b', text: '#ff6b6b', border: '#6a2d2d' } : { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' },
    info: isDarkMode ? { bg: '#1b3a4f', text: '#5fcbff', border: '#2d556a' } : { bg: '#d1ecf1', text: '#0c5460', border: '#bee5eb' },
    neutral: { bg: isDarkMode ? EmailColors.dark.border : EmailColors.light.border, text: isDarkMode ? EmailColors.dark.text : EmailColors.light.text, border: isDarkMode ? EmailColors.dark.border : EmailColors.light.border },
  };
  
  const color = colors[type];
  const darkModeClass = `darkmode-badge-${type}`;
  
  return `
    <span style="display: inline-block; padding: 4px 12px; background-color: ${color.bg}; color: ${color.text}; border: 1px solid ${color.border}; border-radius: 20px; font-size: 14px; font-weight: 600; line-height: 1.2;" class="${darkModeClass}">
      ${text}
    </span>
  `;
}

interface SpacerProps {
  height: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Spacer({ height }: SpacerProps): string {
  const heightMap = {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '40px',
  };
  
  return `<div style="height: ${heightMap[height]};" class="mobile-gap">&nbsp;</div>`;
}