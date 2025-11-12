import pino from 'pino';
import pinoHttp from 'pino-http';

const isDev = process.env.NODE_ENV !== 'production';

// Base logger with redaction of sensitive fields
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  // Pretty print in development
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  // Redact sensitive fields
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'password_hash',
      'security_code',
      'email_verification_token',
      'password_reset_token',
      'jwt_secret',
      'session_secret',
    ],
    censor: '[REDACTED]',
  },
});

// HTTP request logger middleware
export const httpLogger = pinoHttp({
  logger,
  // Generate unique request ID
  genReqId: (req, res) => {
    const existingId = req.headers['x-request-id'];
    if (existingId) return existingId;
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  // Serialize request/response
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  // Custom log level based on status code
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    if (res.statusCode >= 300) return 'info';
    return 'info';
  },
  // Auto-log requests
  autoLogging: {
    ignore: (req) => req.url === '/health', // Skip health checks
  },
});

// Attach request ID to req object for downstream use
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
