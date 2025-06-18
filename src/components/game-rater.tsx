'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'

import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import { game } from '@/server/db/schema'

export function GameRater({ gameName }: { gameName: string }) {
  const [liked, setLiked] = useState<boolean | null>(null)
  const [voteText, setVoteText] = useState<string>('rate this game')

  // Grab an existing rating if already present
  const ratingResult = api.chat.getRating.useQuery({ gameName: gameName })

  // Setup mutations that can be used to update the rating
  const { mutateAsync: likeGame } = api.chat.rateGame.useMutation()
  const { mutateAsync: dislikeGame } = api.chat.rateGame.useMutation()
  const { mutateAsync: nullGame } = api.chat.rateGame.useMutation()

  useEffect(() => {
    if (!ratingResult.data || ratingResult.data.liked === null) {
      setLiked(null)
      setVoteText('rate this game')
    } else if (ratingResult.data?.liked) {
      setLiked(true)
      setVoteText('you like this game')

    } else if (!ratingResult.data?.liked) {
      setLiked(false)
      setVoteText('you dislike this game')
    }
  }, [ratingResult.isSuccess])

  async function clickLike() {
    if (liked) {
      setLiked(null)
      setVoteText('rate this game')
      await nullGame({ gameName: gameName, liked: null })
    } else {
      setLiked(true)
      setVoteText('you like this game')
      await likeGame({ gameName: gameName, liked: true })
    }
  }

  async function clickDislike() {
    if (!liked) {
      setLiked(null)
      setVoteText('rate this game')
      await nullGame({ gameName: gameName, liked: null })
    } else {
      // SET LOADING
      setLiked(false)
      setVoteText('you dislike this game')
      await dislikeGame({ gameName: gameName, liked: false })
    }
  }

  if (ratingResult.isSuccess) {
    return (
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
    )

    // returns for loading and error states
  } else if (ratingResult.isPending) {
    return (
      <div>
        loading...
      </div>
    )
  } else {
    return (
      <div>
        error
      </div>
    )
  }
}