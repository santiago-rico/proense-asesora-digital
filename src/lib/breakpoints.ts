/**
 * Centralized breakpoint system for consistent responsive design
 * Matches Tailwind CSS default breakpoints for compatibility
 */

// Breakpoint values in pixels
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Breakpoint names type
export type BreakpointName = keyof typeof BREAKPOINTS;

// Breakpoint values type
export type BreakpointValue = typeof BREAKPOINTS[BreakpointName];

// Media query directions
export type MediaQueryDirection = 'up' | 'down' | 'only';

// Media query options
export interface MediaQueryOptions {
  direction?: MediaQueryDirection;
  breakpoint?: BreakpointName;
  minWidth?: number;
  maxWidth?: number;
  customQuery?: string;
}

// Responsive state interface
export interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: BreakpointName;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
}

/**
 * Generate media query string for given breakpoint and direction
 */
export function getMediaQuery(
  breakpoint: BreakpointName,
  direction: MediaQueryDirection = 'up'
): string {
  const value = BREAKPOINTS[breakpoint];
  
  switch (direction) {
    case 'up': {
      return `(min-width: ${value}px)`;
    }
    case 'down': {
      return `(max-width: ${value - 1}px)`;
    }
    case 'only': {
      const nextBreakpoint = getNextBreakpoint(breakpoint);
      if (!nextBreakpoint) {
        return `(min-width: ${value}px)`;
      }
      return `(min-width: ${value}px) and (max-width: ${BREAKPOINTS[nextBreakpoint] - 1}px)`;
    }
    default: {
      return `(min-width: ${value}px)`;
    }
  }
}

/**
 * Get the next breakpoint in the sequence
 */
export function getNextBreakpoint(current: BreakpointName): BreakpointName | null {
  const breakpoints = Object.keys(BREAKPOINTS) as BreakpointName[];
  const currentIndex = breakpoints.indexOf(current);
  
  if (currentIndex === -1 || currentIndex === breakpoints.length - 1) {
    return null;
  }
  
  return breakpoints[currentIndex + 1];
}

/**
 * Get the previous breakpoint in the sequence
 */
export function getPreviousBreakpoint(current: BreakpointName): BreakpointName | null {
  const breakpoints = Object.keys(BREAKPOINTS) as BreakpointName[];
  const currentIndex = breakpoints.indexOf(current);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return breakpoints[currentIndex - 1];
}

/**
 * Determine current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number): BreakpointName {
  const breakpoints = Object.entries(BREAKPOINTS)
    .sort(([, a], [, b]) => b - a) // Sort descending
    .map(([name, value]) => ({ name: name as BreakpointName, value }));

  for (const { name, value } of breakpoints) {
    if (width >= value) {
      return name;
    }
  }

  return 'xs';
}

/**
 * Check if current width matches breakpoint condition
 */
export function matchesBreakpoint(
  width: number,
  breakpoint: BreakpointName,
  direction: MediaQueryDirection = 'up'
): boolean {
  const value = BREAKPOINTS[breakpoint];
  
  switch (direction) {
    case 'up': {
      return width >= value;
    }
    case 'down': {
      return width < value;
    }
    case 'only': {
      const nextBreakpoint = getNextBreakpoint(breakpoint);
      if (!nextBreakpoint) {
        return width >= value;
      }
      return width >= value && width < BREAKPOINTS[nextBreakpoint];
    }
    default: {
      return width >= value;
    }
  }
}

/**
 * Get responsive state from window dimensions
 */
export function getResponsiveState(width: number, height: number): ResponsiveState {
  const breakpoint = getCurrentBreakpoint(width);
  
  return {
    width,
    height,
    breakpoint,
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    isTouch: typeof window !== 'undefined' && 'ontouchstart' in window,
  };
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Export constants for backward compatibility
export const MOBILE_BREAKPOINT = BREAKPOINTS.md;
export const TABLET_BREAKPOINT = BREAKPOINTS.lg;
export const DESKTOP_BREAKPOINT = BREAKPOINTS.xl;