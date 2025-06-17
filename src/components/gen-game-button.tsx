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
    const newGameName = await newGame()
    redirect(`/play/${newGameName}`)
  }

  if (!loading) {
    return (
      <Button className="m-4" onClick={genNewGame}>
        Random New Game!
      </Button>
    )
  } else {
    return (
      <Button className="m-4">
        generating your game
        <Loader2 className="size-4 animate-spin" />
      </Button>
    )
  }
}