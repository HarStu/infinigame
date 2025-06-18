'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { GenGameButton } from '@/components/gen-game-button'
import { api } from '@/trpc/react'
import { TopGamesSelect } from '@/components/top-games-select'

export function Sidebar() {
  const { data: session } = authClient.useSession()
  const pathname = usePathname()
  const [voteText, setVoteText] = useState('rate this game')

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
  } else {
    return (
      <div className={sideBarClass}>

        {/* new game button */}
        <GenGameButton />

        {/* current game rating options */}
        <div className="text-center font-bold my-4">
          {voteText}
          <div className="flex items-center justify-center">
            <Button className="m-2 bg-green-500 hover:bg-green-700">
              👍
            </Button>
            <Button className="m-2 bg-red-500 hover:bg-red-700">
              👎
            </Button>
          </div>
        </div>

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