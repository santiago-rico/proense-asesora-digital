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
 * OptimizedImage component that automatically handles modern image formats with fallbacks
 * 
 * Features:
 * - Automatically generates AVIF and WebP sources if available
 * - Prioritizes AVIF (best compression) → WebP (good compression) → Original format
 * - Falls back to original format if modern formats don't exist
 * - Implements lazy loading by default
 * - Supports all standard img attributes
 * - Uses the <picture> element for format fallbacks
 * 
 * @example
 * <OptimizedImage 
 *   src="/images/hero.avif" 
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
  const [hasAVIF, setHasAVIF] = useState(true);
  const [hasWebP, setHasWebP] = useState(true);
  const [imgError, setImgError] = useState(false);

  // Generate optimized paths (AVIF and WebP) from original image path
  const getOptimizedPath = (originalPath: string, format: 'avif' | 'webp'): string => {
    const lastDotIndex = originalPath.lastIndexOf(".");
    if (lastDotIndex === -1) return originalPath;
    
    const pathWithoutExtension = originalPath.substring(0, lastDotIndex);
    const extension = originalPath.substring(lastDotIndex + 1).toLowerCase();
    
    // Only convert common image formats to modern formats
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return `${pathWithoutExtension}.${format}`;
    }
    
    return originalPath;
  };

  const avifSrc = getOptimizedPath(src, 'avif');
  const webpSrc = getOptimizedPath(src, 'webp');
  const isAVIFCandidate = avifSrc !== src;
  const isWebPCandidate = webpSrc !== src;

  // Check if AVIF and WebP versions exist (browser will handle this automatically with picture element)
  useEffect(() => {
    // Check AVIF availability
    if (!isAVIFCandidate) {
      setHasAVIF(false);
    } else if (typeof window !== 'undefined') {
      const checkAVIF = () => {
        const avif = new Image();
        avif.onload = () => setHasAVIF(true);
        avif.onerror = () => setHasAVIF(false);
        avif.src = avifSrc;
      };
      checkAVIF();
    }

    // Check WebP availability
    if (!isWebPCandidate) {
      setHasWebP(false);
    } else if (typeof window !== 'undefined') {
      const checkWebP = () => {
        const webp = new Image();
        webp.onload = () => setHasWebP(true);
        webp.onerror = () => setHasWebP(false);
        webp.src = webpSrc;
      };
      checkWebP();
    }
  }, [avifSrc, webpSrc, isAVIFCandidate, isWebPCandidate]);

  const handleError = () => {
    setImgError(true);
  };

  // If there's an error and we have a fallback, use it
  const finalSrc = imgError && fallbackSrc ? fallbackSrc : src;

  // If browser doesn't support picture element or no modern formats are available, use regular img
  if ((!isAVIFCandidate && !isWebPCandidate) || (!hasAVIF && !hasWebP)) {
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

  // Use picture element for modern formats with fallback
  return (
    <picture>
      {/* AVIF source (highest priority - best compression) */}
      {isAVIFCandidate && hasAVIF && (
        <source
          type="image/avif"
          srcSet={avifSrc}
          sizes={sizes}
        />
      )}
      
      {/* WebP source (second priority - good compression) */}
      {isWebPCandidate && hasWebP && (
        <source
          type="image/webp"
          srcSet={webpSrc}
          sizes={sizes}
        />
      )}
      
      {/* Original format source (fallback) */}
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