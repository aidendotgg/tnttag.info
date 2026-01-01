import { User } from "@tnttag/interfaces"
import { deathEffects, getColor, getRank, hats, particles, suits } from "@tnttag/formatting"
import { RedisJSON } from "redis"
import { db } from ".."
import { tntFetch } from "@tnttag/fetch";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getStats(uuid: string): Promise<User | null> {
    let cache = await db.redis.json.GET(`tntuser:${uuid}`) as User

    if (cache) return cache

    let playerReq = await tntFetch(`https://api.hypixel.net/v2/player?key=${process.env.HYPIXEL_API_KEY}&uuid=${uuid}`)

    if (!playerReq.res?.ok || !playerReq.data) {
        console.log(`Failed to fetch hypixel player data: ${playerReq}`);
        return null
    }

    let playerData = playerReq.data.player
    if (!playerData) return null

    let displayName = playerData.displayname
    let plusColor = getColor(playerData.rankPlusColor, "#FF5555")
    let rankColor = getColor(playerData.monthlyRankColor, "#FFAA00")
    let rank = getRank(playerData)
    let firstLogin = playerData.firstLogin ?? 0
    let lastLogin = playerData.lastLogin ?? 0
    let level = '1'
    if (playerData.networkExp) {
        let unroundedLevel = (Math.sqrt((2 * playerData.networkExp) + 30625) / 50) - 2.5
        level = unroundedLevel.toFixed(2)
    }
    let karma = playerData.karma ?? 0
    let ap = playerData.achievementPoints ?? 0
    let language = playerData.userLanguage ?? "ENGLISH"
    let ranksGifted = playerData.giftingMeta?.ranksGiven ?? 0
    let youtube = playerData.socialMedia?.links?.YOUTUBE ?? "None"
    let discord = playerData.socialMedia?.links?.DISCORD ?? "None"
    let twitter = playerData.socialMedia?.links?.TWITTER ?? "None"
    let instagram = playerData.socialMedia?.links?.INSTAGRAM ?? "None"
    let tiktok = playerData.socialMedia?.links?.TIKTOK ?? "None"
    let twitch = playerData.socialMedia?.links?.TWITCH ?? "None"

    let wins = playerData.stats?.TNTGames?.wins_tntag ?? 0
    let kills = playerData.stats?.TNTGames?.kills_tntag ?? 0
    let deaths = playerData.stats?.TNTGames?.deaths_tntag ?? 0
    let kd: any = (kills / deaths).toFixed(2)
    if (kd === "NaN") {
        kd = "0"
    } else if (kd === "Infinity") {
        kd = kills
    }
    let tags = playerData.achievements?.tntgames_clinic ?? 0
    let playtime
    if (!playerData.achievements) {
        playtime = 0
    } else if (!playerData.achievements?.tntgames_tnt_triathlon) {
        playtime = 0
    } else {
        let unroundedPlaytime = playerData.achievements?.tntgames_tnt_triathlon / 60
        playtime = unroundedPlaytime.toFixed(2)
    }
    let powerups = playerData.achievements?.tntgames_the_upper_hand ?? 0
    let prefixColor = playerData.stats?.TNTGames?.prefix_tntag ?? "dark_gray"
    let prefixToggled = playerData.stats?.TNTGames?.flags?.show_win_prefixes ?? true
    let coins = playerData.stats?.TNTGames?.coins ?? 0
    let speedy = playerData.stats?.TNTGames?.new_tntag_speedy ?? 0
    let blastProt = playerData.stats?.TNTGames?.tag_blastprotection ?? 0
    let slowItDown = playerData.stats?.TNTGames?.tag_slowitdown ?? 0
    let speedItUp = playerData.stats?.TNTGames?.tag_speeditup ?? 0
    let deathEffect = deathEffects.includes(playerData.stats?.TNTGames?.active_death_effect) || playerData.stats?.TNTGames?.active_death_effect?.includes("random_") ? playerData.stats?.TNTGames?.active_death_effect : "None"
    let particle = particles.includes(playerData.stats?.TNTGames?.active_particle) || playerData.stats?.TNTGames?.active_particle?.includes("random_") ? playerData.stats?.TNTGames?.active_particle : "None"
    let hat = hats.includes(playerData.stats?.TNTGames?.new_selected_hat) ? playerData.stats?.TNTGames?.new_selected_hat : "None"
    let suit = suits.includes(playerData.stats?.TNTGames?.new_tag_suit) ? playerData.stats?.TNTGames?.new_tag_suit : "None"

    let unlockedDeathEffects: { name: string, unlocked: boolean }[] = []
    let unlockedParticles: { name: string, unlocked: boolean }[] = []
    let unlockedHats: { name: string, unlocked: boolean }[] = []
    let unlockedSuits: { name: string, unlocked: boolean }[] = []
    for (const deathEffect of deathEffects) {
        unlockedDeathEffects.push({
            name: deathEffect,
            unlocked: playerData.stats?.TNTGames?.packages?.includes(deathEffect) ? true : false
        })
    }
    for (const particle of particles) {
        unlockedParticles.push({
            name: particle,
            unlocked: playerData.stats?.TNTGames?.packages?.includes(particle) ? true : false
        })
    }
    for (const hat of hats) {
        unlockedHats.push({
            name: hat,
            unlocked: playerData.stats?.TNTGames?.packages?.includes(hat) ? true : false
        })
    }
    for (const suit of suits) {
        unlockedSuits.push({
            name: suit,
            unlocked: playerData.stats?.TNTGames?.packages?.includes(suit) ? true : false
        })
    }

    const [winsLeaderboard, killsLeaderboard, deathsLeaderboard, powerupsLeaderboard, tagsLeaderboard] = await Promise.all([
        db.mongo.userCol.find({}, { projection: { _id: 1 } }).sort({ wins: -1 }).limit(100).toArray(),
        db.mongo.userCol.find({}, { projection: { _id: 1 } }).sort({ kills: -1 }).limit(100).toArray(),
        db.mongo.userCol.find({}, { projection: { _id: 1 } }).sort({ deaths: -1 }).limit(100).toArray(),
        db.mongo.userCol.find({}, { projection: { _id: 1 } }).sort({ powerups: -1 }).limit(100).toArray(),
        db.mongo.userCol.find({}, { projection: { _id: 1 } }).sort({ tags: -1 }).limit(100).toArray()
    ]);

    const winsRank = winsLeaderboard.findIndex(p => p._id === uuid) + 1;
    const killsRank = killsLeaderboard.findIndex(p => p._id === uuid) + 1;
    const deathsRank = deathsLeaderboard.findIndex(p => p._id === uuid) + 1;
    const powerupsRank = powerupsLeaderboard.findIndex(p => p._id === uuid) + 1;
    const tagsRank = tagsLeaderboard.findIndex(p => p._id === uuid) + 1;

    let player: User = {
        _id: uuid,
        username: displayName,
        normalizedUsername: displayName.toLowerCase(),
        plusColor,
        rankColor,
        rank,
        firstLogin,
        lastLogin,
        level,
        karma,
        ap,
        language,
        ranksGifted,
        youtube,
        discord,
        twitter,
        instagram,
        tiktok,
        twitch,
        wins,
        kills,
        deaths,
        kd,
        tags,
        playtime,
        powerups,
        winsRank,
        killsRank,
        deathsRank,
        powerupsRank,
        tagsRank,
        prefixColor,
        prefixToggled,
        coins,
        speedy,
        blastProt,
        slowItDown,
        speedItUp,
        deathEffect,
        particle,
        hat,
        suit,
        unlockedDeathEffects,
        unlockedParticles,
        unlockedHats,
        unlockedSuits,
        time: Date.now()
    }

    await db.redis.json.SET(`tntuser:${uuid}`, '.', player as unknown as RedisJSON)
    await db.redis.expire(`tntuser:${uuid}`, 300)

    await db.mongo.userCol.findOneAndReplace({ _id: uuid }, player, { upsert: true })
    return player
}

