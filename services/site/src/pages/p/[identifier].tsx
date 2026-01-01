import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { IdleAnimation, SkinViewer } from 'skinview3d';
import { User, Status } from '@tnttag/interfaces';
import { formatCosmetic, truncateString } from '@tnttag/formatting';
import { tntFetch } from '@tnttag/fetch';
import Rank from '@/components/Rank';
import TenThousandWins from '@/components/10000Wins';
import LeaderNumber from '@/components/LeaderNumber';
import Wins from '@/components/Wins';

export default function Username() {
  const router = useRouter();
  const { identifier } = router.query as { identifier: string };

  const [loading, setLoading] = useState(true);
  const [skinFetched, setSkinFetched] = useState(false);
  const [user, setUser] = useState<User>();
  const [status, setStatus] = useState<Status>();
  const [cosmeticValues, setCosmeticValues] = useState<{ name: string; unlocked: boolean }[]>([]);
  const [cosmeticName, setCosmeticName] = useState<'Hats' | 'Suits' | 'Particles' | 'Death Effects'>('Hats');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function fetchPlayer() {
      const usernameRegex = /^[a-zA-Z0-9_]{1,16}$/;
      const body = usernameRegex.test(identifier) ? { username: identifier } : { _id: identifier };

      const userReq = await tntFetch(`${process.env.BACKEND_URL}/user`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!userReq.res?.ok || !userReq.data) {
        router.push('/');
        return;
      }

      setUser(userReq.data);
      setCosmeticValues(userReq.data.unlockedHats);

      if (userReq.data.lastLogin) {
        const statusReq = await tntFetch(`${process.env.BACKEND_URL}/user/status`, {
          method: 'POST',
          body: JSON.stringify({ _id: userReq.data._id }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!statusReq.res?.ok || !statusReq.data) {
          setLoading(false);
          return;
        }

        setStatus(statusReq.data);
      }

      setLoading(false);
    }

    if (identifier && !user) fetchPlayer();
  }, [identifier]);

  useEffect(() => {
    async function fetchSkin() {
      const skinViewer = new SkinViewer({
        canvas: document.getElementById('skin_container') as HTMLCanvasElement,
        width: 250,
        height: 305,
        skin: `https://minotar.net/skin/${user?._id}`,
        animation: new IdleAnimation(),
      });

      skinViewer.autoRotate = true;
      skinViewer.autoRotateSpeed = 0.5;

      const capesReq = await tntFetch(`https://api.capes.dev/load/${user?.username}`);

      if (!capesReq.res?.ok || !capesReq.data) {
        setSkinFetched(true);
        return;
      }

      if (capesReq.data.minecraft.imageUrl) {
        skinViewer.loadCape(capesReq.data.minecraft.imageUrl);
      } else if (capesReq.data.optifine.imageUrl) {
        skinViewer.loadCape(capesReq.data.optifine.imageUrl);
      }

      setSkinFetched(true);
    }

    if (user && !skinFetched && !loading) fetchSkin();
  }, [user, loading]);

  function formatWinMilestone(wins: number) {
    const winColorMap = new Map<
      number,
      {
        fromColor: string;
        toColor: string;
        fromValue: number;
        toValue: number;
      }
    >([
      [5000, { fromColor: 'black', toColor: 'black', fromValue: 5000, toValue: 10000 }],
      [2500, { fromColor: 'red', toColor: 'black', fromValue: 2500, toValue: 5000 }],
      [1500, { fromColor: 'gold', toColor: 'red', fromValue: 1500, toValue: 2500 }],
      [1000, { fromColor: 'dark_purple', toColor: 'gold', fromValue: 1000, toValue: 1500 }],
      [500, { fromColor: 'blue', toColor: 'dark_purple', fromValue: 500, toValue: 1000 }],
      [250, { fromColor: 'green', toColor: 'blue', fromValue: 250, toValue: 500 }],
      [100, { fromColor: 'dark_green', toColor: 'green', fromValue: 100, toValue: 250 }],
      [50, { fromColor: 'white', toColor: 'dark_green', fromValue: 50, toValue: 100 }],
      [15, { fromColor: 'gray', toColor: 'white', fromValue: 15, toValue: 50 }],
      [0, { fromColor: 'dark_gray', toColor: 'gray', fromValue: 0, toValue: 15 }],
    ]);

    for (const [milestone, data] of winColorMap) {
      if (wins >= milestone) {
        const progress = Math.min(Math.max(((wins - data.fromValue) / (data.toValue - data.fromValue)) * 100, 0), 100);

        return (
          <div className="flex flex-row items-center gap-1">
            {wins >= 10000 ? (
              <p className={`text-xl`}>
                <TenThousandWins wins={wins} />
              </p>
            ) : (
              <p className={`text-xl`}>
                <Wins wins={data.fromValue} />
              </p>
            )}
            <div className={`flex min-[400px]:w-50 w-31.25 rounded-md bg-neutral-700 h-3`}>
              <div
                style={{
                  width: `${progress}%`,
                  background: wins >= 10000 ? 'linear-gradient(to right, #ff5555, #ffaa00, #ffff55, #55ff55, #55ffff, #ff55ff, #aa00aa)' : undefined,
                }}
                className={`flex rounded-md bg-minecraft-${data.fromColor}`}
              ></div>
            </div>
            {data.toValue === 10000 ? (
              <p className={`text-xl`}>
                <TenThousandWins wins={10000} />
              </p>
            ) : (
              <p className={`text-xl`}>
                <Wins wins={data.toValue} />
              </p>
            )}
          </div>
        );
      }
    }
  }

  return (
    <>
      <section className="relative">
        <div className="flex flex-col justify-center min-h-screen px-4 pt-20 pb-10">
          {loading ? (
            <p className="text-center animate-bounce text-5xl">Loading...</p>
          ) : (
            <>
              <div className="flex flex-col items-center gap-2 mx-auto">
                <div className="flex min-[1160px]:flex-row flex-col gap-2">
                  <div className="flex flex-col gap-2 h-fit">
                    <div className="flex min-[730px]:flex-row flex-col gap-2">
                      <div className="flex w-full flex-col items-center rounded-md bg-neutral-950/80 p-4 border-1 border-neutral-950">
                        <h1 className="min-[345px]:text-3xl text-2xl text-center">
                          <Rank username={user!.username} rank={user!.rank} rankColor={user!.rankColor} plusColor={user!.plusColor} />
                        </h1>
                        <canvas id="skin_container" className="hover:cursor-pointer active:cursor-move" />
                      </div>
                      <div className="flex w-full flex-col rounded-md bg-neutral-950/80 p-4 border-1 border-neutral-950">
                        <div className="flex flex-col whitespace-nowrap">
                          <h1 className="font-bold text-2xl mb-1 text-center">Game Statistics</h1>
                          <div className="flex flex-col">
                            <h3 className="font-bold text-xl">Title Progress:</h3>
                            {formatWinMilestone(user!.wins)}
                          </div>
                          <h2 className="font-bold text-xl">
                            Wins: <span className="font-normal text-minecraft-gray">{user?.wins.toLocaleString()}</span> {user?.winsRank !== 0 && <LeaderNumber pos={user!.winsRank} />}
                          </h2>
                          <h2 className="font-bold text-xl">
                            Kills: <span className="font-normal text-minecraft-gray">{user?.kills.toLocaleString()}</span> {user?.killsRank !== 0 && <LeaderNumber pos={user!.killsRank} />}
                          </h2>
                          <h2 className="font-bold text-xl">
                            Deaths: <span className="font-normal text-minecraft-gray">{user?.deaths.toLocaleString()}</span> {user?.deathsRank !== 0 && <LeaderNumber pos={user!.deathsRank} />}
                          </h2>
                          <h2 className="font-bold text-xl">
                            K/D: <span className="font-normal text-minecraft-gray">{user?.kd}</span>
                          </h2>
                          <h2 className="font-bold text-xl">
                            Tags: <span className="font-normal text-minecraft-gray">{user?.tags.toLocaleString()}</span> {user?.tagsRank !== 0 && <LeaderNumber pos={user!.tagsRank} />}
                          </h2>
                          <h2 className="font-bold text-xl">
                            Powerups: <span className="font-normal text-minecraft-gray">{user?.powerups.toLocaleString()}</span> {user?.powerupsRank !== 0 && <LeaderNumber pos={user!.powerupsRank} />}
                          </h2>
                          <h2 className="font-bold text-xl">
                            Playtime: <span className="font-normal text-minecraft-gray">{user?.playtime.toLocaleString()}h</span>
                          </h2>
                          <h2 className="font-bold text-xl">
                            TNT Coins: <span className="font-normal text-minecraft-gray">{user?.coins.toLocaleString()}</span>
                          </h2>
                          <h2 className="font-bold text-xl">
                            Wins Prefix: <span className={`font-normal ${user?.prefixToggled ? 'text-minecraft-green' : 'text-minecraft-red'}`}>{user?.prefixToggled ? 'On' : 'Off'}</span>
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div className="flex min-[730px]:flex-row flex-col gap-2">
                      <div className="flex flex-col min-[730px]:w-2/5 w-full rounded-md bg-neutral-950/80 p-4 border-1 border-neutral-950">
                        <div className="flex flex-col whitespace-nowrap">
                          <h2 className="font-bold">
                            Network Level: <span className="font-normal text-minecraft-gray">{user?.level}</span>
                          </h2>
                          <h2 className="font-bold">
                            Karma: <span className="font-normal text-minecraft-gray">{user?.karma.toLocaleString()}</span>
                          </h2>
                          <h2 className="font-bold">
                            AP: <span className="font-normal text-minecraft-gray">{user?.ap.toLocaleString()}</span>
                          </h2>
                          <h2 className="font-bold">
                            First Login: <span className="font-normal text-minecraft-gray">{new Date(user!.firstLogin).toLocaleDateString()}</span>
                          </h2>
                          <h2 className="font-bold">
                            Last Login:&nbsp;
                            <span className={`font-normal ${user?.lastLogin === 0 ? 'text-minecraft-red' : 'text-minecraft-gray'}`}>
                              {user?.lastLogin === 0 ? 'Hidden' : new Date(user!.lastLogin).toLocaleDateString()}
                            </span>
                          </h2>
                          <h2 className="font-bold">
                            Status:{' '}
                            <span className={`font-normal ${status?.online ? 'text-minecraft-green' : 'text-minecraft-red'}`}>
                              {status?.online ? 'Online' : user?.lastLogin === 0 ? 'Hidden' : 'Offline'}
                            </span>
                          </h2>
                          {status?.online && (
                            <h2 className="font-bold">
                              Playing:{' '}
                              <span className="font-normal text-minecraft-gray">
                                {status?.mode === 'LOBBY' ? `${status?.playing} ` : ''}
                                {status?.mode}
                                {status?.map !== 'None' ? ` on ${status?.map}` : ''}
                              </span>
                            </h2>
                          )}
                          <h2 className="font-bold">
                            Ranks Gifted: <span className="font-normal text-minecraft-gray">{user?.ranksGifted}</span>
                          </h2>
                          <h2 className="font-bold">
                            Language:&nbsp;
                            <span className="font-normal text-minecraft-gray">{user?.language}</span>
                          </h2>
                          <div className="flex flex-row gap-2 items-center">
                            {user?.discord !== 'None' && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(user!.discord);
                                  alert('Discord copied to clipboard');
                                }}
                                draggable="false"
                                className="flex flex-row gap-1 text-[#5865F2] select-none"
                              >
                                <svg className="h-5 w-5 fill-[#5865F2]" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                                </svg>
                                @{user?.discord}
                              </button>
                            )}
                            {user?.youtube !== 'None' && (
                              <a href={user?.youtube} target="_blank">
                                <svg className="h-5 w-5 fill-[#FF0000]" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                              </a>
                            )}
                            {user?.twitter !== 'None' && (
                              <a href={user?.twitter} target="_blank">
                                <svg className="h-5 w-5 fill-white" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <title>X</title>
                                  <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
                                </svg>
                              </a>
                            )}
                            {user?.instagram !== 'None' && (
                              <a href={user?.instagram} target="_blank">
                                <svg className="h-5 w-5 fill-[#FF0069]" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <title>Instagram</title>
                                  <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
                                </svg>
                              </a>
                            )}
                            {user?.tiktok !== 'None' && (
                              <a href={user?.tiktok} target="_blank">
                                <svg className="h-5 w-5 fill-white" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <title>TikTok</title>
                                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                </svg>
                              </a>
                            )}
                            {user?.twitch !== 'None' && (
                              <a href={user?.twitch} target="_blank">
                                <svg className="h-5 w-5 fill-[#9146FF]" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <title>Twitch</title>
                                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid min-[425px]:grid-cols-2 grid-cols-1 gap-2 min-[730px]:w-3/5 w-full">
                        <div className="flex flex-col rounded-md bg-neutral-950/80 p-2 border-1 border-neutral-950">
                          <h1 className="font-bold text-xl text-center">Hat</h1>
                          <img src={`/icons/${user?.hat}.png`} className="flex h-14 w-14 mx-auto" />
                          <p className="text-center text-lg">{truncateString(formatCosmetic(user!.hat), 16)}</p>
                        </div>
                        <div className="flex flex-col rounded-md bg-neutral-950/80 p-2 border-1 border-neutral-950">
                          <h1 className="font-bold text-xl text-center">Suit</h1>
                          <img src={`/icons/${user?.suit}.png`} className="flex h-14 w-14 mx-auto" />
                          <p className="text-center text-lg">{truncateString(formatCosmetic(user!.suit), 16)}</p>
                        </div>
                        <div className="flex flex-col rounded-md bg-neutral-950/80 p-2 border-1 border-neutral-950">
                          <h1 className="font-bold text-xl text-center">Particle</h1>
                          <img src={`/icons/${user?.particle}.png`} className="flex h-14 w-14 mx-auto" />
                          <p className="text-center text-lg">{truncateString(formatCosmetic(user!.particle), 16)}</p>
                        </div>
                        <div className="flex flex-col rounded-md bg-neutral-950/80 p-2 border-1 border-neutral-950">
                          <h1 className="font-bold text-xl text-center">Death Effect</h1>
                          <img src={`/icons/${user?.deathEffect}.png`} className="flex h-14 w-14 mx-auto" />
                          <p className="text-center text-lg">{truncateString(formatCosmetic(user!.deathEffect), 16)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center rounded-md bg-neutral-950/80 p-4 border-1 border-neutral-950 min-[1160px]:w-104 w-full">
                    <h1 className="font-bold text-2xl mb-1 text-center">Cosmetics</h1>
                    <div className="flex flex-row gap-2 items-center mb-1 w-full justify-center">
                      <div className="flex flex-col relative w-full gap-2">
                        <button
                          onClick={() => setShowDropdown(showDropdown ? false : true)}
                          className="flex z-10 flex-row bg-neutral-900 border-1 w-full border-neutral-800 rounded-md p-1.5 px-2.5 items-center duration-300"
                        >
                          <span className="mx-auto translate-x-3.5 font-bold text-xl">
                            {cosmeticName} ({cosmeticValues.filter((c) => c.unlocked === true).length}/{cosmeticValues.length})
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 16 16">
                            <path
                              fill="currentColor"
                              d="M8.35 1.65a.5.5 0 0 0-.707 0l-3.5 3.5a.5.5 0 0 0 .707.707L8 2.707l3.15 3.15a.5.5 0 0 0 .707-.707l-3.5-3.5zm3.55 9.25l-3.5 3.5a.5.5 0 0 1-.707 0l-3.5-3.5a.5.5 0 0 1 .707-.707l3.15 3.15l3.15-3.15a.5.5 0 0 1 .707.707z"
                            />
                          </svg>
                        </button>
                        {showDropdown && (
                          <div className="absolute translate-y-[2.7rem] w-full bg-neutral-900 border-1 border-neutral-800 rounded-md p-2 px-2.5 items-center duration-300">
                            <button
                              key={'Hats'}
                              onClick={() => {
                                setCosmeticValues(user!.unlockedHats);
                                setCosmeticName('Hats');
                                setShowDropdown(false);
                              }}
                              className="flex w-full p-1 rounded-md hover:bg-neutral-800 duration-300"
                            >
                              <span className="font-bold mx-auto text-lg">Hats</span>
                            </button>
                            <button
                              key={'Suits'}
                              onClick={() => {
                                setCosmeticValues(user!.unlockedSuits);
                                setCosmeticName('Suits');
                                setShowDropdown(false);
                              }}
                              className="flex w-full p-1 rounded-md hover:bg-neutral-800 duration-300"
                            >
                              <span className="font-bold mx-auto text-lg">Suits</span>
                            </button>
                            <button
                              key={'Particles'}
                              onClick={() => {
                                setCosmeticValues(user!.unlockedParticles);
                                setCosmeticName('Particles');
                                setShowDropdown(false);
                              }}
                              className="flex w-full p-1 rounded-md hover:bg-neutral-800 duration-300"
                            >
                              <span className="font-bold mx-auto text-lg">Particles</span>
                            </button>
                            <button
                              key={'Death Effects'}
                              onClick={() => {
                                setCosmeticValues(user!.unlockedDeathEffects);
                                setCosmeticName('Death Effects');
                                setShowDropdown(false);
                              }}
                              className="flex w-full p-1 rounded-md hover:bg-neutral-800 duration-300"
                            >
                              <span className="font-bold mx-auto text-lg">Death Effects</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid min-[1160px]:grid-cols-2 min-[730px]:grid-cols-3 min-[425px]:grid-cols-2 grid-cols-1 gap-2 overflow-y-auto max-h-134 w-full">
                      {cosmeticValues.map((cosmetic, index) => (
                        <>
                          <div className={`flex w-full flex-col rounded-md bg-neutral-900 p-2 border-1 ${cosmetic.unlocked ? 'border-minecraft-green' : 'border-minecraft-red'} `} key={cosmetic.name + index}>
                            <img src={`/icons/${cosmetic.name}.png`} className="flex h-14 w-14 mx-auto" />
                            <p className="text-center text-lg">{truncateString(formatCosmetic(cosmetic.name), 16)}</p>
                          </div>
                        </>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
