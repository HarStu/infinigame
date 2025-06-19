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
    "Adding je ne sais quoi...",
    "Making it new...",
    "Diving into latent space...",
    "Looking for characters...",
    "Removing herobrine...",
    "Throwing in a twist...",
    "Backpropogating...",
    "Redoing it, but better...",
    "Saying 'yes, and'...",
    "Taking acting lessons...",
    "Producing new ideas...",
    "Implementing some fun...",
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
      <Button className="m-4 mb-2" onClick={genNewGame}>
        random new game!
      </Button>
    )
  } else if (state === 'loading') {
    return (
      <Button className='m-4 mb-2 ease-in-out' >
        <div className={`transition-opacity duration-200 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
          {loadText[loadIndex]}
        </div>
        <Loader2 className="size-4 animate-spin" />
      </ Button >
    )
  } else if (state === 'error') {
    return (
      <Button className="m-4 mb-2">
        error, please refresh
      </Button>
    )
  }
}