'use client'

import { usePathname } from 'next/navigation'

import { authClient } from '@/lib/auth-client'
import { api } from '@/trpc/react'

import { Button } from '@/components/ui/button'
import { GenGameButton } from '@/components/gen-game-button'
import { TopGamesSelect } from '@/components/top-games-select'
import { GameRater } from '@/components/game-rater'


export function Sidebar() {
  const { data: session } = authClient.useSession()
  const pathname = usePathname()

  // Grab the chatId from the url
  const chatId = pathname.split('/').filter(segment => Boolean(segment)).pop()

  // this should contain the game name and description!
  const chatResult = api.chat.getChat.useQuery({ id: chatId! })

  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: pathname
    })
  }

  async function signOut() {
    await authClient.signOut()
  }

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
          <TopGamesSelect getGameCount={10} showGameCount={3} />
        </div>

        {/* log out button */}
        <Button className={buttonClass + ' mt-4'} onClick={signOut}>
          log out
        </Button>
      </div >
    )
  }
}