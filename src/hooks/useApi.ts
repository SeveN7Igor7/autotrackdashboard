import { useState, useEffect, useCallback, useRef } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: Date;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  apiCall: () => Promise<{ data?: T; error?: string }>,
  refreshInterval = 0
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>();

  // Use useRef to maintain stable reference and prevent infinite refetch loops
  const apiCallRef = useRef(apiCall);
  apiCallRef.current = apiCall;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCallRef.current();
      
      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result.data || null);
        setLastUpdated(new Date());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Expose refetch function
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch,
  };
}