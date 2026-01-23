import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { formatWord } from '@tnttag/formatting';
import LeaderNumber from '@/components/LeaderNumber';
import Rank from '@/components/Rank';
import Wins from '@/components/Wins';
import { tntFetch } from '@tnttag/fetch';

export default function Leaderboard() {
  const router = useRouter();

  type playerType = {
    _id: string;
    username: string;
    value: number;
    wins: number;
    rank: string;
    rankColor: string;
    plusColor: string;
  };

  const [winsData, setWinsData] = useState<playerType[]>([]);
  const [killsData, setKillsData] = useState<playerType[]>([]);
  const [deathsData, setDeathsData] = useState<playerType[]>([]);
  const [powerupsData, setPowerupsData] = useState<playerType[]>([]);
  const [tagsData, setTagsData] = useState<playerType[]>([]);
  const [leaderboardValues, setLeaderboardValues] = useState<playerType[]>([]);
  const [leaderboardName, setLeaderboardName] = useState<'wins' | 'kills' | 'deaths' | 'powerups' | 'tags'>('wins');
  const [loading, setLoading] = useState(true);
  const [showDropdownType, setShowDropdownType] = useState(false);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [offset, setOffset] = useState(0);

  const mapLeaderboard = (players: any[], valueKey: string) =>
    players.map((player) => ({
      _id: player._id,
      username: player.username,
      value: player[valueKey],
      wins: player.wins,
      rank: player.rank,
      rankColor: player.rankColor,
      plusColor: player.plusColor,
    }));

  useEffect(() => {
    async function fetchLeaderboard() {
      const leaderboardReq = await tntFetch(`${process.env.BACKEND_URL}/user/leaderboard`);

      if (!leaderboardReq.res?.ok || !leaderboardReq.data) {
        router.push('/');
        return;
      }

      setWinsData(mapLeaderboard(leaderboardReq.data.winsLeaderboard, 'wins'));
      setKillsData(mapLeaderboard(leaderboardReq.data.killsLeaderboard, 'kills'));
      setDeathsData(mapLeaderboard(leaderboardReq.data.deathsLeaderboard, 'deaths'));
      setPowerupsData(mapLeaderboard(leaderboardReq.data.powerupsLeaderboard, 'powerups'));
      setTagsData(mapLeaderboard(leaderboardReq.data.tagsLeaderboard, 'tags'));
      setLeaderboardValues(mapLeaderboard(leaderboardReq.data.winsLeaderboard, 'wins'));
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  const handlePageFoward = () => {
    if (currentPage < Math.ceil(leaderboardValues.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
      setOffset(offset + itemsPerPage);
    }
  };

  const handlePageBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setOffset(offset - itemsPerPage);
    }
  };

  const goFirstPage = () => {
    setCurrentPage(1);
    setOffset(0);
  };

  const goLastPage = () => {
    setCurrentPage(Math.ceil(leaderboardValues.length / itemsPerPage));
    setOffset((Math.ceil(leaderboardValues.length / itemsPerPage) - 1) * itemsPerPage);
  };

  const resetLbPos = () => {
    setShowDropdownType(false);
    setCurrentPage(1);
    setOffset(0);
  };

  return (
    <>
      <section className="relative">
        <div className="flex flex-col justify-center min-h-screen px-4 pt-20 pb-10">
          <div className="flex flex-col items-center justify-center gap-2 w-full">
            {loading ? (
              <p className="text-center animate-bounce text-5xl text-minecraft-white">Loading...</p>
            ) : (
              <>
                <div className="flex flex-col gap-2 max-w-xl w-full">
                  <div className="flex flex-col relative w-full gap-2">
                    <button
                      onClick={() => setShowDropdownType(showDropdownType ? false : true)}
                      className="flex z-10 flex-row bg-neutral-950/80 border-1 w-full border-neutral-950 rounded-md p-2 px-2.5 items-center duration-300"
                    >
                      <span className="mx-auto translate-x-3.5 font-bold text-xl text-minecraft-white">{formatWord(leaderboardName)}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 16 16">
                        <path
                          fill="currentColor"
                          d="M8.35 1.65a.5.5 0 0 0-.707 0l-3.5 3.5a.5.5 0 0 0 .707.707L8 2.707l3.15 3.15a.5.5 0 0 0 .707-.707l-3.5-3.5zm3.55 9.25l-3.5 3.5a.5.5 0 0 1-.707 0l-3.5-3.5a.5.5 0 0 1 .707-.707l3.15 3.15l3.15-3.15a.5.5 0 0 1 .707.707z"
                        />
                      </svg>
                    </button>
                    {showDropdownType && (
                      <div className="absolute overflow-y-auto translate-y-12 w-full bg-neutral-950 border-1 border-neutral-950 rounded-md p-2 px-2.5 items-center duration-300">
                        <button
                          key={'wins'}
                          onClick={() => {
                            setLeaderboardValues(winsData);
                            setLeaderboardName('wins');
                            resetLbPos();
                          }}
                          className="flex w-full p-1 rounded-md hover:bg-neutral-900 duration-300"
                        >
                          <span className="font-bold mx-auto text-lg text-minecraft-white">Wins</span>
                        </button>
                        <button
                          key={'kills'}
                          onClick={() => {
                            setLeaderboardValues(killsData);
                            setLeaderboardName('kills');
                            resetLbPos();
                          }}
                          className="flex w-full p-1 rounded-md hover:bg-neutral-900 duration-300"
                        >
                          <span className="font-bold mx-auto text-lg text-minecraft-white">Kills</span>
                        </button>
                        <button
                          key={'deaths'}
                          onClick={() => {
                            setLeaderboardValues(deathsData);
                            setLeaderboardName('deaths');
                            resetLbPos();
                          }}
                          className="flex w-full p-1 rounded-md hover:bg-neutral-900 duration-300"
                        >
                          <span className="font-bold mx-auto text-lg text-minecraft-white">Deaths</span>
                        </button>
                        <button
                          key={'powerups'}
                          onClick={() => {
                            setLeaderboardValues(powerupsData);
                            setLeaderboardName('powerups');
                            resetLbPos();
                          }}
                          className="flex w-full p-1 rounded-md hover:bg-neutral-900 duration-300"
                        >
                          <span className="font-bold mx-auto text-lg text-minecraft-white">Powerups</span>
                        </button>
                        <button
                          key={'tags'}
                          onClick={() => {
                            setLeaderboardValues(tagsData);
                            setLeaderboardName('tags');
                            resetLbPos();
                          }}
                          className="flex w-full p-1 rounded-md hover:bg-neutral-900 duration-300"
                        >
                          <span className="font-bold mx-auto text-lg text-minecraft-white">Tags</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="h-fit rounded-md bg-neutral-950/80 p-4 border-1 border-neutral-950">
                    <h1 className="sm:text-2xl text-2xl text-minecraft-white font-bold text-center w-full">{formatWord(leaderboardName)} Leaderboard</h1>
                    <h2 className="text-sm text-minecraft-white text-center w-full pb-2">Leaderboard may not be accurate beyond top 100</h2>
                    {leaderboardValues.slice(offset, offset + itemsPerPage).map((player, index) => (
                      <div key={player._id} className="flex flex-row justify-between items-center border-b-1 border-neutral-800 last:border-b-0 p-2">
                        <button onClick={() => router.push(`/p/${player._id}`)}>
                          <p className="text-xl">
                            <LeaderNumber pos={index + 1 + offset} /> <Wins wins={player.wins} />{' '}
                            <Rank username={player.username} rank={player.rank} rankColor={player.rankColor} plusColor={player.plusColor} />
                          </p>
                        </button>
                        <p className="text-xl">{player.value}</p>
                      </div>
                    ))}
                    <div className="flex sm:flex-row flex-col gap-y-1.5 justify-between items-center mt-4">
                      <div className="flex flex-row gap-2">
                        <button onClick={goFirstPage} className="bg-neutral-900 hover:bg-neutral-800 duration-300 border-1 border-neutral-800 text-minecraft-white p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="fill-white h-6 w-6 mx-auto" viewBox="0 0 16 16">
                            <path d="M8.404 7.304a.802.802 0 0 0 0 1.392l6.363 3.692c.52.302 1.233-.043 1.233-.696V4.308c0-.653-.713-.998-1.233-.696L8.404 7.304Z" />
                            <path d="M.404 7.304a.802.802 0 0 0 0 1.392l6.363 3.692c.52.302 1.233-.043 1.233-.696V4.308c0-.653-.713-.998-1.233-.696L.404 7.304Z" />
                          </svg>
                        </button>
                        <button onClick={handlePageBack} className="bg-neutral-900 hover:bg-neutral-800 duration-300 border-1 border-neutral-800 text-minecraft-white p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="fill-white h-6 w-6 mx-auto" viewBox="0 0 16 16">
                            <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
                          </svg>
                        </button>
                        <button onClick={handlePageFoward} className="bg-neutral-900 hover:bg-neutral-800 duration-300 border-1 border-neutral-800 text-minecraft-white p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="fill-white h-6 w-6 mx-auto" viewBox="0 0 16 16">
                            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                          </svg>
                        </button>
                        <button onClick={goLastPage} className="bg-neutral-900 hover:bg-neutral-800 duration-300 border-1 border-neutral-800 text-minecraft-white p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="fill-white h-6 w-6 mx-auto" viewBox="0 0 16 16">
                            <path d="M7.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C.713 12.69 0 12.345 0 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692Z" />
                            <path d="M15.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C8.713 12.69 8 12.345 8 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692Z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-lg text-minecraft-white">
                        Page {currentPage} of {Math.ceil(leaderboardValues.length / itemsPerPage)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
