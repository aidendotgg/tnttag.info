export default function Rank({ username, rank, rankColor, plusColor }: { username: string, rank: string, rankColor: string, plusColor: string }) {
    switch (rank) {
        case "NONE":
            return <><span className='text-minecraft-gray'>{username}</span></>
        case "VIP":
            return <><span className='text-minecraft-green'>[VIP]&nbsp;</span><span className='text-minecraft-green'>{username}</span></>
        case "VIP_PLUS":
            return <><span className='text-minecraft-green'>[VIP</span><span className='text-minecraft-gold'>+</span><span className='text-minecraft-green'>]&nbsp;</span><span className='text-minecraft-green'>{username}</span></>
        case "MVP":
            return <><span className='text-minecraft-aqua'>[MVP]&nbsp;</span><span className='text-minecraft-aqua'>{username}</span></>
        case "MVP_PLUS":
            return <><span className='text-minecraft-aqua'>[MVP</span><span style={{ color: plusColor }}>+</span><span className='text-minecraft-aqua'>]&nbsp;</span><span className='text-minecraft-aqua'>{username}</span></>
        case "MVP_PLUS_PLUS":
            return <><span style={{ color: rankColor }}>[MVP</span><span style={{ color: plusColor }}>++</span><span style={{ color: rankColor }}>]&nbsp;</span><span style={{ color: rankColor }}>{username}</span></>
        case "YOUTUBER":
            return <><span className='text-minecraft-red'>[</span><span className='text-minecraft-white'>YOUTUBE</span><span className='text-minecraft-red'>]&nbsp;</span><span className='text-minecraft-red'>{username}</span></>
        case "STAFF":
            return <><span className='text-minecraft-red'>[</span><span className='text-minecraft-gold'>ዞ</span><span className='text-minecraft-red'>]&nbsp;</span><span className='text-minecraft-red'>{username}</span></>
        case "PIG_PLUS_PLUS_PLUS":
            return <><span className='text-minecraft-light_purple'>[PIG</span><span className='text-minecraft-aqua'>+++</span><span className='text-minecraft-light_purple'>]&nbsp;</span><span className='text-minecraft-light_purple'>{username}</span></>
        case "INNIT":
            return <><span className='text-minecraft-light_purple'>[INNIT]&nbsp;</span><span className='text-minecraft-light_purple'>{username}</span></>
        case "MOJANG":
            return <><span className='text-minecraft-gold'>[MOJANG]&nbsp;</span><span className='text-minecraft-gold'>{username}</span></>
        case "EVENTS":
            return <><span className='text-minecraft-gold'>[EVENTS]&nbsp;</span><span className='text-minecraft-gold'>{username}</span></>
        default:
            return <><span className='text-minecraft-gray'>{username}</span></>
    }
}
