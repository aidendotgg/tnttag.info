export default function TenThousandWins({ wins }: { wins: number }) {
  const winString = `[${wins}]`;

  return (
    <span className="text-minecraft-red">
      {winString.charAt(0)}
      <span className="text-minecraft-gold">
        {winString.charAt(1)}
        <span className="text-minecraft-yellow">
          {winString.charAt(2)}
          <span className="text-minecraft-green">
            {winString.charAt(3)}
            <span className="text-minecraft-aqua">
              {winString.charAt(4)}
              <span className="text-minecraft-light_purple">
                {winString.charAt(5)}
                <span className="text-minecraft-dark_purple">{winString.charAt(6)}</span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}
