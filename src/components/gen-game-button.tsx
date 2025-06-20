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

  // Random loading text logic
  const loadText = [
    "New game coming up...",
    "Hyping up the AI...",
    "Making it new...",
    "Prob latent space...",
    "Meeting characters...",
    "Thinking hard...",
    "Backpropogating...",
    "Redoing it better...",
    "Saying 'yes, and'...",
    "Acting lessons...",
    "Trying new ideas...",
    "Adding extra fun...",
    "Punching it up...",
  ]

  const [loadIndex, setLoadIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (state !== 'loading') return;

    const fadeOut = setTimeout(() => setVisible(false), 1600)

    const change = setTimeout(() => {
      let newIndex = Math.floor(Math.random() * loadText.length)
      while (newIndex === loadIndex || newIndex === 0) {
        newIndex = Math.floor(Math.random() * loadText.length)
      }
      setLoadIndex(newIndex)
      setVisible(true)
    }, 2000)

    return () => { clearTimeout(fadeOut); clearTimeout(change) }
  }, [loadIndex, state])

  if (state == 'ready') {
    return (
      <Button className="bg-green-200" onClick={genNewGame}>
        roll a new game 🎲
      </Button>
    )
  } else if (state === 'loading') {
    return (
      <Button className="bg-green-200 ease-in-out">
        <div className={`transition-opacity duration-200 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
          {loadText[loadIndex]}
        </div>
        <Loader2 className="size-4 animate-spin" />
      </Button>
    )
  } else if (state === 'error') {
    return (
      <Button className="bg-green-200">
        error, please refresh
      </Button>
    )
  }
}