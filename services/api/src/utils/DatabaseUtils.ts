import { createClient, type RedisClientType } from "redis";
import { Collection, Db, MongoClient } from 'mongodb'
import { User } from "@tnttag/interfaces"

async function connectRedis(url: string) {
    const redis: RedisClientType = createClient({ url });

    redis.connect()
        .then(() => console.log('Connected to Redis'))
        .catch((err) => console.error('Redis connection error:', err));

    return redis;
}

async function connectMongoDB(uri: string, dbName: string) {
    const mongoClient = new MongoClient(uri);
    const mongoDB: Db = mongoClient.db(dbName);

    mongoClient.connect()
        .then(() => console.log(`Connected to MongoDB: ${dbName}`))
        .catch((err) => console.error('MongoDB connection error:', err));

    return mongoDB;
}

export async function initDatabases(redisUri: string, mongoUri: string, mongoDbName: string): Promise<{
    mongo: {
        userCol: Collection<User>,
    },
    redis: RedisClientType
}> {
    const redis = await connectRedis(redisUri)

    let mongoDB = await connectMongoDB(mongoUri, mongoDbName)
    let userCol = mongoDB.collection<User>("users")

    return { mongo: { userCol }, redis };
}