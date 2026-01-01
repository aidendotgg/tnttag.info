export default function LeaderNumber({ pos }: { pos: number }) {
  return <span className={`font-bold ${pos === 1 ? 'text-[#ffd700]' : pos === 2 ? 'text-[#c0c0c0]' : pos === 3 ? 'text-[#cd7f32]' : 'text-white'}`}>#{pos}</span>;
}
