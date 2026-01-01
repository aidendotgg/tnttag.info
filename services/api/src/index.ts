import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import { helmet } from 'elysia-helmet';
import { UserRouter } from "./routes/UserRouter";
import { initDatabases } from "./utils/DatabaseUtils";
import { updateLeaderboards } from "./utils/StatsUtils";

export const db = await initDatabases(process.env.REDIS_URI!, process.env.MONGO_URI!, process.env.MONGO_DB!);

const app = new Elysia()
  .use(UserRouter)
  .get('/', () => {
    return {
      success: true,
    }
  })
  .onError(({ code }) => {
    if (code === 'NOT_FOUND') {
      return 'Route not found :('
    }
  })
  .use(cors({
    origin: [
      'https://tnttag.info',
      'http://localhost:3142',
      'http://127.0.0.1:3142'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }))
  .use(helmet({
    originAgentCluster: true,
    dnsPrefetchControl: true,
    permittedCrossDomainPolicies: true,
    hidePoweredBy: true,
  }))
  .listen(process.env.PORT!);

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

updateLeaderboards()
setInterval(async () => {
  updateLeaderboards()
}, 43200000)