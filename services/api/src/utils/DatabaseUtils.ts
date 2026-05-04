import { createClient, type RedisClientType } from "redis";
import { Db, MongoClient } from 'mongodb'
import type { Database } from '@tnttag/types';

async function connectRedis(): Promise<RedisClientType> {
    const redis: RedisClientType = createClient({ url: process.env.REDIS_URI });

    await redis.connect()
        .then(() => console.log('Connected to Redis'))
        .catch((err) => console.error('Redis connection error:', err));

    return redis;
}

async function connectMongoDB(): Promise<Database> {
    const mongoClient = new MongoClient(process.env.MONGO_URI!);
    const db: Db = mongoClient.db(process.env.MONGO_DB!);

    await mongoClient.connect()
        .then(() => console.log(`Connected to MongoDB: ${db.databaseName}`))
        .catch((err) => console.error('MongoDB connection error:', err));

    return {
        userCol: db.collection('users'),
    }
}

export const mongo = await connectMongoDB();
export const redis = await connectRedis();

export { MongoServerError } from 'mongodb';