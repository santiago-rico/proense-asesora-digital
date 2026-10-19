import { useState, useEffect, useCallback } from 'react';

interface CsrfHookResult {
  token: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Fetches a token, throwing with the message the hook reports as `error`
const requestToken = async (): Promise<string> => {
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

  return data.token;
};

const errorMessageOf = (err: unknown) => (err instanceof Error ? err.message : 'Unknown error occurred');

export const useCsrf = (): CsrfHookResult => {
  const [token, setToken] = useState<string | null>(null);
  // The first fetch starts on mount, so the initial state is already "loading, no error"
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    requestToken()
      .then(newToken => {
        if (active) setToken(newToken);
      })
      .catch(err => {
        console.error('Error fetching CSRF token:', err);
        if (active) setError(errorMessageOf(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setToken(await requestToken());
    } catch (err) {
      setError(errorMessageOf(err));
      console.error('Error fetching CSRF token:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    token,
    loading,
    error,
    refetch,
  };
};
