'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { api } from '@/trpc/react'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function GenGameButton() {
  const [loading, setLoading] = useState(false)

  const { mutateAsync: newGame } = api.chat.generateNewGame.useMutation()

  async function genNewGame() {
    setLoading(true)
    const newGameId = await newGame()
    redirect(`/game/${newGameId}`)
  }

  if (!loading) {
    return (
      <Button className="m-4 mb-2" onClick={genNewGame}>
        random new game!
      </Button>
    )
  } else {
    return (
      <Button className="m-4 mb-2">
        cooking a new game
        <Loader2 className="size-4 animate-spin" />
      </Button>
    )
  }
}