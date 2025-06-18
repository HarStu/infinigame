'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { api } from '@/trpc/react'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const [loading, setLoading] = useState(false)

  const { mutateAsync: newGame } = api.chat.generateNewGame.useMutation()

  async function genNewGame() {
    setLoading(true)
    const newGameName = await newGame()
    redirect(`/play/${newGameName}`)
  }

  if (!loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div>
          <div className="font-bold justify-center">
            INFINITE GAMES
          </div >
        </div>
        <Button className="m-4 mb-2 justify-center" onClick={genNewGame}>
          let's go
        </Button>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div>
          <div className="font-bold">
            INFINITE GAMES
          </div >
        </div>
        <Button className="m-4 mb-2">
          <Loader2 className="size-4 animate-spin" />
        </Button>
      </div>
    )
  }

}
