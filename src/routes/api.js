import Router from '@koa/router';

const router = new Router();

router.get('/api/users/adults', async (ctx) => {
  const result = await ctx.mongo.collection('users').find({ age: { $gte: 18 } }).toArray();
  ctx.body = { data: result, count: result.length };
});

router.get('/api/orders/top-sales', async (ctx) => {
  const result = await ctx.mongo.collection('orders').aggregate([
    { $match: { status: 'done' } },
    { $group: { _id: '$itemId', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 5 }
  ]).toArray();
  
  ctx.body = { data: result, count: result.length };
});

router.get('/api/analytics/monthly-revenue', async (ctx) => {
  const result = await ctx.mongo.collection('orders').aggregate([
    { $match: { status: 'completed', createdAt: { $gte: new Date('2024-01-01') } } },
    { $group: {
        _id: { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$amount' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]).toArray();
  
  ctx.body = { data: result, count: result.length };
});

export { router };