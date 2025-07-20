// server.js
import 'dotenv/config';
import { createApp } from './src/app.js';
import { logger } from './src/config/logger.js';

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Koa server started');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 Available endpoints:');
  console.log('  GET /api/users/adults');
  console.log('  GET /api/orders/top-sales');
  console.log('  GET /api/analytics/monthly-revenue');
});