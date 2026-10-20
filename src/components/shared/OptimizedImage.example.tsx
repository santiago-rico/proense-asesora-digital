/**
 * OptimizedImage Component Usage Examples
 * 
 * This file demonstrates how to use the OptimizedImage component throughout the application.
 */

import OptimizedImage from './OptimizedImage';

export const Examples = () => {
  return (
    <div className="space-y-8">
      {/* Example 1: Basic usage with automatic WebP fallback */}
      <div>
        <h3>Basic Usage</h3>
        <OptimizedImage
          src="/images/hero.avif"
          alt="Hero image"
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>

      {/* Example 2: With explicit loading behavior */}
      <div>
        <h3>Eager Loading (for above-the-fold images)</h3>
        <OptimizedImage
          src="/images/logo.avif"
          alt="Company logo"
          className="h-12 w-auto"
          loading="eager"
        />
      </div>

      {/* Example 3: Responsive images with sizes */}
      <div>
        <h3>Responsive Image</h3>
        <OptimizedImage
          src="/images/product.avif"
          alt="Product image"
          className="w-full h-auto"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Example 4: With fallback image */}
      <div>
        <h3>With Fallback</h3>
        <OptimizedImage
          src="/images/profile.avif"
          alt="User profile"
          className="w-24 h-24 rounded-full object-cover"
          fallbackSrc="/images/default-avatar.avif"
        />
      </div>

      {/* Example 5: Background-style hero image */}
      <div>
        <h3>Hero Banner with OptimizedImage</h3>
        <div className="relative h-64 overflow-hidden rounded-lg">
          <OptimizedImage
            src="/images/hero-banner.avif"
            alt="Hero banner"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h2 className="text-white text-3xl font-bold">Hero Content</h2>
          </div>
        </div>
      </div>

      {/* Example 6: Gallery with lazy loading */}
      <div>
        <h3>Image Gallery</h3>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <OptimizedImage
              key={num}
              src={`/images/gallery-${num}.avif`}
              alt={`Gallery image ${num}`}
              className="w-full h-32 object-cover rounded"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Migration Guide:
 * 
 * To migrate existing <img> tags to OptimizedImage:
 * 
 * Before:
 * <img src="/images/photo.avif" alt="Photo" className="w-full" />
 * 
 * After:
 * <OptimizedImage src="/images/photo.avif" alt="Photo" className="w-full" />
 * 
 * The component will automatically:
 * - Check for WebP version availability
 * - Use picture element with WebP source
 * - Fall back to original format if WebP is not available
 * - Apply lazy loading by default
 * - Support all standard img attributes
 * 
 * For hero/above-the-fold images, use loading="eager":
 * <OptimizedImage src="/images/hero.avif" alt="Hero" loading="eager" />
 */