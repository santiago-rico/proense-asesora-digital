import { useState, useEffect } from 'react';

interface CsrfHookResult {
  token: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCsrf = (): CsrfHookResult => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include', // Important for cookie handling
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No CSRF token received from server');
      }

      setToken(data.token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching CSRF token:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return {
    token,
    loading,
    error,
    refetch: fetchToken,
  };
};