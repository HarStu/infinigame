'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'

import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'

export function GameRater({ gameName }: { gameName: string }) {
  const [liked, setLiked] = useState<boolean | null>(null)
  const [voteText, setVoteText] = useState<string>('rate this game')

  // Grab an existing rating if already present
  const ratingResult = api.chat.getRating.useQuery({ gameName: gameName })

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

  function clickLike() {
    if (liked) {
      // TODO -- MUTATION! LOADING TILL THEN!
      setLiked(null)
      setVoteText('rate this game')
    } else {
      // TODO -- MUTATION! LOADING TILL THEN!
      setLiked(true)
      setVoteText('you like this game')
    }
  }

  function clickDislike() {
    if (!liked) {
      // TODO -- MUTATION! LOADING TILL THEN!
      setLiked(null)
      setVoteText('rate this game')
    } else {
      // TODO -- MUTATION! LOADING TILL THEN!
      setLiked(false)
      setVoteText('you dislike this game')
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