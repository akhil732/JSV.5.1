import { useState, useEffect, useRef } from 'react';

export function useTextStreamBuffer(rawStreamText: string, isStreaming: boolean, batchIntervalMs: number = 50) {
  const [bufferedText, setBufferedText] = useState(rawStreamText);
  const queueRef = useRef<string>('');
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isStreaming) {
      setBufferedText(rawStreamText);
      queueRef.current = '';
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Accumulate incoming text into queue
    queueRef.current = rawStreamText;

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        if (queueRef.current !== bufferedText) {
          setBufferedText(queueRef.current);
        }
      }, batchIntervalMs);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [rawStreamText, isStreaming, batchIntervalMs, bufferedText]);

  return bufferedText;
}
