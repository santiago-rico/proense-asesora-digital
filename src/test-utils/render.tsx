import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

// Create a custom wrapper that includes all necessary providers
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
};

// Custom render function that uses our AllProviders wrapper
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override the default render with our custom one
export { customRender as render };