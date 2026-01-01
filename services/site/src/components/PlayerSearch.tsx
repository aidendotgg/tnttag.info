import { tntFetch } from "@tnttag/fetch";
import { User } from "@tnttag/interfaces";
import { useRouter } from "next/router";
import { useEffect, useState } from "react"

export default function PlayerSearch() {
    const router = useRouter()

    const [identifier, setIdentifier] = useState("");
    const [autoComplete, setAutoComplete] = useState<User[]>([])
    const [autoCompleteLoading, setAutoCompleteLoading] = useState(false);

    const [highlightIndex, setHighlightIndex] = useState(-1)

    useEffect(() => {
        if (!identifier) return
        if (identifier.length < 3) return
        const usernameRegex = /^[a-zA-Z0-9_]{1,16}$/
        if (!usernameRegex.test(identifier)) return

        setAutoCompleteLoading(true)
        let autoCompleteTimeout = setTimeout(async () => {
            let autocompleteReq = await tntFetch(`${process.env.BACKEND_URL}/user/autocomplete?name=${identifier}`)

            if (!autocompleteReq.res?.ok || !autocompleteReq.data) {
                setAutoCompleteLoading(false)
                return
            }
            
            setAutoComplete(autocompleteReq.data.players)
            setAutoCompleteLoading(false)
        }, 300)

        return () => {
            clearTimeout(autoCompleteTimeout)
            setAutoComplete([])
            setHighlightIndex(-1)
        }
    }, [identifier])

    useEffect(() => {
        let enterEvent = (e: KeyboardEvent) => {
            if (e.key === "Enter" && autoComplete.length > 0 && highlightIndex !== -1) {
                router.push(`/p/${autoComplete[highlightIndex]._id}`)
            } else if (e.key === "Enter" && identifier.length > 0) {
                router.push(`/p/${identifier}`)
            }
        }

        window.addEventListener("keydown", enterEvent)

        return () => {
            window.removeEventListener("keydown", enterEvent)
        }
    }, [identifier, autoComplete, highlightIndex])

    return (
        <div className="flex flex-row gap-2 items-center mb-1 w-full justify-center">
            <div className="flex flex-col relative w-full gap-2">
                <input
                    id="player"
                    name="player"
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                        setIdentifier(e.target.value)
                    }}
                    className="w-full bg-neutral-900 border-1 z-10 border-neutral-800 text-white text-xl placeholder:text-gray-300 placeholder:text-xl p-2 rounded-md outline-none"
                    placeholder="Player"
                    autoComplete="off"
                    onKeyDown={(e) => {
                        if (e.key === "Tab") {
                            const element = document.getElementById("resultbox")

                            e.preventDefault()
                            if (highlightIndex < autoComplete.length - 1) {
                                if (e.shiftKey) {
                                    setHighlightIndex(highlightIndex - 1)
                                    if (element) element.scrollTop = 44 * (highlightIndex - 2)
                                } else {
                                    setHighlightIndex(highlightIndex + 1)
                                    if (element) element.scrollTop = 44 * highlightIndex
                                }
                            } else {
                                setHighlightIndex(0)
                                if (element) element.scrollTop = 0
                            }
                        }
                    }}
                />
                {identifier && identifier.length >= 3 &&
                    <div id="resultbox" className="absolute translate-y-[3.2rem] w-full max-h-48 overflow-y-auto bg-neutral-900 border-1 border-neutral-800 rounded-md items-center duration-300">
                        {autoCompleteLoading &&
                            <p className="text-white text-center p-2 text-xl">Loading...</p>
                        }
                        {autoComplete.length === 0 && !autoCompleteLoading &&
                            <p className="text-white text-center p-2 text-xl">No players found</p>
                        }
                        <ul className="flex flex-col">
                            {autoComplete.map((player: User, i) => (
                                <li key={player._id} className="flex">
                                    <button onClick={() => router.push(`/p/${player._id}`)} className={`${i === highlightIndex ? 'bg-neutral-800' : ''} flex flex-row gap-2 items-center hover:bg-neutral-800 w-full px-2 py-1.5`}>
                                        <img alt="" className="w-8 h-8 rounded-sm" loading="lazy" src={`https://minotar.net/avatar/${player._id}`} />
                                        <p className="text-white text-xl">{player.username}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                }
            </div>
        </div>
    )
}