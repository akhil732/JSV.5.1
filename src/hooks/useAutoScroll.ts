import { useEffect, useRef, useState, useCallback } from 'react';

export function useAutoScroll(dependencies: any[] = []) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userScrolledAway, setUserScrolledAway] = useState(false);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setUserScrolledAway(!isAtBottom);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!userScrolledAway && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [...dependencies, userScrolledAway]);

  const scrollToBottom = useCallback(() => {
    setUserScrolledAway(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return { scrollRef, userScrolledAway, scrollToBottom };
}
