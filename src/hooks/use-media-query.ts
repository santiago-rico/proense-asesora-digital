import * as React from "react"
import { debounce } from "@/lib/breakpoints"

/**
 * Hook for custom media query handling with SSR safety
 * Provides a clean interface for responding to any CSS media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
    
    // Check if matchMedia is supported
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia(query)
    
    // Set initial state
    setMatches(mediaQuery.matches)

    // Handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  // Return false during SSR to prevent hydration mismatches
  // This assumes most media queries default to false on desktop
  if (!isHydrated) {
    return false
  }

  return matches
}

/**
 * Hook for multiple media queries with SSR safety
 * Returns an object with boolean values for each query
 */
export function useMediaQueries<T extends Record<string, string>>(
  queries: T
): Record<keyof T, boolean> & { isHydrated: boolean } {
  const [results, setResults] = React.useState<Record<keyof T, boolean>>(() => {
    // Initialize all queries as false for SSR
    const initial = {} as Record<keyof T, boolean>
    Object.keys(queries).forEach(key => {
      initial[key as keyof T] = false
    })
    return initial
  })
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
    
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    // Create media query list objects
    const mediaQueries = Object.entries(queries).map(([key, query]) => ({
      key: key as keyof T,
      mql: window.matchMedia(query as string),
    }))

    // Update results with initial values
    const initialResults = {} as Record<keyof T, boolean>
    mediaQueries.forEach(({ key, mql }) => {
      initialResults[key] = mql.matches
    })
    setResults(initialResults)

    // Create change handlers
    const handlers = mediaQueries.map(({ key, mql }) => {
      const handler = (event: MediaQueryListEvent) => {
        setResults(prev => ({
          ...prev,
          [key]: event.matches,
        }))
      }
      
      mql.addEventListener('change', handler)
      return { mql, handler }
    })

    // Cleanup function
    return () => {
      handlers.forEach(({ mql, handler }) => {
        mql.removeEventListener('change', handler)
      })
    }
  }, [queries])

  return { ...results, isHydrated }
}

/**
 * Hook for orientation detection
 */
export function useOrientation() {
  const isPortrait = useMediaQuery('(orientation: portrait)')
  const isLandscape = useMediaQuery('(orientation: landscape)')
  
  return {
    isPortrait,
    isLandscape,
    orientation: isPortrait ? 'portrait' : 'landscape',
  } as const
}

/**
 * Hook for dark mode preference detection
 */
export function usePrefersColorScheme() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const prefersLight = useMediaQuery('(prefers-color-scheme: light)')
  
  return {
    prefersDark,
    prefersLight,
    scheme: prefersDark ? 'dark' : prefersLight ? 'light' : 'no-preference',
  } as const
}

/**
 * Hook for reduced motion preference detection
 */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * Hook for high contrast preference detection
 */
export function usePrefersHighContrast() {
  return useMediaQuery('(prefers-contrast: high)')
}

/**
 * Hook for device pixel ratio detection
 */
export function useDevicePixelRatio() {
  const [pixelRatio, setPixelRatio] = React.useState(1)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
    
    if (typeof window === 'undefined') {
      return
    }

    const updatePixelRatio = () => {
      setPixelRatio(window.devicePixelRatio || 1)
    }

    // Initial update
    updatePixelRatio()

    // Create debounced handler for pixel ratio changes
    const debouncedHandler = debounce(updatePixelRatio, 150)

    // Listen for changes (rare but possible)
    window.addEventListener('resize', debouncedHandler)

    return () => {
      window.removeEventListener('resize', debouncedHandler)
    }
  }, [])

  if (!isHydrated) {
    return 1
  }

  return pixelRatio
}

/**
 * Hook for detecting touch capability
 */
export function useHasTouch() {
  const [hasTouch, setHasTouch] = React.useState(false)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
    
    if (typeof window === 'undefined') {
      return
    }

    // Check for touch capability
    const checkTouch = () => {
      setHasTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - for older browsers
        navigator.msMaxTouchPoints > 0
      )
    }

    checkTouch()
  }, [])

  if (!isHydrated) {
    return false
  }

  return hasTouch
}

/**
 * Hook for detecting hover capability
 */
export function useCanHover() {
  return useMediaQuery('(hover: hover)')
}

/**
 * Hook for comprehensive device capabilities
 */
export function useDeviceCapabilities() {
  const hasTouch = useHasTouch()
  const canHover = useCanHover()
  const prefersReducedMotion = usePrefersReducedMotion()
  const pixelRatio = useDevicePixelRatio()
  
  return {
    hasTouch,
    canHover,
    prefersReducedMotion,
    pixelRatio,
    isHighDPI: pixelRatio > 1,
    isTouchDevice: hasTouch && !canHover,
    isDesktopDevice: !hasTouch && canHover,
    isHybridDevice: hasTouch && canHover,
  } as const
}