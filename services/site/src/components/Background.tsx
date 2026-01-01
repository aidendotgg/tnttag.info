import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Background() {
  const [bg1Index, setBg1Index] = useState(1);
  const [bg2Index, setBg2Index] = useState(-1);
  const [bgFlip, setBgFlip] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    if (firstLoad) {
      setFirstLoad(false);
      setBg2Index(Math.floor(Math.random() * 11) + 11);
      return;
    }

    if (bgFlip) {
      setTimeout(() => {
        setBg1Index(Math.floor(Math.random() * 10) + 1);
      }, 501);
    } else if (!bgFlip) {
      setTimeout(() => {
        setBg2Index(Math.floor(Math.random() * 11) + 11);
      }, 501);
    }

    setBgFlip(!bgFlip);
  }, [router.asPath]);

  return (
    <aside className="fixed w-screen h-screen z-[-5] blur-[10px] brightness-[0.7]">
      <img alt={`TNT Tag Map Background 1`} className={`absolute object-cover w-full h-full ${bgFlip ? 'opacity-100' : 'opacity-0'} duration-500`} src={`/backgrounds/${bg1Index}.png`} />
      <img alt={`TNT Tag Map Background 2`} className={`absolute object-cover w-full h-full ${bgFlip ? 'opacity-0' : 'opacity-100'} duration-500`} src={`/backgrounds/${bg2Index}.png`} />
    </aside>
  );
}
