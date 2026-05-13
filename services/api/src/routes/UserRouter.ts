import { Elysia, t, status } from "elysia";
import { normalizeUUID } from "@tnttag/formatting";
import type { User, Status, NameChange } from "@tnttag/types";
import { tntFetch } from "@tnttag/fetch";
import { getSeraph, getStats, getUrchin } from "../utils/StatsUtils";
import type { RedisJSON } from "redis";
import { mongo, redis } from "../utils/DatabaseUtils";
import { MojangPlugin } from "../plugins/MojangPlugin";
import { rateLimit, type Generator } from "elysia-rate-limit";
import { ip } from "elysia-ip";

const keyGenerator: Generator<{ ip: string }> = async (req, server, { ip }) => {
	return Bun.hash(JSON.stringify(ip)).toString();
};

export const UserRouter = new Elysia({ prefix: "/user" })
	.use(MojangPlugin())
	.use(ip())
	.use(rateLimit({
		duration: 15000,
		max: 45,
		generator: keyGenerator,
	}))
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
		resolveMojang: true
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

		if (!statusReq.res?.ok || !statusReq.json) {
			return status(500, {
				success: false,
				error: "Failed to fetch status data"
			})
		}

		let statusData = statusReq.json.session
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
		resolveMojang: true
	})

	.post('/cape', async ({ uuid }) => {
		const mojangReq = await tntFetch(`https://mowojang.seraph.si/session/minecraft/profile/${uuid}`)

		if (mojangReq.res?.ok && mojangReq.json) {
			let mojangProperties = mojangReq.json.properties as { name: string, value: string }[]
			let textureProperty = JSON.parse(Buffer.from(mojangProperties.find(prop => prop.name === "textures")?.value ?? '{}', 'base64').toString('utf-8'))

			if (textureProperty?.textures?.CAPE) {
				return {
					success: true,
					cape: textureProperty.textures.CAPE.url
				}
			}
		}

		return status(404, {
			success: false,
			error: "No cape found for this user"
		})
	}, {
		body: t.Object({
			_id: t.String()
		}),
		resolveMojang: true
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

		if (!nameReq.res?.ok || !nameReq.json) {
			return status(500, {
				success: false,
				error: "Failed to fetch name data"
			})
		}

		let dedupedNames: NameChange[] = nameReq.json.name_changes.filter((item: NameChange, i: number, arr: NameChange[]) => i === 0 || item.name !== arr[i - 1]!.name)

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
		resolveMojang: true
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
		resolveMojang: true
	})

	.post('/urchin', async ({ uuid }) => {
		let blacklistInfo = await getUrchin(uuid)

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
		resolveMojang: true
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
			normalizedUsername: { $regex: `^${name.toLowerCase()}` }
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
			const [player, blacklistInfo, ublacklistInfo] = await Promise.all([
				getStats(uuid),
				getSeraph(uuid),
				getUrchin(uuid)
			])

			if (player) {
				return {
					uuid: uuid,
					wins: player.wins,
					rank: player.rank,
					plusColor: player.plusColor,
					rankColor: player.rankColor,
					tag: blacklistInfo,
					utag: ublacklistInfo
				}
			} else {
				return {
					uuid: uuid,
					wins: 0,
					rank: null,
					plusColor: null,
					rankColor: null,
					tag: blacklistInfo,
					utag: ublacklistInfo
				}
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