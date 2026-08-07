export class RateLimiter {
  private tokens: Map<string, number> = new Map();
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second
  private readonly lastRefillTime: Map<string, number> = new Map();

  constructor(capacity: number = 100, refillRate: number = 10) {
    this.capacity = capacity;
    this.refillRate = refillRate;
  }

  isAllowed(clientId: string): boolean {
    const now = Date.now() / 1000;
    const lastRefill = this.lastRefillTime.get(clientId) || now;
    const timePassed = now - lastRefill;
    const tokensToAdd = timePassed * this.refillRate;

    let tokens = this.tokens.get(clientId) ?? this.capacity;
    tokens = Math.min(tokens + tokensToAdd, this.capacity);

    if (tokens >= 1) {
      tokens -= 1;
      this.tokens.set(clientId, tokens);
      this.lastRefillTime.set(clientId, now);
      return true;
    }

    return false;
  }
}
