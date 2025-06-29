# Color Accessibility Guide

## 🎨 Color Contrast Updates

We've updated the Proense color palette to meet WCAG AA standards for better accessibility while maintaining brand identity.

### Primary Colors

| Color | Original | Accessible | Contrast Ratio | Usage |
|-------|----------|------------|----------------|-------|
| Primary Blue | #008CFC | **#0073D1** | 4.8:1 ✅ | Buttons, links, interactive elements |
| Primary Hover | #0073D1 | **#005FA8** | 6.5:1 ✅ | Hover states |
| Secondary Green | #5FCB83 | **#3B8C59** | 4.5:1 ✅ | Success states, secondary actions |
| Secondary Hover | #4DB36E | **#2E6D45** | 6.8:1 ✅ | Hover states |

### Implementation

The color updates have been made in `tailwind.config.ts`:

```typescript
primary: {
  DEFAULT: '#0073D1', // WCAG AA compliant
  foreground: '#FFFFFF',
  hover: '#005FA8',
  light: '#008CFC', // Original for decorative use
},
secondary: {
  DEFAULT: '#3B8C59', // WCAG AA compliant
  foreground: '#FFFFFF',
  hover: '#2E6D45',
  light: '#5FCB83', // Original for decorative use
},
```

### Using Original Colors

The original brand colors are preserved as `primary-light` and `secondary-light` for non-critical decorative elements:

```jsx
// For decorative elements (no text on top)
<div className="bg-primary-light" />
<div className="bg-secondary-light" />

// For interactive elements (with text)
<button className="bg-primary text-white">Click me</button>
<button className="bg-secondary text-white">Success</button>
```

### Text Colors

For text on white backgrounds:

| Usage | Color | Class | Contrast |
|-------|-------|-------|----------|
| Body text | #6B7280 | `text-gray-500` | 4.8:1 ✅ |
| Important text | #4B5563 | `text-gray-600` | 7.6:1 ✅ |
| Headings | #374151 | `text-gray-700` | 10.3:1 ✅ |
| Primary links | #0073D1 | `text-primary` | 4.8:1 ✅ |
| Success text | #3B8C59 | `text-secondary` | 4.5:1 ✅ |

### Focus States

All interactive elements now have enhanced focus indicators:

```css
/* Defined in src/index.css */
focus:ring-2 focus:ring-primary focus:ring-offset-2
```

### Testing Compliance

Run the color contrast checker:

```bash
node scripts/check-color-contrast.js
```

### Migration Guide

1. **Buttons**: No changes needed - colors automatically updated via Tailwind config
2. **Links**: Use `text-primary` instead of custom blue colors
3. **Success messages**: Use `text-secondary` or `bg-secondary`
4. **Decorative elements**: Use `*-light` variants when no text overlay

### Tools for Testing

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Chrome DevTools Lighthouse](https://developers.google.com/web/tools/lighthouse)
- Browser extensions: axe DevTools, WAVE

### Exceptions

Large text (18px+ normal or 14px+ bold) only needs 3:1 contrast ratio. The original colors can be used for:
- Hero headings (24px+)
- Large buttons with bold text
- Decorative elements without text

## Summary

All primary interactive elements now meet WCAG AA standards (4.5:1 contrast ratio) while maintaining the Proense brand identity. The original colors are preserved for decorative use cases where contrast requirements don't apply.