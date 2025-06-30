import * as React from "react"
import { BREAKPOINTS, debounce, getResponsiveState } from "@/lib/breakpoints"

/**
 * Hook to detect mobile devices with SSR-safe implementation
 * Prevents hydration mismatches by handling server/client differences properly
 */
export function useIsMobile() {
  // Initialize with null to indicate unknown state during SSR
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    // Mark as hydrated on client
    setIsHydrated(true)
    
    // Initial check
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }
    
    checkIsMobile()

    // Create debounced resize handler for performance
    const debouncedHandler = debounce(checkIsMobile, 150)
    
    // Use both resize event and matchMedia for comprehensive coverage
    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    // Add event listeners
    window.addEventListener('resize', debouncedHandler)
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', debouncedHandler)
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // During SSR or before hydration, assume desktop to prevent layout shifts
  // This is a conservative approach that works well for most responsive designs
  if (!isHydrated) {
    return false
  }

  return isMobile ?? false
}
