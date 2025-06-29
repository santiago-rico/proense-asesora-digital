# Accessibility Guidelines

This document outlines the accessibility features and best practices implemented in the Proense Asesora Digital project.

## Implemented Accessibility Features

### 1. Skip Links
- **Location**: `src/components/shared/SkipLinks.tsx`
- **Features**:
  - "Skip to main content" link
  - "Skip to navigation" link
  - Hidden by default, visible on keyboard focus
  - Styled with proper contrast and focus indicators

### 2. ARIA Landmarks
- **Navigation**: `role="navigation"` with `aria-label="Navegación principal"`
- **Main Content**: `role="main"` with `id="main-content"`
- **Footer**: `role="contentinfo"`

### 3. Focus Indicators
Enhanced focus styles are defined in `src/index.css`:
- All interactive elements have visible focus rings
- Consistent `ring-2 ring-primary` styling
- Focus-visible pseudo-class for keyboard-only focus
- Custom focus styles for form elements

### 4. Keyboard Navigation
- All interactive elements are keyboard accessible
- Proper tab order maintained throughout the application
- Mobile menu can be opened/closed with keyboard
- Form navigation works with Tab/Shift+Tab

### 5. Screen Reader Support
- Proper heading hierarchy (h1 → h2 → h3)
- Descriptive alt text for all images
- Form labels properly associated with inputs
- Error messages announced to screen readers
- Loading states communicated via ARIA

### 6. Form Accessibility
- All form inputs have associated labels
- Proper `autocomplete` attributes for better UX
- Error messages linked via `aria-describedby`
- Required fields marked with `aria-required`
- Form validation messages are accessible

### 7. Color Contrast
- Text colors meet WCAG AA standards
- Interactive elements have sufficient contrast
- Focus indicators are clearly visible

## Testing Accessibility

### Manual Testing Checklist
1. **Keyboard Navigation**
   - [ ] Tab through all interactive elements
   - [ ] Verify skip links work correctly
   - [ ] Check focus indicators are visible
   - [ ] Ensure no keyboard traps

2. **Screen Reader Testing**
   - [ ] Test with NVDA (Windows) or VoiceOver (Mac)
   - [ ] Verify all content is announced properly
   - [ ] Check form labels and error messages
   - [ ] Ensure dynamic content updates are announced

3. **Visual Testing**
   - [ ] Zoom to 200% and verify layout remains usable
   - [ ] Check color contrast ratios
   - [ ] Verify focus indicators are visible
   - [ ] Test with Windows High Contrast mode

### Automated Testing
Run accessibility tests using:
```bash
# Install axe-core for automated testing
npm install --save-dev @axe-core/react

# Use React Testing Library with jest-axe
npm install --save-dev jest-axe
```

## Best Practices for Developers

### Images
```tsx
// Always provide descriptive alt text
<img src="/path/to/image.jpg" alt="Descriptive text about the image" />

// For decorative images, use empty alt
<img src="/decorative-icon.svg" alt="" />
```

### Forms
```tsx
// Always associate labels with inputs
<label htmlFor="email">Email</label>
<input id="email" type="email" autocomplete="email" />

// Use aria-describedby for error messages
<input id="phone" aria-describedby="phone-error" />
<span id="phone-error">Please enter a valid phone number</span>
```

### Headings
```tsx
// Maintain proper heading hierarchy
<h1>Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>
```

### Interactive Elements
```tsx
// Ensure all interactive elements are keyboard accessible
<button onClick={handleClick}>
  Click me
</button>

// For custom interactive elements, add proper roles and keyboard handlers
<div 
  role="button" 
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Custom Button
</div>
```

### Dynamic Content
```tsx
// Announce dynamic content changes
<div aria-live="polite" aria-atomic="true">
  {loading && <span>Loading...</span>}
  {error && <span>Error: {error.message}</span>}
</div>
```

## Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN ARIA Guidelines](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [React Accessibility Documentation](https://react.dev/reference/react-dom/components/common#accessibility-attributes)

## Compliance Status
This project aims to meet WCAG 2.1 Level AA compliance. Regular accessibility audits should be conducted to maintain and improve accessibility standards.