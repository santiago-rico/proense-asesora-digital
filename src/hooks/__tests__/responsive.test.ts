import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { 
  BREAKPOINTS,
  getCurrentBreakpoint,
  getResponsiveState,
  matchesBreakpoint,
  getMediaQuery,
  debounce,
  throttle,
} from '@/lib/breakpoints'
import { useIsMobile } from '@/hooks/use-mobile'
import { useBreakpoint, useBreakpointMatch, useResponsiveValue } from '@/hooks/use-breakpoint'
import { useMediaQuery } from '@/hooks/use-media-query'

// Mock window.matchMedia
const mockMatchMedia = vi.fn((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

// Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  matchMedia: mockMatchMedia,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

describe('Breakpoint System', () => {
  describe('BREAKPOINTS constant', () => {
    it('should have all required breakpoints', () => {
      expect(BREAKPOINTS).toHaveProperty('xs', 0)
      expect(BREAKPOINTS).toHaveProperty('sm', 640)
      expect(BREAKPOINTS).toHaveProperty('md', 768)
      expect(BREAKPOINTS).toHaveProperty('lg', 1024)
      expect(BREAKPOINTS).toHaveProperty('xl', 1280)
      expect(BREAKPOINTS).toHaveProperty('2xl', 1536)
    })
  })

  describe('getCurrentBreakpoint', () => {
    it('should return correct breakpoint for various widths', () => {
      expect(getCurrentBreakpoint(500)).toBe('xs')
      expect(getCurrentBreakpoint(640)).toBe('sm')
      expect(getCurrentBreakpoint(768)).toBe('md')
      expect(getCurrentBreakpoint(1024)).toBe('lg')
      expect(getCurrentBreakpoint(1280)).toBe('xl')
      expect(getCurrentBreakpoint(1536)).toBe('2xl')
      expect(getCurrentBreakpoint(2000)).toBe('2xl')
    })
  })

  describe('matchesBreakpoint', () => {
    it('should match breakpoint conditions correctly', () => {
      // Test 'up' direction (default)
      expect(matchesBreakpoint(800, 'md', 'up')).toBe(true)
      expect(matchesBreakpoint(700, 'md', 'up')).toBe(false)
      
      // Test 'down' direction
      expect(matchesBreakpoint(700, 'md', 'down')).toBe(true)
      expect(matchesBreakpoint(800, 'md', 'down')).toBe(false)
      
      // Test 'only' direction
      expect(matchesBreakpoint(800, 'md', 'only')).toBe(true)
      expect(matchesBreakpoint(1100, 'md', 'only')).toBe(false)
    })
  })

  describe('getMediaQuery', () => {
    it('should generate correct media query strings', () => {
      expect(getMediaQuery('md', 'up')).toBe('(min-width: 768px)')
      expect(getMediaQuery('md', 'down')).toBe('(max-width: 767px)')
      expect(getMediaQuery('md', 'only')).toBe('(min-width: 768px) and (max-width: 1023px)')
    })
  })

  describe('getResponsiveState', () => {
    it('should return comprehensive responsive state', () => {
      const state = getResponsiveState(800, 600)
      
      expect(state).toMatchObject({
        width: 800,
        height: 600,
        breakpoint: 'md',
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isTouch: expect.any(Boolean),
      })
    })
  })

  describe('debounce utility', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      // Call multiple times rapidly
      debouncedFn()
      debouncedFn()
      debouncedFn()
      
      // Should not be called immediately
      expect(mockFn).not.toHaveBeenCalled()
      
      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should be called only once
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle utility', () => {
    it('should throttle function calls', async () => {
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)
      
      // Call multiple times rapidly
      throttledFn()
      throttledFn()
      throttledFn()
      
      // Should be called immediately once
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      // Wait for throttle period
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Call again
      throttledFn()
      
      // Should be called again
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })
})

describe('Responsive Hooks', () => {
  beforeEach(() => {
    // @ts-expect-error - Setting window global for testing
    global.window = mockWindow
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useIsMobile', () => {
    it('should return false during SSR', () => {
      const { result } = renderHook(() => useIsMobile())
      
      // Should return false initially (SSR safe)
      expect(result.current).toBe(false)
    })

    it('should update based on window width after hydration', async () => {
      // Mock mobile width
      mockWindow.innerWidth = 600
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(max-width: 767px)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })

      const { result } = renderHook(() => useIsMobile())

      // Wait for useEffect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      // After hydration, should reflect actual window width
      expect(result.current).toBe(true)
    })
  })

  describe('useBreakpoint', () => {
    it('should return responsive state with hydration flag', () => {
      const { result } = renderHook(() => useBreakpoint())
      
      expect(result.current).toMatchObject({
        width: expect.any(Number),
        height: expect.any(Number),
        breakpoint: expect.any(String),
        isMobile: expect.any(Boolean),
        isTablet: expect.any(Boolean),
        isDesktop: expect.any(Boolean),
        isTouch: expect.any(Boolean),
        isHydrated: expect.any(Boolean),
      })
    })
  })

  describe('useBreakpointMatch', () => {
    it('should return boolean values based on match conditions', async () => {
      // Mock window width to be desktop
      mockWindow.innerWidth = 1200
      
      const { result: upResult } = renderHook(() => useBreakpointMatch('md', 'up'))
      const { result: downResult } = renderHook(() => useBreakpointMatch('md', 'down'))
      
      // Wait for hydration
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      // Should return boolean values
      expect(typeof upResult.current).toBe('boolean')
      expect(typeof downResult.current).toBe('boolean')
    })
  })

  describe('useResponsiveValue', () => {
    it('should return appropriate value based on breakpoint', () => {
      const values = {
        xs: 'mobile',
        md: 'tablet',
        lg: 'desktop',
      }
      
      const { result } = renderHook(() => useResponsiveValue(values))
      
      // Should return some value (exact value depends on mock window size)
      expect(typeof result.current === 'string' || result.current === undefined).toBe(true)
    })
  })

  describe('useMediaQuery', () => {
    it('should return false during SSR', () => {
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
      
      // Should return false initially (SSR safe)
      expect(result.current).toBe(false)
    })

    it('should handle matchMedia changes', async () => {
      const mockMql = {
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        media: '(min-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
      
      mockMatchMedia.mockReturnValue(mockMql)
      
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
      
      // Wait for useEffect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      // Should have added event listener
      expect(mockMql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })
})

describe('Performance Optimizations', () => {
  it('should use debouncing for resize events', () => {
    const { result } = renderHook(() => useBreakpoint())
    
    expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())
    
    unmount()
    
    // Should have called removeEventListener
    expect(mockWindow.removeEventListener).toHaveBeenCalled()
  })
})