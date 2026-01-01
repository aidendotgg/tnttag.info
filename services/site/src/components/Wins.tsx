import TenThousandWins from './10000Wins';

const winsColorMap = new Map<number, string>([
  [5000, 'black'],
  [2500, 'red'],
  [1500, 'gold'],
  [1000, 'dark_purple'],
  [500, 'blue'],
  [250, 'green'],
  [100, 'dark_green'],
  [50, 'white'],
  [15, 'gray'],
  [0, 'dark_gray'],
]);

export default function Wins({ wins }: { wins: number }) {
  if (wins >= 10000) {
    return <TenThousandWins wins={wins} />;
  }
  for (const [milestone, textColor] of winsColorMap) {
    if (wins >= milestone) {
      return <span className={`text-minecraft-${textColor}`}>[{wins}]</span>;
    }
  }

  return <></>;
}
