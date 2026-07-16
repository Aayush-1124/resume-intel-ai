import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Pino configuration for structured logging
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Use pino-pretty only in development for readability, otherwise emit JSON for observability tools
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export default logger;
