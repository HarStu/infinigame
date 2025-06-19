'use client'

import { usePathname } from 'next/navigation'
import { useState, useMemo } from 'react'
import clsx from 'clsx'

import { authClient } from '@/lib/auth-client'
import { api } from '@/trpc/react'

import { Button } from '@/components/ui/button'
import { GenGameButton } from '@/components/gen-game-button'
import { OtherGamesSelect } from '@/components/other-games-select'
import { GameRater } from '@/components/game-rater'


export function Sidebar() {
  const { data: session } = authClient.useSession()
  const pathname = usePathname()

  // grab the chatId from the url
  const chatId = pathname.split('/').filter(segment => Boolean(segment)).pop()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  console.log(baseUrl)
  // create a sharable link from the url
  const shareLink = `${baseUrl}${pathname.replace('/chat/', '/share/')}`

  // this should contain the game name and description!
  const chatResult = api.chat.getChat.useQuery({ id: chatId! })

  // function for logging in with google
  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: pathname
    })
  }

  // function for signing out
  async function signOut() {
    await authClient.signOut()
  }

  // handle copying sharable link to the clipboard
  async function handleCopy() {
    await navigator.clipboard.writeText(shareLink);
    setCopyButtonText('copied!')
    setJustCopied(true)

    setTimeout(() => {
      setJustCopied(false)
      setCopyButtonText('copy sharable link')
    }, 3000)
  }

  // useMemo to cache GetTopGames so it doesn't constantly refresh
  // the sessionSeed re-runs on refresh, which triggers the useMemo to re-cache
  const [sessionSeed] = useState(() => Date.now())
  const otherGames = useMemo(() => (
    <OtherGamesSelect getGameCount={50} showGameCount={5} />
  ), [sessionSeed])


  const [copyButtonText, setCopyButtonText] = useState('copy sharable link')
  const [justCopied, setJustCopied] = useState(false)

  const sideBarClass = "flex flex-col w-64 m-4 bg-gray-200 border rounded-2xl"
  const buttonClass = "mx-4 my-2"

  if (!session) {
    return (
      <div className={sideBarClass}>

        {/* sidebar when the player is not logged in*/}
        <Button className={buttonClass} onClick={signInWithGoogle}>
          login with google
        </Button>
        <div className="m-4 py-4 border rounded-2xl text-center text-wrap">
          login to play an infinite selection of games
        </div>
      </div>
    )
  } else if (chatResult.data?.gameId) {
    return (
      <div className={sideBarClass}>

        {/* new game button */}
        <GenGameButton />

        {/* current game rating options */}
        <GameRater gameId={chatResult.data.gameId} />

        {/* game selection */}
        <div className="text-center font-bold my-4">
          try another game
          {otherGames}
        </div>

        {/* share button */}
        <Button className={clsx(buttonClass + 'mt-4 ', justCopied && 'bg-gray-600 hover:bg-gray-600')} onClick={handleCopy}>
          {copyButtonText}
        </Button>

        {/* log out button */}
        <Button className={buttonClass + ' mt-8'} onClick={signOut}>
          log out
        </Button>
      </div >
    )
  }
}