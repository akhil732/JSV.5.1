import { logStructured } from '../observability/requestContext';

interface ModelConfig {
  name: string;
  costPerMillionTokens: number;
  maxOutputTokens: number;
  priority: number; // 1 (primary) -> 5 (fallback)
  rateLimit: { rpm: number; tpm: number };
}

const MODEL_REGISTRY: Record<string, ModelConfig> = {
  'gemini-3.6-flash': {
    name: 'gemini-3.6-flash',
    costPerMillionTokens: 0.075,
    maxOutputTokens: 8000,
    priority: 1,
    rateLimit: { rpm: 1000, tpm: 1000000 }
  },
  'gemini-3.5-flash': {
    name: 'gemini-3.5-flash',
    costPerMillionTokens: 0.075,
    maxOutputTokens: 8000,
    priority: 2,
    rateLimit: { rpm: 1000, tpm: 1000000 }
  },
  'gemini-flash-latest': {
    name: 'gemini-flash-latest',
    costPerMillionTokens: 0.075,
    maxOutputTokens: 8000,
    priority: 3,
    rateLimit: { rpm: 1000, tpm: 1000000 }
  },
  'gemini-3.1-flash-lite': {
    name: 'gemini-3.1-flash-lite',
    costPerMillionTokens: 0.05,
    maxOutputTokens: 8000,
    priority: 4,
    rateLimit: { rpm: 1500, tpm: 1500000 }
  },
  'gemini-3.1-pro-preview': {
    name: 'gemini-3.1-pro-preview',
    costPerMillionTokens: 0.25,
    maxOutputTokens: 32000,
    priority: 5,
    rateLimit: { rpm: 600, tpm: 600000 }
  }
};

export class ModelRoutingService {
  private costBudget: number = 20.0; // $20/hour budget
  private costUsed: number = 0;
  private lastResetTime: number = Date.now();

  private getRateLimitStatus(model: string): { available: boolean; reason?: string } {
    return { available: true };
  }

  async selectModel(estimatedTokens: number, traceId: string = 'system'): Promise<string> {
    logStructured(traceId, 'info', 'Selecting model', { estimatedTokens });

    // Reset budget hourly
    if (Date.now() - this.lastResetTime > 3600000) {
      this.costUsed = 0;
      this.lastResetTime = Date.now();
    }

    const models = Object.values(MODEL_REGISTRY)
      .sort((a, b) => a.priority - b.priority);

    for (const model of models) {
      const { available, reason } = this.getRateLimitStatus(model.name);
      if (!available) {
        logStructured(traceId, 'warn', `Model unavailable: ${model.name}`, { reason });
        continue;
      }

      const estimatedCost = (estimatedTokens / 1_000_000) * model.costPerMillionTokens;
      if (this.costUsed + estimatedCost > this.costBudget) {
        logStructured(traceId, 'warn', `Cost budget exceeded`, { 
          model: model.name, 
          estimatedCost, 
          costUsed: this.costUsed 
        });
        continue;
      }

      logStructured(traceId, 'info', `Selected model`, { model: model.name, estimatedCost });
      return model.name;
    }

    return 'gemini-3.6-flash';
  }

  recordUsage(model: string, inputTokens: number, outputTokens: number, traceId: string = 'system') {
    const cfg = MODEL_REGISTRY[model] || MODEL_REGISTRY['gemini-3.6-flash'];
    const cost = ((inputTokens + outputTokens) / 1_000_000) * cfg.costPerMillionTokens;
    this.costUsed += cost;
    logStructured(traceId, 'info', 'Model usage recorded', { model, inputTokens, outputTokens, cost, costUsedTotal: this.costUsed });
  }
}