export async function updateLeaderboards() {
    let leaderboardReq = await tntFetch(`https://api.hypixel.net/v2/leaderboards?key=${process.env.HYPIXEL_API_KEY}`)

    if (!leaderboardReq.res?.ok || !leaderboardReq.data) {
        console.log(`Failed to fetch hypixel leaderboard data: ${leaderboardReq}`);
        return
    }

    const winsTop150 = await db.mongo.userCol.find().sort({ wins: -1 }).limit(150).toArray();
    const killsTop150 = await db.mongo.userCol.find().sort({ kills: -1 }).limit(150).toArray();
    const deathsTop150 = await db.mongo.userCol.find().sort({ deaths: -1 }).limit(150).toArray();
    const powerupsTop150 = await db.mongo.userCol.find().sort({ powerups: -1 }).limit(150).toArray();
    const tagsTop150 = await db.mongo.userCol.find().sort({ tags: -1 }).limit(150).toArray();
    let playerSet = new Set<string>();

    for (const player of leaderboardReq.data.leaderboards.TNTGAMES[3].leaders) {
        playerSet.add(player);
    }
    for (const player of winsTop150) {
        playerSet.add(player._id);
    }
    for (const player of killsTop150) {
        playerSet.add(player._id);
    }
    for (const player of deathsTop150) {
        playerSet.add(player._id);
    }
    for (const player of powerupsTop150) {
        playerSet.add(player._id);
    }
    for (const player of tagsTop150) {
        playerSet.add(player._id);
    }

    console.log(`Updating data for ${playerSet.size} players...`);
    for (const player of playerSet) {
        try {
            await getStats(player);
            console.log(`Updated data for player ${player}`);
        } catch {
            console.log(`Failed to update data for player ${player}`);
        }
        await sleep(3000)
    }
    console.log("Finished updating leaderboard data.");
}