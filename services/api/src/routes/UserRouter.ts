import { Elysia, t, status } from "elysia";
import { normalizeUUID } from "@tnttag/formatting";
import type { User, Status, NameChange } from "@tnttag/types";
import { tntFetch } from "@tnttag/fetch";
import { getSeraph, getStats } from "../utils/StatsUtils";
import type { RedisJSON } from "redis";
import { mongo, redis } from "../utils/DatabaseUtils";
import { UUIDPlugin } from "../plugins/UUIDPlugin";

export const UserRouter = new Elysia({ prefix: "/user" })
	.use(UUIDPlugin())
	.post('/', async ({ uuid }) => {
		let player = await getStats(uuid)

		if (!player) {
			return status(404, {
				success: false,
				error: "Player not found",
				code: 2
			})
		}

		return {
			success: true,
			...player
		}
	}, {
		body: t.Object({
			username: t.Optional(t.String({ format: 'regex', pattern: '^[a-zA-Z0-9_]*$', maxLength: 16, minLength: 2 })),
			_id: t.Optional(t.String())
		}),
		normalizeUUID: true
	})

	.post('/status', async ({ uuid }) => {
		let cache = await redis.json.GET(`tntuser:status:${uuid}`) as Status

		if (cache) {
			return {
				success: true,
				...cache
			}
		}

		let statusReq = await tntFetch(`https://api.hypixel.net/v2/status?key=${process.env.HYPIXEL_API_KEY}&uuid=${uuid}`)

		if (!statusReq.res?.ok || !statusReq.data) {
			return status(500, {
				success: false,
				error: "Failed to fetch status data"
			})
		}

		let statusData = statusReq.data.session
		if (!statusData) return status(404, { success: false, error: "No status data found" })

		let online = statusData.online ?? false
		let playing = statusData.gameType ?? "None"
		let mode = statusData.mode ?? "None"
		let map = statusData.map ?? "None"

		let statusInfo: Status = {
			online,
			playing,
			mode,
			map
		}

		await redis.json.SET(`tntuser:status:${uuid}`, '.', statusInfo as unknown as RedisJSON)
		await redis.expire(`tntuser:status:${uuid}`, 180)

		return {
			success: true,
			...statusInfo
		}
	}, {
		body: t.Object({
			_id: t.String()
		}),
		normalizeUUID: true
	})

	.post('/names', async ({ uuid }) => {
		let cache = await redis.json.GET(`tntuser:names:${uuid}`) as NameChange[]

		if (cache) {
			return {
				success: true,
				names: cache
			}
		}

		let nameReq = await tntFetch(`https://api.antisniper.net/v2/mojang?key=${process.env.ANTISNIPER_API_KEY}&uuid=${uuid}`)

		if (!nameReq.res?.ok || !nameReq.data) {
			return status(500, {
				success: false,
				error: "Failed to fetch name data"
			})
		}

		let dedupedNames: NameChange[] = nameReq.data.name_changes.filter((item: NameChange, i: number, arr: NameChange[]) => i === 0 || item.name !== arr[i - 1]!.name)

		await redis.json.SET(`tntuser:names:${uuid}`, '.', dedupedNames as unknown as RedisJSON)
		await redis.expire(`tntuser:names:${uuid}`, 3600)

		return {
			success: true,
			names: dedupedNames
		}
	}, {
		body: t.Object({
			_id: t.String()
		}),
		normalizeUUID: true
	})

	.post('/seraph', async ({ uuid }) => {
		let blacklistInfo = await getSeraph(uuid)

		if (!blacklistInfo) {
			return status(404, {
				success: false,
				error: "Player not found or not blacklisted"
			})
		}

		return {
			success: true,
			tag: blacklistInfo,
		}
	}, {
		body: t.Object({
			_id: t.String()
		}),
		normalizeUUID: true
	})

	.get('/leaderboard', async () => {
		let cache = await redis.json.GET('tntuser:leaderboards') as {
			winsLeaderboard: User[],
			killsLeaderboard: User[],
			deathsLeaderboard: User[],
			powerupsLeaderboard: User[],
			tagsLeaderboard: User[]
		}

		if (cache) {
			return {
				success: true,
				...cache
			}
		}

		const [winsLeaderboard, killsLeaderboard, deathsLeaderboard, powerupsLeaderboard, tagsLeaderboard] = await Promise.all([
			mongo.userCol.find({}, { projection: { _id: 1, username: 1, wins: 1, rank: 1, rankColor: 1, plusColor: 1 } }).sort({ wins: -1 }).limit(1000).toArray(),
			mongo.userCol.find({}, { projection: { _id: 1, username: 1, kills: 1, wins: 1, rank: 1, rankColor: 1, plusColor: 1 } }).sort({ kills: -1 }).limit(1000).toArray(),
			mongo.userCol.find({}, { projection: { _id: 1, username: 1, deaths: 1, wins: 1, rank: 1, rankColor: 1, plusColor: 1 } }).sort({ deaths: -1 }).limit(1000).toArray(),
			mongo.userCol.find({}, { projection: { _id: 1, username: 1, powerups: 1, wins: 1, rank: 1, rankColor: 1, plusColor: 1 } }).sort({ powerups: -1 }).limit(1000).toArray(),
			mongo.userCol.find({}, { projection: { _id: 1, username: 1, tags: 1, wins: 1, rank: 1, rankColor: 1, plusColor: 1 } }).sort({ tags: -1 }).limit(1000).toArray()
		]);

		let leaderboards = {
			winsLeaderboard,
			killsLeaderboard,
			deathsLeaderboard,
			powerupsLeaderboard,
			tagsLeaderboard
		}

		await redis.json.SET('tntuser:leaderboards', '.', leaderboards as unknown as RedisJSON)
		await redis.expire('tntuser:leaderboards', 300)

		return {
			success: true,
			...leaderboards
		}
	})

	.get('/autocomplete', async ({ query }) => {
		const { name } = query

		let players = await mongo.userCol.find({
			normalizedUsername: { $regex: `^${name.toLocaleLowerCase()}` }
		}, { projection: { _id: 1, username: 1 } }).sort({ wins: -1 }).toArray()

		players.sort((a, b) => a.username.toUpperCase() == name.toUpperCase() ? -1 : b.username.toUpperCase() == name.toUpperCase() ? 1 : 0)

		return {
			success: true,
			players
		}
	}, {
		query: t.Object({
			name: t.String()
		})
	})

	.get(`/count`, async () => {
		let cache = await redis.get(`tntuser:count`) as string

		if (cache) {
			return {
				success: true,
				count: parseInt(cache),
			}
		}

		const userCount = await mongo.userCol.countDocuments()

		await redis.set(`tntuser:count`, userCount.toString(), { EX: 300 })

		return {
			success: true,
			count: userCount
		}
	})

	.post('/multiple', async ({ body }) => {
		const { _id } = body

		let uuidList = []
		for (const uuid of _id) {
			uuidList.push(normalizeUUID(uuid))
		}

		const requests = uuidList.map(async (uuid) => {
			let player = await getStats(uuid)
			let blacklistInfo = await getSeraph(uuid)

			if (player) {
				return { uuid: uuid, wins: player.wins, tag: blacklistInfo }
			} else {
				return { uuid: uuid, wins: 0, tag: blacklistInfo }
			}
		})

		let response = await Promise.all(requests);

		return {
			success: true,
			users: response
		}
	}, {
		body: t.Object({
			_id: t.Array(t.String(), { maxItems: 36 })
		})
	})