import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver for JSDOM
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  callback: ResizeObserverCallback;
  
  observe() {
    // Mock implementation
  }
  
  unobserve() {
    // Mock implementation
  }
  
  disconnect() {
    // Mock implementation
  }
};

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  
  callback: IntersectionObserverCallback;
  
  observe() {
    // Mock implementation
  }
  
  unobserve() {
    // Mock implementation
  }
  
  disconnect() {
    // Mock implementation
  }
};

// Pointer Events API polyfill
class PointerEvent extends MouseEvent {
  pointerId: number;
  
  constructor(type: string, props: PointerEventInit = {}) {
    super(type, props);
    this.pointerId = props.pointerId || 0;
  }
}

global.PointerEvent = PointerEvent as any;

// Add pointer capture methods to Element prototype
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn(() => false);
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn();
}

// Enhanced scrollIntoView mock with better coverage
Element.prototype.scrollIntoView = vi.fn(function(options?: boolean | ScrollIntoViewOptions) {
  if (typeof options === 'object') {
    // Handle ScrollIntoViewOptions
    const { behavior = 'auto', block = 'start', inline = 'nearest' } = options;
    // Mock implementation
  }
  // Mock implementation for boolean parameter
});

// Mock scroll methods for window
Object.defineProperties(window, {
  scroll: {
    value: vi.fn(),
    writable: true,
  },
  scrollTo: {
    value: vi.fn(),
    writable: true,
  },
});

// Mock HTMLElement offset properties
Object.defineProperties(HTMLElement.prototype, {
  offsetHeight: {
    get() {
      return parseFloat(window.getComputedStyle(this).height) || 0;
    },
    configurable: true,
  },
  offsetWidth: {
    get() {
      return parseFloat(window.getComputedStyle(this).width) || 0;
    },
    configurable: true,
  },
  offsetTop: {
    get() {
      return 0;
    },
    configurable: true,
  },
  offsetLeft: {
    get() {
      return 0;
    },
    configurable: true,
  },
});