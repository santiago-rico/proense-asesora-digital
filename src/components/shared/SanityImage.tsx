import React, { ImgHTMLAttributes } from "react";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlFor } from "@/sanity/imageUrl";
import { cn } from "@/lib/utils";

interface SanityImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /**
   * Sanity image source object
   */
  source: SanityImageSource;
  
  /**
   * Alt text for the image (required for accessibility)
   */
  alt: string;
  
  /**
   * Optional className for styling
   */
  className?: string;
  
  /**
   * Loading strategy - defaults to lazy
   */
  loading?: "lazy" | "eager";
  
  /**
   * Custom sizes attribute - if not provided, uses responsive defaults
   */
  sizes?: string;
  
  /**
   * Custom widths for srcset - defaults to [480, 768, 1024, 1200]
   */
  widths?: number[];
  
  /**
   * Base width for the fallback src - defaults to largest width
   */
  baseWidth?: number;
  
  /**
   * Optional height constraint (maintains aspect ratio)
   */
  height?: number;
  
  /**
   * Image quality (1-100) - defaults to 80 for good balance
   */
  quality?: number;
  
  /**
   * Whether to enable WebP format - defaults to true
   */
  enableWebP?: boolean;
  
  /**
   * Fallback image URL in case of error
   */
  fallbackSrc?: string;
}

/**
 * SanityImage component that automatically generates responsive srcset for Sanity images
 * 
 * Features:
 * - Automatic responsive srcset generation with multiple sizes
 * - WebP format support with fallback
 * - Configurable breakpoints and quality
 * - Proper sizes attribute for responsive behavior
 * - Lazy loading by default
 * - Error handling with fallback images
 * - TypeScript support with Sanity image types
 * 
 * @example
 * <SanityImage 
 *   source={post.featuredImage}
 *   alt="Featured post image"
 *   className="w-full h-auto rounded-lg"
 *   sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
 * />
 */
const SanityImage: React.FC<SanityImageProps> = ({
  source,
  alt,
  className,
  loading = "lazy",
  sizes,
  widths = [480, 768, 1024, 1200],
  baseWidth,
  height,
  quality = 80,
  enableWebP = true,
  fallbackSrc,
  ...rest
}) => {
  // Determine the base width (largest width by default)
  const resolvedBaseWidth = baseWidth || Math.max(...widths);
  
  // Default responsive sizes if not provided
  const defaultSizes = "(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw";
  const resolvedSizes = sizes || defaultSizes;
  
  // Generate srcset for different formats
  const generateSrcSet = (format?: 'webp') => {
    return widths
      .map(width => {
        let imageBuilder = urlFor(source).width(width).quality(quality);
        
        if (height) {
          imageBuilder = imageBuilder.height(height);
        }
        
        if (format === 'webp') {
          imageBuilder = imageBuilder.format('webp');
        }
        
        return `${imageBuilder.url()} ${width}w`;
      })
      .join(', ');
  };
  
  // Generate fallback src
  let fallbackImageBuilder = urlFor(source).width(resolvedBaseWidth).quality(quality);
  if (height) {
    fallbackImageBuilder = fallbackImageBuilder.height(height);
  }
  const fallbackImageSrc = fallbackImageBuilder.url();
  
  // Error handler
  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc && event.currentTarget.src !== fallbackSrc) {
      event.currentTarget.src = fallbackSrc;
    }
    if (rest.onError) {
      rest.onError(event);
    }
  };
  
  // If WebP is enabled, use picture element for format fallback
  if (enableWebP) {
    return (
      <picture>
        {/* WebP source with srcset */}
        <source
          type="image/webp"
          srcSet={generateSrcSet('webp')}
          sizes={resolvedSizes}
        />
        
        {/* Original format source with srcset */}
        <source
          srcSet={generateSrcSet()}
          sizes={resolvedSizes}
        />
        
        {/* Fallback img element */}
        <img
          src={fallbackImageSrc}
          alt={alt}
          className={cn("object-cover", className)}
          loading={loading}
          onError={handleError}
          {...rest}
        />
      </picture>
    );
  }
  
  // If WebP is disabled, use regular img with srcset
  return (
    <img
      src={fallbackImageSrc}
      srcSet={generateSrcSet()}
      sizes={resolvedSizes}
      alt={alt}
      className={cn("object-cover", className)}
      loading={loading}
      onError={handleError}
      {...rest}
    />
  );
};

export default SanityImage;