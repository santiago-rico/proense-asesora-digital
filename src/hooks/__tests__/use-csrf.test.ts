import { describe, it, expect, vi, type Mock, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCsrf } from '../use-csrf';

// Mock global fetch
global.fetch = vi.fn();

// Store original console.error to restore after tests
const originalConsoleError = console.error;

describe('useCsrf', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    // Mock console.error to avoid noise in tests
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore original console.error
    console.error = originalConsoleError;
  });

  it('should fetch CSRF token on mount successfully', async () => {
    const mockToken = 'csrf-token-123';
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: mockToken }),
    });

    const { result } = renderHook(() => useCsrf());

    // Initially loading should be true
    expect(result.current.loading).toBe(true);
    expect(result.current.token).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    // Check final state
    expect(result.current.token).toBe(mockToken);
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('should handle network errors gracefully', async () => {
    const networkError = new Error('Network connection failed');
    (fetch as Mock).mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useCsrf());

    // Wait for the error to be handled
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBe(null);
    expect(result.current.error).toBe('Network connection failed');
    expect(result.current.loading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error fetching CSRF token:', networkError);
  });

  it('should handle HTTP error responses', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBe(null);
    expect(result.current.error).toBe('Failed to fetch CSRF token: 500');
    expect(result.current.loading).toBe(false);
  });

  it('should handle 403 forbidden responses', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBe(null);
    expect(result.current.error).toBe('Failed to fetch CSRF token: 403');
    expect(result.current.loading).toBe(false);
  });

  it('should handle missing token in response', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}), // Empty response without token
    });

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBe(null);
    expect(result.current.error).toBe('No CSRF token received from server');
    expect(result.current.loading).toBe(false);
  });

  it('should handle null token in response', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: null }),
    });

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBe(null);
    expect(result.current.error).toBe('No CSRF token received from server');
    expect(result.current.loading).toBe(false);
  });

  it('should handle undefined token in response', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: undefined }),
    });

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBe(null);
    expect(result.current.error).toBe('No CSRF token received from server');
    expect(result.current.loading).toBe(false);
  });

  it('should handle empty string token in response', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: '' }),
    });

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBe(null);
    expect(result.current.error).toBe('No CSRF token received from server');
    expect(result.current.loading).toBe(false);
  });

  it('should handle malformed JSON response', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Unexpected token in JSON');
      },
    });

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBe(null);
    expect(result.current.error).toBe('Unexpected token in JSON');
    expect(result.current.loading).toBe(false);
  });

  it('should provide refetch functionality', async () => {
    const firstToken = 'csrf-token-123';
    const secondToken = 'csrf-token-456';

    // First call returns first token
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: firstToken }),
    });

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBe(firstToken);

    // Second call returns second token
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: secondToken }),
    });

    // Trigger refetch
    await result.current.refetch();

    // Wait for the state to update after refetch
    await waitFor(() => {
      expect(result.current.token).toBe(secondToken);
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle refetch after error', async () => {
    const validToken = 'csrf-token-123';

    // First call fails
    (fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBe(null);
    expect(result.current.error).toBe('Network error');

    // Second call succeeds
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: validToken }),
    });

    // Trigger refetch
    await result.current.refetch();

    // Wait for the state to update after successful refetch
    await waitFor(() => {
      expect(result.current.token).toBe(validToken);
      expect(result.current.error).toBe(null);
    });

    expect(result.current.loading).toBe(false);
  });

  it('should clear error state when refetching', async () => {
    // First call fails
    (fetch as Mock).mockRejectedValueOnce(new Error('Initial error'));

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.error).toBe('Initial error');
    });

    // Second call also fails but with different error
    (fetch as Mock).mockRejectedValueOnce(new Error('Second error'));

    // Trigger refetch
    await result.current.refetch();

    // Wait for the error state to update after refetch
    await waitFor(() => {
      expect(result.current.error).toBe('Second error');
    });
  });

  it('should set loading state correctly during refetch', async () => {
    const token = 'csrf-token-123';

    // First call
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token }),
    });

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock a delayed response for refetch
    let resolvePromise: (value: unknown) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (fetch as Mock).mockReturnValueOnce(delayedPromise);

    // Start refetch - should set loading to true
    const refetchPromise = result.current.refetch();
    
    // Wait for loading state to become true
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
    
    expect(result.current.error).toBe(null);

    // Resolve the delayed promise
    resolvePromise!({
      ok: true,
      status: 200,
      json: async () => ({ token: 'new-token' }),
    });

    await refetchPromise;

    // Should not be loading after completion
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle non-Error thrown objects', async () => {
    const thrownString = 'String error';
    (fetch as Mock).mockRejectedValueOnce(thrownString);

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBe(null);
    expect(result.current.error).toBe('Unknown error occurred');
    expect(result.current.loading).toBe(false);
  });

  it('should use proper HTTP method and headers', async () => {
    const token = 'csrf-token-123';
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token }),
    });

    renderHook(() => useCsrf());

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Verify the exact fetch call parameters for security
    expect(fetch).toHaveBeenCalledWith('/api/csrf-token', {
      method: 'GET',
      credentials: 'include', // Critical for cookie-based CSRF protection
      headers: {
        'Accept': 'application/json',
      },
    });
  });

  it('should handle concurrent refetch calls', async () => {
    const token = 'csrf-token-123';

    // Initial successful fetch
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token }),
    });

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Setup mock for concurrent calls
    const resolvers: Array<(value: unknown) => void> = [];
    
    (fetch as Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        resolvers.push(resolve);
      });
    });

    // Make two concurrent refetch calls
    const promise1 = result.current.refetch();
    const promise2 = result.current.refetch();

    // Resolve both promises
    resolvers.forEach((resolve, index) => {
      resolve({
        ok: true,
        status: 200,
        json: async () => ({ token: `token-${index + 1}` }),
      });
    });

    await Promise.all([promise1, promise2]);

    // Should have made two separate fetch calls
    expect(fetch).toHaveBeenCalledTimes(3); // 1 initial + 2 refetch calls
  });

  it('should maintain loading state properly during sequential refetches', async () => {
    const token = 'csrf-token-123';

    // Initial fetch
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token }),
    });

    const { result } = renderHook(() => useCsrf());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // First refetch
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: 'token-2' }),
    });

    await result.current.refetch();
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.token).toBe('token-2');
    });

    // Second refetch
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: 'token-3' }),
    });

    await result.current.refetch();
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.token).toBe('token-3');
    });
  });
});