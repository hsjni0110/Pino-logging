// src/app.js
import Koa from 'koa';
import { als } from './config/database.js';
import { logger } from './config/logger.js';
import { mongoMiddleware } from './middleware/mongo.js';
import { router } from './routes/api.js';

export function createApp() {
  const app = new Koa();

  // 요청 ID 생성 미들웨어
  app.use(async (ctx, next) => {
    const reqId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    ctx.state.reqId = reqId;
    
    await als.run({ reqId }, async () => {
      logger.info({ reqId, path: ctx.path }, 'Request started');
      await next();
      logger.info({ reqId, status: ctx.status }, 'Request completed');
    });
  });

  // MongoDB 미들웨어
  app.use(mongoMiddleware);

  // API 라우트
  app.use(router.routes());

  return app;
}