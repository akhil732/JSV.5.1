export enum ErrorCode {
  CHART_NOT_FOUND = 'CHART_NOT_FOUND',
  INVALID_BIRTH_DATA = 'INVALID_BIRTH_DATA',
  API_QUOTA_EXCEEDED = 'API_QUOTA_EXCEEDED',
  API_TIMEOUT = 'API_TIMEOUT',
  INVALID_QUERY_INTENT = 'INVALID_QUERY_INTENT',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface AppErrorResponse {
  code: ErrorCode;
  message: string;
  userMessage: string; // Non-technical message for frontend display
  traceId: string;
  retryable: boolean;
  retryAfter?: number;
  details?: Record<string, any>;
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public userMessage: string,
    public retryable: boolean = false,
    public retryAfter?: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}
