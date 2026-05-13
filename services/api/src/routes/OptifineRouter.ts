import { tntFetch } from "@tnttag/fetch";
import { Elysia, t, status } from "elysia";

// Optifine cape proxy since they don't support https.
export const OptifineRouter = new Elysia({ prefix: "/optifine" })
    .get(`/:username`, async ({ params, set }) => {
        const { username } = params

        let optifineReq = await tntFetch(`http://s.optifine.net/capes/${username}.png`)

        if (!optifineReq.res?.ok || !optifineReq.data) {
            return status(404, {
                success: false,
                error: "Cape not found"
            })
        }

        set.headers['Content-Type'] = 'image/png'
        return optifineReq.data
    })