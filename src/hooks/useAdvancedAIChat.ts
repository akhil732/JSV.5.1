import { useState, useRef, useCallback, useEffect } from 'react';
import {
  EnhancedGeminiConsultationService,
  ConversationMessage,
  ConsultationPersona
} from '../lib/services/EnhancedGeminiConsultationService';
import type { BirthDetails } from '../types';
import {
  computeUnifiedKPGroundTruth,
  buildSystemPrompt
} from '../components/AdvancedAITab/UnifiedKPGroundTruthEngine';

interface UseAdvancedAIChatOptions {
  birthData: BirthDetails;
  horoscopeData?: any;
  userId?: string;
  language?: 'en' | 'hi' | 'te';
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: ConversationMessage[];
}

export function useAdvancedAIChat({ birthData, horoscopeData, userId, language = 'te' }: UseAdvancedAIChatOptions) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const activePersona: ConsultationPersona = 'quick';
  const [error, setError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const service = useRef(new EnhancedGeminiConsultationService()).current;

  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    try {
      localStorage.setItem(
        `advanced_ai_sessions_${birthData.name || 'native'}`,
        JSON.stringify(updatedSessions)
      );
    } catch (e) {
      console.warn('Failed to persist sessions:', e);
    }
  };

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setStreamingText('');
  }, []);

  // Load saved sessions from localStorage on mount/profile-change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`advanced_ai_sessions_${birthData.name || 'native'}`);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatSession[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          // Load the most recent session
          const sorted = [...parsed].sort((a, b) => b.timestamp - a.timestamp);
          const active = sorted[0];
          setActiveSessionId(active.id);
          setMessages(active.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })));
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved sessions:', e);
    }

    // Fallback/Initial state: Create a new session
    const initialId = `s_${Date.now()}`;
    const initialSession: ChatSession = {
      id: initialId,
      title: 'కొత్త విశ్లేషణ (New Chat)',
      timestamp: Date.now(),
      messages: []
    };
    setSessions([initialSession]);
    setActiveSessionId(initialId);
    setMessages([]);
  }, [birthData.name]);

  // Sync active session changes whenever messages update
  useEffect(() => {
    if (!activeSessionId) return;

    setSessions(prevSessions => {
      const sessionIdx = prevSessions.findIndex(s => s.id === activeSessionId);
      if (sessionIdx === -1) return prevSessions;

      const currentSession = prevSessions[sessionIdx];
      
      // Compare messages array roughly to avoid redundant updates
      if (currentSession.messages.length === messages.length && 
          JSON.stringify(currentSession.messages.map(m => m.content)) === JSON.stringify(messages.map(m => m.content))) {
        return prevSessions;
      }

      // Automatically title the chat based on the first user message
      let title = currentSession.title;
      if (title === 'கொత్త విశ్లేషణ (New Chat)' || title === 'కొత్త విశ్లేషణ (New Chat)' || title === 'New Chat' || !title) {
        const firstUserMsg = messages.find(m => m.role === 'user');
        if (firstUserMsg) {
          title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
        }
      }

      const updatedSession: ChatSession = {
        ...currentSession,
        title,
        timestamp: Date.now(),
        messages
      };

      const nextSessions = [...prevSessions];
      nextSessions[sessionIdx] = updatedSession;
      
      saveSessionsToStorage(nextSessions);
      return nextSessions;
    });
  }, [messages, activeSessionId, birthData.name]);

  const startNewSession = useCallback(() => {
    stopGenerating();
    const newId = `s_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'కొత్త విశ్లేషణ (New Chat)',
      timestamp: Date.now(),
      messages: []
    };
    setSessions(prev => {
      const next = [newSession, ...prev];
      saveSessionsToStorage(next);
      return next;
    });
    setActiveSessionId(newId);
    setMessages([]);
  }, [stopGenerating, birthData.name]);

  const loadSession = useCallback((sessionId: string) => {
    stopGenerating();
    const found = sessions.find(s => s.id === sessionId);
    if (found) {
      setActiveSessionId(sessionId);
      setMessages(found.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    }
  }, [sessions, stopGenerating]);

  const deleteSession = useCallback((sessionId: string) => {
    stopGenerating();
    setSessions(prev => {
      const next = prev.filter(s => s.id !== sessionId);
      
      if (activeSessionId === sessionId) {
        if (next.length > 0) {
          const sorted = [...next].sort((a, b) => b.timestamp - a.timestamp);
          const active = sorted[0];
          setActiveSessionId(active.id);
          setMessages(active.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })));
        } else {
          const newId = `s_${Date.now()}`;
          const newSession: ChatSession = {
            id: newId,
            title: 'కొత్త విశ్లేషణ (New Chat)',
            timestamp: Date.now(),
            messages: []
          };
          next.push(newSession);
          setActiveSessionId(newId);
          setMessages([]);
        }
      }
      
      saveSessionsToStorage(next);
      return next;
    });
  }, [activeSessionId, stopGenerating, birthData.name]);

  const clearAllSessions = useCallback(() => {
    stopGenerating();
    const newId = `s_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'కొత్త విశ్లేషణ (New Chat)',
      timestamp: Date.now(),
      messages: []
    };
    const next = [newSession];
    setSessions(next);
    setActiveSessionId(newId);
    setMessages([]);
    saveSessionsToStorage(next);
  }, [stopGenerating, birthData.name]);

  // Abort stream on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const sendMessage = useCallback(async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: ConversationMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
      metadata: { persona: activePersona }
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setStreamingText('');
    setIsLoading(true);
    setError(null);

    let accumulated = '';

    try {
      const unifiedGroundTruth = computeUnifiedKPGroundTruth(text, birthData, horoscopeData);
      const kpGroundTruths = service.computeKPGroundTruths(text, birthData, horoscopeData);
      const consultationFacts = service.computeConsultationFacts(birthData, horoscopeData);

      const queryIntent = (service as any)['queryEngine'].recognizeIntent(text);
      const domainClassification = (service as any)['queryEngine'].classifyDomain(queryIntent);

      const systemPrompt = buildSystemPrompt(activePersona, unifiedGroundTruth, birthData.name || 'Native');

      const userMsgPayload = (service as any)['buildUserMessage'](
        text,
        consultationFacts,
        domainClassification,
        messages
      );

      const res = await fetch('/api/advanced-ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${systemPrompt}\n\n${userMsgPayload}`,
          systemInstructionOverride: systemPrompt,
          userQuery: text,
          conversationHistory: newHistory,
          persona: activePersona,
          language: 'te' // Enforce Telugu language
        }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        throw new Error(`Server streaming failed with status ${res.status}`);
      }

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (!dataStr) continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulated += parsed.text;
                  setStreamingText(accumulated);
                }
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.done) break;
              } catch (e: any) {
                // Ignore SSE parse issues
              }
            }
          }
        }
      }

      if (!accumulated.trim()) {
        const fallbackRes = await service.generateConsultationResponse({
          birthData,
          horoscopeData,
          userQuery: text,
          conversationHistory: messages,
          persona: activePersona,
          userId,
          language: 'te'
        });
        accumulated = fallbackRes.content;
      }

      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: accumulated,
        timestamp: new Date(),
        metadata: {
          queryDomain: domainClassification.domain,
          confidence: queryIntent.confidence,
          kpGroundTruths,
          persona: activePersona
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingText('');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream request aborted by user.');
        if (accumulated.trim()) {
          const partialMessage: ConversationMessage = {
            role: 'assistant',
            content: accumulated + '\n\n*(సంభాషణ నిలిపివేయబడింది)*',
            timestamp: new Date(),
            metadata: { persona: activePersona }
          };
          setMessages(prev => [...prev, partialMessage]);
        }
      } else {
        console.error('Chat stream error:', err);
        setError(err.message || 'Error generating consultation response');
        const fallbackMsg: ConversationMessage = {
          role: 'assistant',
          content: '### సమాచార గమనిక (Consultation Notice)\n\nAI ప్రతిస్పందనను పూర్తి చేయలేకపోయాము. దయచేసి నెట్‌వర్క్ కనెక్షన్ తనిఖీ చేసి, మళ్లీ ప్రయత్నించండి.',
          timestamp: new Date(),
          metadata: { persona: activePersona }
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }
    } finally {
      setIsLoading(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, activePersona, birthData, horoscopeData, userId, service]);

  const changePersona = useCallback((newPersona: ConsultationPersona) => {
    // No-op because only 'quick' (Telugu) is allowed
  }, []);

  return {
    messages,
    isLoading,
    streamingText,
    activePersona,
    error,
    sessions,
    activeSessionId,
    changePersona,
    sendMessage,
    stopGenerating,
    startNewSession,
    loadSession,
    deleteSession,
    clearAllSessions
  };
}
