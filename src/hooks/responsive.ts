/**
 * Responsive Utilities Index
 * Centralized exports for all responsive hooks and utilities
 */

// Breakpoint utilities
export {
  BREAKPOINTS,
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  DESKTOP_BREAKPOINT,
  getMediaQuery,
  getCurrentBreakpoint,
  getResponsiveState,
  matchesBreakpoint,
  getNextBreakpoint,
  getPreviousBreakpoint,
  debounce,
  throttle,
  type BreakpointName,
  type BreakpointValue,
  type MediaQueryDirection,
  type MediaQueryOptions,
  type ResponsiveState,
} from "@/lib/breakpoints"

// Mobile detection (legacy compatibility)
export { useIsMobile } from "./use-mobile"

// Breakpoint hooks
export {
  useBreakpoint,
  useBreakpointMatch,
  useResponsiveValue,
  useWindowDimensions,
  useIsMobileBreakpoint,
  useIsTabletBreakpoint,
  useIsDesktopBreakpoint,
  useIsLargeScreenBreakpoint,
  useIsTablet,
  useIsDesktop,
  useIsLargeScreen,
} from "./use-breakpoint"

// Media query hooks
export {
  useMediaQuery,
  useMediaQueries,
  useOrientation,
  usePrefersColorScheme,
  usePrefersReducedMotion,
  usePrefersHighContrast,
  useDevicePixelRatio,
  useHasTouch,
  useCanHover,
  useDeviceCapabilities,
} from "./use-media-query"

// Convenience re-exports for common patterns
export const responsive = {
  // Breakpoint utilities
  breakpoints: BREAKPOINTS,
  getMediaQuery,
  getCurrentBreakpoint,
  
  // Common hooks
  useIsMobile,
  useBreakpoint,
  useMediaQuery,
  useResponsiveValue,
  
  // Device detection
  useDeviceCapabilities,
  useOrientation,
  usePrefersReducedMotion,
} as const