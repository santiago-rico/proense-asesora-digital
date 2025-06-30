import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SanityImage from '../SanityImage';

// Mock the Sanity urlFor function
vi.mock('@/sanity/imageUrl', () => ({
  urlFor: (source: unknown) => ({
    width: (w: number) => ({
      height: (h?: number) => ({
        quality: (q: number) => ({
          format: (f?: string) => ({
            url: () => `https://cdn.sanity.io/images/test/${w}x${h || 'auto'}?q=${q}${f ? `&fm=${f}` : ''}`
          }),
          url: () => `https://cdn.sanity.io/images/test/${w}x${h || 'auto'}?q=${q}`
        }),
        format: (f?: string) => ({
          url: () => `https://cdn.sanity.io/images/test/${w}x${h || 'auto'}${f ? `?fm=${f}` : ''}`
        }),
        url: () => `https://cdn.sanity.io/images/test/${w}x${h || 'auto'}`
      }),
      quality: (q: number) => ({
        format: (f?: string) => ({
          url: () => `https://cdn.sanity.io/images/test/${w}?q=${q}${f ? `&fm=${f}` : ''}`
        }),
        url: () => `https://cdn.sanity.io/images/test/${w}?q=${q}`
      }),
      format: (f?: string) => ({
        url: () => `https://cdn.sanity.io/images/test/${w}${f ? `?fm=${f}` : ''}`
      }),
      url: () => `https://cdn.sanity.io/images/test/${w}`
    })
  })
}));

describe('SanityImage Component', () => {
  const mockImageSource = {
    _type: 'image',
    asset: {
      _ref: 'image-test-123',
      _type: 'reference'
    }
  };

  it('renders with basic props', () => {
    render(
      <SanityImage
        source={mockImageSource}
        alt="Test image"
      />
    );

    const picture = screen.getByRole('img');
    expect(picture).toBeInTheDocument();
    expect(picture).toHaveAttribute('alt', 'Test image');
  });

  it('generates responsive srcset with default widths', () => {
    render(
      <SanityImage
        source={mockImageSource}
        alt="Test image"
        enableWebP={false}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('srcset');
    
    const srcset = img.getAttribute('srcset');
    expect(srcset).toContain('480w');
    expect(srcset).toContain('768w'); 
    expect(srcset).toContain('1024w');
    expect(srcset).toContain('1200w');
  });

  it('uses custom widths when provided', () => {
    render(
      <SanityImage
        source={mockImageSource}
        alt="Test image"
        widths={[300, 600, 900]}
        enableWebP={false}
      />
    );

    const img = screen.getByRole('img');
    const srcset = img.getAttribute('srcset');
    expect(srcset).toContain('300w');
    expect(srcset).toContain('600w');
    expect(srcset).toContain('900w');
  });

  it('applies custom sizes attribute', () => {
    const customSizes = "(max-width: 768px) 100vw, 50vw";
    
    render(
      <SanityImage
        source={mockImageSource}
        alt="Test image"
        sizes={customSizes}
        enableWebP={false}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('sizes', customSizes);
  });

  it('enables WebP format by default with picture element', () => {
    render(
      <SanityImage
        source={mockImageSource}
        alt="Test image"
      />
    );

    // Should render a picture element when WebP is enabled
    const picture = document.querySelector('picture');
    expect(picture).toBeInTheDocument();
    
    // Should have WebP source
    const webpSource = document.querySelector('source[type="image/webp"]');
    expect(webpSource).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <SanityImage
        source={mockImageSource}
        alt="Test image"
        className="custom-class rounded-lg"
        enableWebP={false}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveClass('custom-class', 'rounded-lg', 'object-cover');
  });

  it('sets loading strategy', () => {
    render(
      <SanityImage
        source={mockImageSource}
        alt="Test image"
        loading="eager"
        enableWebP={false}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
  });
});