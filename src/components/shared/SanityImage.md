# SanityImage Component

A responsive image component specifically designed for Sanity CMS images with automatic srcset generation, WebP support, and optimized performance.

## Features

- **Automatic responsive srcset generation** with configurable breakpoints
- **WebP format support** with fallback to original format
- **Configurable image quality** and dimensions
- **Lazy loading** by default with eager loading option
- **Error handling** with fallback images
- **TypeScript support** with proper Sanity image types
- **Accessibility** with required alt text
- **Performance optimized** for mobile and desktop

## Usage

### Basic Usage

```tsx
import SanityImage from '@/components/shared/SanityImage';

<SanityImage 
  source={post.featuredImage}
  alt="Featured post image"
  className="w-full h-auto rounded-lg"
/>
```

### Advanced Configuration

```tsx
<SanityImage 
  source={post.featuredImage}
  alt="Featured post image"
  className="w-full h-auto rounded-lg"
  widths={[480, 768, 1024, 1200]}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  quality={85}
  height={600}
  loading="eager"
  enableWebP={true}
  fallbackSrc="/images/placeholder.avif"
/>
```

### With Fixed Dimensions

```tsx
<SanityImage 
  source={relatedPost.featuredImage}
  alt={relatedPost.title}
  className="w-full h-32 object-cover"
  widths={[300, 400, 500]}
  sizes="400px"
  baseWidth={400}
  height={128}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `SanityImageSource` | Required | Sanity image source object |
| `alt` | `string` | Required | Alt text for accessibility |
| `className` | `string` | `undefined` | CSS classes for styling |
| `loading` | `"lazy" \| "eager"` | `"lazy"` | Loading strategy |
| `sizes` | `string` | Auto-generated | Responsive sizes attribute |
| `widths` | `number[]` | `[480, 768, 1024, 1200]` | Breakpoint widths for srcset |
| `baseWidth` | `number` | Largest width | Fallback image width |
| `height` | `number` | `undefined` | Fixed height constraint |
| `quality` | `number` | `80` | Image quality (1-100) |
| `enableWebP` | `boolean` | `true` | Enable WebP format |
| `fallbackSrc` | `string` | `undefined` | Fallback image URL |

## Default Responsive Sizes

If no `sizes` prop is provided, the component uses:
```
(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw
```

## Performance Benefits

1. **Responsive Images**: Serves appropriate image sizes based on screen resolution
2. **WebP Support**: Modern format with better compression
3. **Lazy Loading**: Images load only when needed
4. **Quality Optimization**: Balanced quality settings for performance
5. **Bandwidth Savings**: Mobile users receive smaller images

## Migration from OptimizedImage

Replace `OptimizedImage` usage with `SanityImage` for Sanity images:

```tsx
// Before
<OptimizedImage
  src={urlFor(post.featuredImage).width(800).url()}
  alt={post.title}
  sizes="(max-width: 640px) 100vw, 50vw"
/>

// After
<SanityImage
  source={post.featuredImage}
  alt={post.title}
  widths={[400, 600, 800]}
  sizes="(max-width: 640px) 100vw, 50vw"
/>
```

## Browser Support

- **Modern browsers**: Full support with WebP and responsive images
- **Legacy browsers**: Automatic fallback to original format
- **Progressive enhancement**: Works even if JavaScript is disabled