// src/middleware/mongo.js
import { createClient } from '../config/database.js';

const MONGO_URI = process.env.MONGO_URI;

export async function mongoMiddleware(ctx, next) {
  const client = createClient(MONGO_URI);
  await client.connect();
  
  ctx.mongo = client.db('test');
  ctx.mongoClient = client;
  
  await next();
  
  await client.close();
}