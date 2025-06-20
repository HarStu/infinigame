'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import type { DbGame } from '@/lib/schemas'


export function OtherGamesSelect({ getGameCount, showGameCount }: { getGameCount: number, showGameCount: number }) {
  const router = useRouter()

  function goToGame(game: DbGame) {
    router.push(`/game/${game.id}`)
  }

  // Grab the top 'getGameCount' games from the database, plus some random ones
  const gamesResult = api.chat.getGames.useQuery({ count: getGameCount })

  if (gamesResult.isSuccess) {
    // Shuffled the games
    const shuffledGames = [...gamesResult.data].sort(() => Math.random() - 0.5)
    const randomGames = shuffledGames.splice(0, showGameCount)

    return (
      <div className="flex flex-col font-bold items-center gap-2">
        <div>
          try another game
        </div>
        {
          randomGames.map(game => {
            return (
              <Button
                key={game.id}
                onClick={() => goToGame(game)}
                className='mx-8 w-48'
              >
                {game.name}
              </Button>
            )
          })
        }
      </div >
    )

    // returns for loading and error states
  } else if (gamesResult.isPending) {
    return (
      <div>
        loading a selection of top games...
      </div>
    )
  } else if (gamesResult.isError) {
    return (
      <div>
        error retrieving top games
      </div>
    )
  }

}