import { useEffect, useState, useCallback } from "react";

interface UseRetryableAsyncDataOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number) => void;
}

export function useRetryableAsyncData<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList,
  options: UseRetryableAsyncDataOptions = {}
) {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    onRetry
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [trigger, setTrigger] = useState<number>(0);

  const execute = useCallback(async () => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchWithRetry = async (attempt: number = 0): Promise<void> => {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        setError(null);
        const result = await asyncFn();

        if (isMounted) {
          setData(result);
          setError(null);
          setRetryCount(0);
        }
      } catch (err) {
        if (!isMounted || controller.signal.aborted) return;

        const errorObj = err instanceof Error ? err : new Error(String(err));
        const isRetryable =
          errorObj instanceof TypeError ||
          (err as any).code === "ETIMEDOUT" ||
          errorObj.message?.includes("fetch") ||
          errorObj.message?.includes("network");

        const shouldRetry = isRetryable && attempt < maxRetries;

        if (shouldRetry) {
          const delay = Math.min(
            initialDelayMs * Math.pow(2, attempt),
            maxDelayMs
          );
          setRetryCount(attempt + 1);
          onRetry?.(attempt + 1);

          await new Promise((resolve) => setTimeout(resolve, delay));
          if (isMounted) {
            return fetchWithRetry(attempt + 1);
          }
        } else {
          if (isMounted) {
            setError(errorObj);
            setData(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWithRetry();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [asyncFn, initialDelayMs, maxDelayMs, maxRetries, onRetry, trigger]);

  useEffect(() => {
    execute();
  }, [execute]);

  const retry = useCallback(() => {
    setRetryCount(0);
    setTrigger((prev) => prev + 1);
  }, []);

  return { data, error, isLoading, retryCount, retry };
}
