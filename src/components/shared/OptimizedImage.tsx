import React, { ImgHTMLAttributes, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fallbackSrc?: string;
  sizes?: string;
  srcSet?: string;
}

/**
 * OptimizedImage component that automatically handles WebP images with fallbacks
 * 
 * Features:
 * - Automatically generates WebP source if available
 * - Falls back to original format if WebP doesn't exist
 * - Implements lazy loading by default
 * - Supports all standard img attributes
 * - Uses the <picture> element for format fallbacks
 * 
 * @example
 * <OptimizedImage 
 *   src="/images/hero.jpg" 
 *   alt="Hero image"
 *   className="w-full h-auto"
 * />
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  loading = "lazy",
  fallbackSrc,
  sizes,
  srcSet,
  ...rest
}) => {
  const [hasWebP, setHasWebP] = useState(true);
  const [imgError, setImgError] = useState(false);

  // Generate WebP path from original image path
  const getWebPPath = (originalPath: string): string => {
    const lastDotIndex = originalPath.lastIndexOf(".");
    if (lastDotIndex === -1) return originalPath;
    
    const pathWithoutExtension = originalPath.substring(0, lastDotIndex);
    const extension = originalPath.substring(lastDotIndex + 1).toLowerCase();
    
    // Only convert common image formats to WebP
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return `${pathWithoutExtension}.webp`;
    }
    
    return originalPath;
  };

  const webpSrc = getWebPPath(src);
  const isWebPCandidate = webpSrc !== src;

  // Check if WebP version exists (browser will handle this automatically with picture element)
  useEffect(() => {
    if (!isWebPCandidate) {
      setHasWebP(false);
      return;
    }

    // For client-side checking (optional - browsers handle this automatically)
    const checkWebP = () => {
      const webp = new Image();
      webp.onload = () => setHasWebP(true);
      webp.onerror = () => setHasWebP(false);
      webp.src = webpSrc;
    };

    // Only check if we're in the browser
    if (typeof window !== 'undefined') {
      checkWebP();
    }
  }, [webpSrc, isWebPCandidate]);

  const handleError = () => {
    setImgError(true);
  };

  // If there's an error and we have a fallback, use it
  const finalSrc = imgError && fallbackSrc ? fallbackSrc : src;

  // If browser doesn't support picture element or WebP isn't available, use regular img
  if (!isWebPCandidate || !hasWebP) {
    return (
      <img
        src={finalSrc}
        alt={alt}
        className={cn("object-cover", className)}
        loading={loading}
        onError={handleError}
        sizes={sizes}
        srcSet={srcSet}
        {...rest}
      />
    );
  }

  // Use picture element for WebP with fallback
  return (
    <picture>
      {/* WebP source */}
      <source
        type="image/webp"
        srcSet={webpSrc}
        sizes={sizes}
      />
      
      {/* Original format source */}
      <source
        type={`image/${src.split('.').pop()?.toLowerCase() || 'jpeg'}`}
        srcSet={src}
        sizes={sizes}
      />
      
      {/* Fallback img element */}
      <img
        src={finalSrc}
        alt={alt}
        className={cn("object-cover", className)}
        loading={loading}
        onError={handleError}
        sizes={sizes}
        srcSet={srcSet}
        {...rest}
      />
    </picture>
  );
};

export default OptimizedImage;