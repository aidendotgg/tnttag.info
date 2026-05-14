import { Elysia, status } from "elysia";
import { tntFetch } from "@tnttag/fetch";

export const OptifineRouter = new Elysia({ prefix: "/optifine" })
	.get('/:username', async ({ params, set }) => {
		const { username } = params;

        let optifineReq = await tntFetch(`https://optifine.net/capes/${username}.png`)

        if (!optifineReq.res?.ok || !optifineReq.data) {
            return status(404, {
                success: false,
                error: "Optifine cape not found",
            })
        }

        set.headers["Content-Type"] = "image/png";
        return optifineReq.data
	})