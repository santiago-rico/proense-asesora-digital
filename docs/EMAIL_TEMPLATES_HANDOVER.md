# Email Templates System - Handover Document

## Overview
This document provides comprehensive context about the email template system implemented for Proense Asesora Digital. The system transforms basic inline HTML emails into a professional, maintainable, and visually appealing email communication system.

## Project Context
- **Company**: Proense Asesora Digital (Colombian insurance advisory company)
- **Purpose**: Improve visual appearance of transactional emails
- **Previous State**: Basic inline HTML strings in API endpoints
- **Current State**: Centralized template system with reusable components

## Architecture Overview

### Directory Structure
```
src/utils/email-templates/
├── BaseTemplate.ts       # Main wrapper with header/footer
├── EmailStyles.ts        # Centralized style constants
├── EmailComponents.ts    # Reusable UI components
├── LeadTemplate.ts       # Lead generation emails
├── InsuranceApplicationTemplate.ts  # Insurance applications
├── CancellationRequestTemplate.ts   # Cancellation requests
└── ModificationRequestTemplate.ts    # Modification requests
```

### API Endpoints Using Templates
1. `/api/send-email.ts` → Uses `LeadTemplate`
2. `/api/send-insurance-application-email.ts` → Uses `InsuranceApplicationTemplate`
3. `/api/send-cancellation-request.ts` → Uses `CancellationRequestTemplate`
4. `/api/send-modification-request.ts` → Uses `ModificationRequestTemplate`

## Core Components

### BaseTemplate.ts
- **Purpose**: Wraps all emails with consistent header/footer
- **Features**:
  - Responsive design with mobile breakpoints
  - Dark mode support
  - Preheader text support
  - Social media links in footer
  - Company branding

### EmailStyles.ts
Exports several key elements:
- **EmailColors**: Brand colors for light/dark modes
- **EmailFonts**: Typography system
- **EmailSpacing**: Consistent padding/margins
- **EmailBorders**: Border styles and radii
- **getThemeStyles()**: Returns theme-aware styles
- **responsiveStyles**: Media query styles
- **darkModeStyles**: Dark mode overrides

### EmailComponents.ts
Reusable components (12 total):
1. **Button**: Primary/secondary CTAs with full-width option
2. **Heading**: H1, H2, H3 with responsive sizing
3. **Paragraph**: Text blocks with alignment options
4. **Divider**: Horizontal separators
5. **Alert**: Success/warning/danger/info alerts
6. **Card**: Content containers with optional padding
7. **DataTable**: Responsive data display
8. **IconText**: Icon + text combinations
9. **ProgressSteps**: Multi-step progress indicators
10. **BulletList**: Custom bullet lists
11. **StatusBadge**: Status indicators
12. **Spacer**: Vertical spacing utility

## Template Patterns

### Common Template Structure
```typescript
interface TemplateProps {
  data: SpecificDataType;
  attachedFiles?: AttachedFiles;
  isUserEmail: boolean;  // Differentiates user vs agent emails
  isDarkMode?: boolean;
}
```

### Email Types
Each template generates two versions:
1. **User Email**: Friendly, action-oriented for customers
2. **Agent Email**: Detailed, process-focused for internal team

## Design Principles

### Visual Design
- **Mobile-first**: All designs work on mobile devices
- **Progressive Enhancement**: Graceful degradation for older clients
- **Brand Consistency**: Uses Proense colors (#003366 primary)
- **Accessibility**: High contrast ratios, semantic HTML

### Technical Considerations
- **Inline CSS**: Better email client compatibility
- **Table-based Layout**: Maximum compatibility
- **Fallback Styles**: Works in Outlook, Gmail, Apple Mail
- **Image Handling**: Alt text, proper sizing

## Key Features Implemented

### 1. Responsive Design
- Fluid layouts adapt to screen size
- Mobile-specific classes (`.mobile-padding`, `.mobile-text`)
- Stack columns on small screens

### 2. Dark Mode Support
- Automatic detection via `prefers-color-scheme`
- Fallback classes for manual override
- Separate color schemes for light/dark

### 3. Interactive Elements
- Clear CTAs with hover states
- Status badges for quick scanning
- Progress indicators for multi-step processes

### 4. Data Presentation
- Responsive tables with alternating rows
- Highlighted important fields
- File attachment indicators

## Integration Points

### Email Service
- **Provider**: Brevo (formerly Sendinblue)
- **Send Function**: `sendTransactionalEmail()` in `/src/utils/brevo.ts`
- **Configuration**: Environment variables for API keys

### Security Features
- CSRF protection on all endpoints
- XSS prevention via DOMPurify
- Input sanitization before template rendering
- File upload validation

## Development Guidelines

### Adding New Templates
1. Create new file in `/src/utils/email-templates/`
2. Import `BaseTemplate` and needed components
3. Define data interface
4. Create separate content for user/agent emails
5. Wrap content in `BaseTemplate`

### Adding New Components
1. Add to `EmailComponents.ts`
2. Follow existing component patterns
3. Include dark mode support
4. Add responsive styles

### Modifying Styles
1. Update constants in `EmailStyles.ts`
2. Test in multiple email clients
3. Verify dark mode appearance
4. Check mobile responsiveness

## Testing Recommendations

### Email Clients to Test
- Gmail (Web, iOS, Android)
- Outlook (2016+, Web, Mobile)
- Apple Mail (macOS, iOS)
- Yahoo Mail
- Dark mode in all clients

### Tools
- Litmus or Email on Acid for cross-client testing
- Browser DevTools for responsive testing
- Real devices for mobile testing

## Future Enhancements

### Potential Improvements
1. **Template Variables**: Dynamic content replacement system
2. **Localization**: Multi-language support (Spanish/English)
3. **A/B Testing**: Template variant system
4. **Analytics**: Email open/click tracking
5. **Preview Mode**: In-browser template preview
6. **Template Builder**: Visual email builder interface

### Technical Debt
- Consider CSS-in-JS to inline styles automatically
- Add unit tests for components
- Create email preview tool
- Document color contrast ratios

## Common Issues & Solutions

### Problem: Outlook Rendering
- Solution: Use conditional comments `<!--[if mso]>`
- Already implemented in BaseTemplate

### Problem: Gmail Clipping
- Solution: Keep email size under 102KB
- Monitor template size as content grows

### Problem: Dark Mode Colors
- Solution: Use both media queries and classes
- Test with forced dark mode

## Environment Variables Required
```
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=
AGENT_EMAIL=
LEAD_NOTIFICATION_EMAIL=
```

## Quick Start for New Features

### Adding a New Email Type
```typescript
// 1. Create template file
// src/utils/email-templates/NewTemplate.ts

import { BaseTemplate } from './BaseTemplate.js';
import { Heading, Paragraph, Card } from './EmailComponents.js';

interface NewTemplateData {
  // Define your data structure
}

export function NewTemplate(data: NewTemplateData, isDarkMode = false) {
  const content = `
    ${Heading({ level: 1, text: 'Title', isDarkMode })}
    ${Paragraph({ text: 'Content', isDarkMode })}
  `;
  
  return BaseTemplate({ content, isDarkMode });
}

// 2. Import in API endpoint
import { NewTemplate } from '../src/utils/email-templates/NewTemplate.js';

// 3. Use in email generation
const htmlContent = NewTemplate(data);
```

## Maintenance Notes
- Templates use `.js` extensions in imports for ESM compatibility
- All user inputs must be sanitized before template rendering
- Keep preheader text under 100 characters
- Test any style changes across all templates

This system provides a solid foundation for professional email communications while maintaining flexibility for future enhancements.