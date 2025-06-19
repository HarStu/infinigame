'use client'

import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import { Loader2 } from 'lucide-react'

export function GenGameButton() {
  const [state, setState] = useState<'ready' | 'loading' | 'error'>('ready')
  const [gameId, setGameId] = useState<string | null>(null)

  // Mutation hook (creates skeleton game row)
  const { mutateAsync: newGame } = api.chat.startGameGen.useMutation()

  // Polling query (enabled once Mutation hook has ran)
  const { data: game } = api.chat.getGame.useQuery(
    { id: gameId! },
    {
      refetchInterval: 1000,
      enabled: !!gameId,
    }
  )

  // UseEffect to redirect once the game status is ready
  // runs whenever 'game' changes
  useEffect(() => {
    if (game?.status === 'ready') {
      redirect(`/game/${game.id}`)
    } else if (game?.status === 'failed') {
      setState('error')
    }
  }, [game])

  // function which sets gameId, starting the whole process
  async function genNewGame() {
    setState('loading')
    const newGameId = await newGame()
    setGameId(newGameId)
  }

  if (state == 'ready') {
    return (
      <Button className="m-4 mb-2" onClick={genNewGame}>
        random new game!
      </Button>
    )
  } else if (state === 'loading') {
    return (
      <Button className="m-4 mb-2">
        cooking a new game
        <Loader2 className="size-4 animate-spin" />
      </Button>
    )
  } else if (state === 'error') {
    <Button className="m-4 mb-2">
      error generating game
      <Loader2 className="size-4 animate-spin" />
    </Button>
  }
}