// src/config/logger.js
import pino from 'pino';

const LOG_DEST = process.env.LOG_DEST;

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname,service',
        messageFormat: '{msg}'
      }
    },
    ...(LOG_DEST ? [{
      target: 'pino/file',
      options: { destination: LOG_DEST }
    }] : [])
  ]
});

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  base: { service: 'pino-mongo-demo' }
}, transport);