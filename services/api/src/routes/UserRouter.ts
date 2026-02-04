import Elysia, { t } from "elysia";
import { ip } from "elysia-ip";
import { normalizeUUID } from "@tnttag/formatting";
import { User, Status, NameChange } from "@tnttag/interfaces";
import { tntFetch } from "@tnttag/fetch";
import { getStats } from "../utils/StatsUtils";
import { RedisJSON } from "redis";
import { db } from "..";

export const UserRouter = new Elysia({ prefix: "/user" })
	.use(ip())

	.post('/', async ({ body, status }) => {
		let { username, _id } = body as { username?: string; _id?: string }

		let uuid: any
		if (_id) {
			uuid = normalizeUUID(_id)
		} else if (username) {
			let uuidReq = await tntFetch(`https://playerdb.co/api/player/minecraft/${username}`, { headers: { "User-Agent": "TNTTag.info (+https://tnttag.info)" } })

			if (!uuidReq.res?.ok || !uuidReq.data) {
				return status(404, {
					success: false,
					error: "Player not found",
					code: 1
				})
			}

			uuid = normalizeUUID(uuidReq.data.data.player.id)
		} else {
			return status(400, {
				success: false,
				error: "No username or uuid provided"
			})
		}

		let player = await getStats(uuid)

		if (!player) {
			return status(404, {
				success: false,
				error: "Player not found",
				code: 2
			})
		}

		return status(200, {
			success: true,
			...player
		})
	}, {
		body: t.Object({
			username: t.Optional(t.String({ format: 'regex', pattern: '^[a-zA-Z0-9_]*$', maxLength: 16, minLength: 2 })),
			_id: t.Optional(t.String())
		})
	})

	.post('/status', async ({ body, status }) => {
		let { _id } = body as { _id: string }

		let uuid = normalizeUUID(_id)

		let cache = await db.redis.json.GET(`tntuser:status:${uuid}`) as Status

		if (cache) {
			return status(200, {
				success: true,
				...cache
			})
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

		await db.redis.json.SET(`tntuser:status:${uuid}`, '.', statusInfo as unknown as RedisJSON)
		await db.redis.expire(`tntuser:status:${uuid}`, 180)

		return status(200, {
			success: true,
			...statusInfo
		})
	}, {
		body: t.Object({
			_id: t.String()
		})
	})

	.post('/names', async ({ body, status }) => {
		let { _id } = body as { _id: string }

		let uuid = normalizeUUID(_id)

		let cache = await db.redis.json.GET(`tntuser:names:${uuid}`) as NameChange[]

		if (cache) {
			return status(200, {
				success: true,
				names: cache
			})
		}

		let nameReq = await tntFetch(`https://api.antisniper.net/v2/mojang?key=${process.env.ANTISNIPER_API_KEY}&uuid=${_id}`)

		if (!nameReq.res?.ok || !nameReq.data) {
			return status(500, {
				success: false,
				error: "Failed to fetch name data"
			})
		}

		let dedupedNames: NameChange[] = nameReq.data.name_changes.filter((item, i, arr) => i === 0 || item.name !== arr[i - 1].name)

		await db.redis.json.SET(`tntuser:names:${uuid}`, '.', dedupedNames as unknown as RedisJSON)
		await db.redis.expire(`tntuser:names:${uuid}`, 3600)

		return status(200, {
			success: true,
			names: dedupedNames
		})
	}, {
		body: t.Object({
			_id: t.String()
		})
	})

	.get('/leaderboard', async ({ status }) => {
		let cache = await db.redis.json.GET('tntuser:leaderboards') as {
			winsLeaderboard: User[],
			killsLeaderboard: User[],
			deathsLeaderboard: User[],
			powerupsLeaderboard: User[],
			tagsLeaderboard: User[]
		}

		if (cache) {
			return status(200, {
				success: true,
				...cache
			})
		}

		const [winsLeaderboard, killsLeaderboard, deathsLeaderboard, powerupsLeaderboard, tagsLeaderboard] = await Promise.all([
			db.mongo.userCol.find({}, { projection: { _id: 1, username: 1, wins: 1, rank: 1, rankColor: 1, plusColor: 1 } }).sort({ wins: -1 }).limit(1000).toArray(),
			db.mongo.userCol.find({}, { projection: { _id: 1, username: 1, kills: 1, wins: 1, rank: 1, rankColor: 1, plusColor: 1 } }).sort({ kills: -1 }).limit(1000).toArray(),
			db.mongo.userCol.find({}, { projection: { _id: 1, username: 1, deaths: 1, wins: 1, rank: 1, rankColor: 1, plusColor: 1 } }).sort({ deaths: -1 }).limit(1000).toArray(),
			db.mongo.userCol.find({}, { projection: { _id: 1, username: 1, powerups: 1, wins: 1, rank: 1, rankColor: 1, plusColor: 1 } }).sort({ powerups: -1 }).limit(1000).toArray(),
			db.mongo.userCol.find({}, { projection: { _id: 1, username: 1, tags: 1, wins: 1, rank: 1, rankColor: 1, plusColor: 1 } }).sort({ tags: -1 }).limit(1000).toArray()
		]);

		let leaderboards = {
			winsLeaderboard,
			killsLeaderboard,
			deathsLeaderboard,
			powerupsLeaderboard,
			tagsLeaderboard
		}

		await db.redis.json.SET('tntuser:leaderboards', '.', leaderboards as unknown as RedisJSON)
		await db.redis.expire('tntuser:leaderboards', 300)

		return status(200, {
			success: true,
			...leaderboards
		})
	})

	.get('/autocomplete', async ({ query, status }) => {
		let { name } = query

		let players = await db.mongo.userCol.find({
			normalizedUsername: { $regex: `^${name.toLocaleLowerCase()}` }
		}, { projection: { _id: 1, username: 1 } }).sort({ wins: -1 }).toArray()

		players.sort((a, b) => a.username.toUpperCase() == name.toUpperCase() ? -1 : b.username.toUpperCase() == name.toUpperCase() ? 1 : 0)

		return status(200, {
			success: true,
			players
		})
	}, {
		query: t.Object({
			name: t.String()
		})
	})

	.get(`/count`, async ({ status }) => {
		let cache = await db.redis.get(`tntuser:count`) as string

		if (cache) {
			return status(200, {
				success: true,
				count: parseInt(cache),
			})
		}

		const userCount = await db.mongo.userCol.countDocuments()

		await db.redis.set(`tntuser:count`, userCount.toString(), { EX: 300 })

		return status(200, {
			success: true,
			count: userCount
		})
	})

	.post('/multiple', async ({ body, status }) => {
		let { _id } = body as { _id: string[] }

		let uuidList = []
		for (const uuid of _id) {
			uuidList.push(normalizeUUID(uuid))
		}

		const requests = uuidList.map(async (uuid) => {
			let player = await getStats(uuid)

			if (player) {
				return { uuid: uuid, wins: player.wins }
			} else {
				return { uuid: uuid, wins: 0 }
			}
		})

		let response = await Promise.all(requests);

		return status(200, {
			success: true,
			users: response
		})
	}, {
		body: t.Object({
			_id: t.Array(t.String(), { maxItems: 36 })
		})
	})