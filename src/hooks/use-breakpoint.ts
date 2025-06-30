import * as React from "react"
import {
  BREAKPOINTS,
  BreakpointName,
  MediaQueryDirection,
  ResponsiveState,
  getCurrentBreakpoint,
  getResponsiveState,
  matchesBreakpoint,
  debounce,
} from "@/lib/breakpoints"

/**
 * Hook to get current breakpoint information
 * Returns comprehensive responsive state with SSR safety
 */
export function useBreakpoint(): ResponsiveState & { isHydrated: boolean } {
  const [state, setState] = React.useState<ResponsiveState>(() => ({
    width: 0,
    height: 0,
    breakpoint: 'lg' as BreakpointName, // Default to desktop for SSR
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
  }))
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
    
    const updateState = () => {
      setState(getResponsiveState(window.innerWidth, window.innerHeight))
    }

    // Initial update
    updateState()

    // Create debounced handler for performance
    const debouncedHandler = debounce(updateState, 150)

    // Add resize listener
    window.addEventListener('resize', debouncedHandler)

    return () => {
      window.removeEventListener('resize', debouncedHandler)
    }
  }, [])

  return { ...state, isHydrated }
}

/**
 * Hook to check if current viewport matches specific breakpoint condition
 */
export function useBreakpointMatch(
  breakpoint: BreakpointName,
  direction: MediaQueryDirection = 'up'
): boolean {
  const [matches, setMatches] = React.useState(false)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
    
    const checkMatch = () => {
      setMatches(matchesBreakpoint(window.innerWidth, breakpoint, direction))
    }

    // Initial check
    checkMatch()

    // Create debounced handler
    const debouncedHandler = debounce(checkMatch, 150)

    // Add resize listener
    window.addEventListener('resize', debouncedHandler)

    return () => {
      window.removeEventListener('resize', debouncedHandler)
    }
  }, [breakpoint, direction])

  // Return conservative default during SSR
  if (!isHydrated) {
    // Default assumptions for SSR based on common patterns
    switch (direction) {
      case 'up':
        return breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md'
      case 'down':
        return false
      case 'only':
        return breakpoint === 'lg'
      default:
        return breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md'
    }
  }

  return matches
}

/**
 * Hook for responsive values based on breakpoints
 * Returns different values based on current breakpoint
 */
export function useResponsiveValue<T>(values: Partial<Record<BreakpointName, T>>): T | undefined {
  const { breakpoint, isHydrated } = useBreakpoint()

  // During SSR, use largest available value or undefined
  if (!isHydrated) {
    const breakpoints: BreakpointName[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
    for (const bp of breakpoints) {
      if (values[bp] !== undefined) {
        return values[bp]
      }
    }
    return undefined
  }

  // Find the best matching value by checking current and smaller breakpoints
  const breakpoints: BreakpointName[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
  const currentIndex = breakpoints.indexOf(breakpoint)

  for (let i = currentIndex; i < breakpoints.length; i++) {
    const bp = breakpoints[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }

  return undefined
}

/**
 * Hook to get window dimensions with SSR safety
 */
export function useWindowDimensions() {
  const [dimensions, setDimensions] = React.useState({
    width: 0,
    height: 0,
  })
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
    
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Initial update
    updateDimensions()

    // Create debounced handler
    const debouncedHandler = debounce(updateDimensions, 150)

    // Add resize listener
    window.addEventListener('resize', debouncedHandler)

    return () => {
      window.removeEventListener('resize', debouncedHandler)
    }
  }, [])

  return { ...dimensions, isHydrated }
}

/**
 * Convenience hooks for common breakpoint checks
 */
export function useIsMobileBreakpoint() {
  return useBreakpointMatch('md', 'down')
}

export function useIsTabletBreakpoint() {
  const isTabletUp = useBreakpointMatch('md', 'up')
  const isTabletDown = useBreakpointMatch('lg', 'down')
  return isTabletUp && isTabletDown
}

export function useIsDesktopBreakpoint() {
  return useBreakpointMatch('lg', 'up')
}

export function useIsLargeScreenBreakpoint() {
  return useBreakpointMatch('xl', 'up')
}

// Keep the old exports for backward compatibility
export const useIsTablet = useIsTabletBreakpoint
export const useIsDesktop = useIsDesktopBreakpoint
export const useIsLargeScreen = useIsLargeScreenBreakpoint