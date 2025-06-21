'use client'

import { GameButton } from '@/components/game-button'
import { Loader2 } from 'lucide-react'
import { api } from '@/trpc/react'


export default function Home() {

  const game = api.chat.getRandomGame.useQuery()

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-screen">
      <div className="font-bold justify-center">
        INFINIGAME
      </div >
      {
        game.data?.id ?
          <GameButton id={game.data.id} label="let's play" /> :
          <div className="flex">
            <Loader2 className="size-16 animate-spin" />
          </div>
      }
    </div>
  )

}
