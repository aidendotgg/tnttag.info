import { tntFetch } from "@tnttag/fetch"
import { normalizeUUID } from "@tnttag/formatting"
import { Elysia, status } from "elysia"

export function UUIDPlugin() {
    return new Elysia({ name: "UUIDPlugin" })
        .macro({
            normalizeUUID: {
                resolve: async ({ body }) => {
                    const { _id, username } = body as { _id?: string, username?: string }

                    if (_id) {
                        return { uuid: normalizeUUID(_id) }
                    } else if (username) {
                        let uuidReq = await tntFetch(`https://playerdb.co/api/player/minecraft/${username}`, { headers: { "User-Agent": "TNTTag.info (+https://tnttag.info)" } })

                        if (!uuidReq.res?.ok || !uuidReq.data) {
                            return status(404, {
                                success: false,
                                error: "Player not found",
                                code: 1
                            })
                        }

                        return { uuid: normalizeUUID(uuidReq.data.data.player.id) }
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