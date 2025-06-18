'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import type { DbGame } from '@/lib/schemas'


export function TopGamesSelect({ getGameCount, showGameCount }: { getGameCount: number, showGameCount: number }) {
  const router = useRouter()

  function goToGame(game: DbGame) {
    router.push(`/play/${game.name}`)
  }

  // Grab the top 'getGameCount' games from the database 
  const topGamesResult = api.chat.getTopGames.useQuery({ count: getGameCount })

  if (topGamesResult.isSuccess) {
    // Shuffled the games
    const shuffledGames = [...topGamesResult.data].sort(() => Math.random() - 0.5)
    const randomGames = shuffledGames.splice(0, showGameCount) as DbGame[]

    console.log(`GAMES PICKED: ${randomGames.map(game => game.name)}`)

    return (
      <div className="flex flex-col gap-2 my-4" >
        {
          randomGames.map(game => {
            return (
              <Button
                key={game.name}
                onClick={() => goToGame(game)}
                className='mx-8'
              >
                {game.name}
              </Button>
            )
          })
        }
      </div >
    )

    // returns for loading and error states
  } else if (topGamesResult.isPending) {
    return (
      <div>
        loading a selection of top games...
      </div>
    )
  } else if (topGamesResult.isError) {
    return (
      <div>
        error retrieving top games
      </div>
    )
  }

}