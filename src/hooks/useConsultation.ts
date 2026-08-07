import { useEffect, useState, useRef } from 'react';

interface UseFetchOptions {
  revalidateOnFocus?: boolean;
  dedupingInterval?: number;
  focusThrottleInterval?: number;
}

const cache = new Map<string, { data: any; error: any; time: number }>();
const subscribers = new Map<string, Set<() => void>>();

function notifySubscribers(key: string) {
  subscribers.get(key)?.forEach(cb => cb());
}

export function useConsultation(chartData: any, options: UseFetchOptions = {}) {
  const {
    revalidateOnFocus = true,
    dedupingInterval = 2000,
    focusThrottleInterval = 5000
  } = options;

  const [state, setState] = useState<{
    data: any;
    loading: boolean;
    error: any;
  }>({ data: null, loading: false, error: null });

  const keyRef = useRef(JSON.stringify(chartData || {}));
  const lastFetchRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!chartData) return;

    const key = JSON.stringify(chartData);
    keyRef.current = key;

    // Check cached data
    const cached = cache.get(key);
    if (cached && Date.now() - cached.time < dedupingInterval) {
      if (!isMountedRef.current) return;
      setState({ data: cached.data, error: cached.error, loading: false });
      return;
    }

    const now = Date.now();
    if (now - lastFetchRef.current < dedupingInterval) return;

    lastFetchRef.current = now;
    if (!isMountedRef.current) return;
    setState(s => ({ ...s, loading: true }));

    fetch('/api/advanced-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userQuery: 'Generate comprehensive astrological consultation report',
        chartSummary: JSON.stringify(chartData)
      })
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (!isMountedRef.current) return;
        cache.set(key, { data, error: null, time: Date.now() });
        setState({ data, error: null, loading: false });
        notifySubscribers(key);
      })
      .catch(error => {
        if (!isMountedRef.current) return;
        cache.set(key, { data: null, error, time: Date.now() });
        setState({ data: null, error, loading: false });
        notifySubscribers(key);
      });
  }, [JSON.stringify(chartData)]);

  // Revalidate on window focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    let lastFocusTime = Date.now();
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusTime < focusThrottleInterval) return;
      lastFocusTime = now;
      const key = keyRef.current;
      cache.delete(key);
      notifySubscribers(key);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidateOnFocus, focusThrottleInterval]);

  return state;
}
