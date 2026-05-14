import { tntFetch } from "@tnttag/fetch"
import { normalizeUUID } from "@tnttag/formatting"
import { Elysia, status } from "elysia"
import { mongo } from "../utils/DatabaseUtils"

export function MojangPlugin() {
    return new Elysia({ name: "MojangPlugin" })
        .macro({
            resolveMojang: {
                resolve: async ({ body }) => {
                    const { _id, username } = body as { _id?: string, username?: string }

                    if (_id) {
                        return { uuid: normalizeUUID(_id) }
                    } else if (username) {
                        let uuidReq = await tntFetch(`https://playerdb.co/api/player/minecraft/${username}`, { headers: { "User-Agent": "TNTTag.info (+https://tnttag.info)" } })

                        if (!uuidReq.res?.ok || !uuidReq.json) {
                            let possibleOldName = await mongo.userCol.findOne({ normalizedUsername: username.toLowerCase() })

                            if (!possibleOldName) {
                                return status(404, {
                                    success: false,
                                    error: "Player not found",
                                    code: 1
                                })
                            }

                            return { uuid: normalizeUUID(possibleOldName._id) }
                        }

                        return { uuid: normalizeUUID(uuidReq.json.data.player.id) }
                    } else {
                        return status(400, {
                            success: false,
                            error: "No username or uuid provided"
                        })
                    }
                }
            }
        })
}