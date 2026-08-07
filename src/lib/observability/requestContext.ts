import { randomUUID } from 'crypto';

export interface RequestContext {
  traceId: string;
  userId?: string;
  startTime: number;
  endpoint: string;
  metadata: Record<string, any>;
}

const contextMap = new Map<string, RequestContext>();

export function createRequestContext(endpoint: string, userId?: string): string {
  const traceId = randomUUID();
  const context: RequestContext = {
    traceId,
    userId,
    startTime: Date.now(),
    endpoint,
    metadata: {}
  };
  contextMap.set(traceId, context);
  
  // Clean up old entries after 10 minutes to avoid memory leaks
  setTimeout(() => {
    contextMap.delete(traceId);
  }, 600000);

  return traceId;
}

export function getRequestContext(traceId: string): RequestContext | undefined {
  return contextMap.get(traceId);
}

export function logStructured(traceId: string, level: 'info' | 'warn' | 'error', message: string, data?: any) {
  const ctx = getRequestContext(traceId);
  const duration = ctx ? Date.now() - ctx.startTime : 0;
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    traceId,
    level,
    message,
    durationMs: duration,
    userId: ctx?.userId,
    endpoint: ctx?.endpoint,
    data,
    ...ctx?.metadata
  }));
}
