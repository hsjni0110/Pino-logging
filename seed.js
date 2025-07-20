// seed.js
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { faker } from '@faker-js/faker';

async function seed() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('test');
  const users = db.collection('users');
  const orders = db.collection('orders');

  await users.deleteMany({});
  await orders.deleteMany({});

  const userDocs = Array.from({ length: 1000 }).map(() => ({
    name: faker.person.fullName(),
    age: faker.number.int({ min: 10, max: 80 }),
    createdAt: new Date(),
  }));

  const orderDocs = Array.from({ length: 1000 }).map(() => ({
    itemId: faker.string.uuid(),
    amount: faker.number.int({ min: 1, max: 100 }),
    status: faker.helpers.arrayElement(['done', 'pending', 'cancelled']),
    orderedAt: new Date(),
  }));

  await users.insertMany(userDocs);
  await orders.insertMany(orderDocs);
  console.log('✅ Seed complete');
  await client.close();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});