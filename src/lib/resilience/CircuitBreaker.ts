import { logStructured } from '../observability/requestContext';

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',          // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly timeout: number;

  constructor(failureThreshold = 5, successThreshold = 2, timeoutMs = 60000) {
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.timeout = timeoutMs;
  }

  public getState(): CircuitState {
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>, traceId: string = 'system'): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        logStructured(traceId, 'info', 'Circuit breaker transitioning to HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN. Target service temporarily disabled.');
      }
    }

    try {
      const result = await fn();
      this.onSuccess(traceId);
      return result;
    } catch (err) {
      this.onFailure(traceId);
      throw err;
    }
  }

  private onSuccess(traceId: string) {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        logStructured(traceId, 'info', 'Circuit breaker CLOSED (recovered)');
      }
    }
  }

  private onFailure(traceId: string) {
    this.lastFailureTime = Date.now();
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      logStructured(traceId, 'error', 'Circuit breaker OPEN (too many failures)', {
        failureCount: this.failureCount
      });
    }
  }
}
