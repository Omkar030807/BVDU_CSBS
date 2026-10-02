import { useCallback, useEffect, useState } from 'react';
import { fetchHealth } from '../services/api';
import type { HealthStatus } from '../types/health';

export interface UseHealthResult {
  health: HealthStatus | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useHealth = (refreshIntervalMs = 30_000): UseHealthResult => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestNumber, setRequestNumber] = useState(0);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setRequestNumber((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadHealth = async (): Promise<void> => {
      try {
        const result = await fetchHealth(controller.signal);
        setHealth(result);
        setError(null);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return;
        }
        setHealth(null);
        setError(requestError instanceof Error ? requestError.message : 'Health check failed.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadHealth();
    const interval = window.setInterval(loadHealth, refreshIntervalMs);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [refreshIntervalMs, requestNumber]);

  return { health, isLoading, error, refresh };
};
