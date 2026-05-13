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
                        let usernameReq = await tntFetch(`https://mowojang.seraph.si/${_id}`, { headers: { "User-Agent": "TNTTag.info (+https://tnttag.info)" } })

                        if (!usernameReq.res?.ok || !usernameReq.json) {
                            return status(404, {
                                success: false,
                                error: "Player not found",
                                code: 1
                            })
                        }

                        return { uuid: normalizeUUID(usernameReq.json.id), username: usernameReq.json.name }
                    } else if (username) {
                        let uuidReq = await tntFetch(`https://mowojang.seraph.si/${username}`, { headers: { "User-Agent": "TNTTag.info (+https://tnttag.info)" } })

                        if (!uuidReq.res?.ok || !uuidReq.json) {
                            let possibleOldName = await mongo.userCol.findOne({ normalizedUsername: username.toLowerCase() })

                            if (!possibleOldName) {
                                return status(404, {
                                    success: false,
                                    error: "Player not found",
                                    code: 1
                                })
                            }

                            return { uuid: normalizeUUID(possibleOldName._id), username: possibleOldName.username }
                        }

                        return { uuid: normalizeUUID(uuidReq.json.id), username: uuidReq.json.name }
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