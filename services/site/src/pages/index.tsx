import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Wins from "@/components/Wins";
import Rank from "@/components/Rank";
import PlayerSearch from "@/components/PlayerSearch";
import { tntFetch } from "@tnttag/fetch";

export default function Home() {
  const [countData, setCountData] = useState<{ count: number, playerCount: number }>({ count: 0, playerCount: 0 })

  useEffect(() => {
    async function fetchData() {
      let countReq = await tntFetch(`${process.env.BACKEND_URL}/user/count`)

      if (!countReq.res?.ok || !countReq.data) return

      setCountData(countReq.data)
    }

    fetchData()
  }, [])

  return (
    <>
      <section className="relative" >
        <div className="flex flex-col min-h-screen justify-center gap-4 px-4 pt-20 pb-10">
          <div className="flex flex-col max-w-xl w-full mx-auto text-center gap-2">
            <h1 className="font-bold text-5xl"><span className="text-minecraft-red">TNT</span>Tag.info</h1>
            <div className="h-fit w-full rounded-md bg-neutral-950/80 p-4 border-1 border-neutral-950">
              <h1 className="text-2xl font-bold text-center w-full pb-4">Search Player</h1>
              <PlayerSearch />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-2 text-right text-sm">
          <p>Website made with ❤ by <a className="text-minecraft-red hover:text-blue-700 hover:underline duration-300" href="https://aiden.gg" target="_blank">Aiden</a></p>
          <p className="mt-[-0.3rem]">{countData.count.toLocaleString()} total players stored</p>
        </div>
      </section>
    </>
  );
}
