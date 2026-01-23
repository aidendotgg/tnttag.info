import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdown = () => {
    if (showDropdown) {
      setShowDropdown(false);
    } else {
      setShowDropdown(true);
    }
  };

  return (
    <>
      <header className="w-full top-0 fixed flex bg-neutral-950/70 backdrop-blur-sm border-b-1 border-b-neutral-950 z-150">
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-center w-full justify-between">
            <div className="flex flex-row items-center">
              <div onClick={() => router.push('/')} className="flex flex-row z-10 items-center hover:cursor-pointer pl-4 py-0.5">
                <img alt="" className="h-14 p-2" src="/tntblock.png" />
                <h1 className="text-minecraft-white text-2xl">
                  <span className="text-minecraft-red">TNT</span>
                  Tag.info
                </h1>
              </div>
              <nav className="min-[900px]:flex hidden justify-center absolute w-full">
                <ul className="flex flex-row gap-6">
                  <li className="flex">
                    <button className="text-minecraft-white text-xl" onClick={() => router.push('/leaderboard')}>
                      Leaderboard
                    </button>
                  </li>
                  <li className="flex">
                    <a className="text-minecraft-white text-xl" href="https://github.com/aidendotgg/tnttagutilities" target="_blank">
                      Proxy Mod
                    </a>
                  </li>
                  <li className="flex">
                    <a className="text-minecraft-white text-xl" href="https://github.com/aidendotgg/tnttag.info" target="_blank">
                      GitHub
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="min-[900px]:hidden flex pr-4 py-0.5">
              <button onClick={handleDropdown} className="flex">
                {showDropdown ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-10 w-10 fill-white" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-10 w-10 fill-white" viewBox="0 0 16 16">
                    <path
                      fill-rule="evenodd"
                      d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {showDropdown && (
            <ul className="flex flex-col gap-2 pb-2 justify-center items-center w-full">
              <li className="flex">
                <button className="text-minecraft-white text-xl" onClick={() => router.push('/leaderboard')}>
                  Leaderboard
                </button>
              </li>
              <li className="flex">
                <a className="text-minecraft-white text-xl" href="https://github.com/aidendotgg/tnttagutilities" target="_blank">
                  Proxy Mod
                </a>
              </li>
              <li className="flex">
                <a className="text-minecraft-white text-xl" href="https://github.com/aidendotgg/tnttag.info" target="_blank">
                  GitHub
                </a>
              </li>
            </ul>
          )}
        </div>
      </header>
    </>
  );
}
