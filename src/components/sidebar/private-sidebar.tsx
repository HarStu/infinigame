'use client'


import { usePathname } from 'next/navigation'
import { useState, useMemo } from 'react'
import clsx from 'clsx'

import { authClient } from '@/lib/auth-client'
import { api } from '@/trpc/react'

import { Button } from '@/components/ui/button'
import { GenGameButton } from '@/components/gen-game-button'
import { OtherGamesSelect } from '@/components/other-games-select'
import { GameRater } from '@/components/game-rater'


export function PrivateSidebar() {
  const pathname = usePathname()

  // grab the chatId from the url
  const chatId = pathname.split('/').filter(segment => Boolean(segment)).pop()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  console.log(baseUrl)
  // create a sharable link from the url
  const shareLink = `${baseUrl}${pathname.replace('/chat/', '/share/')}`

  // this should contain the game name and description!
  const chatResult = api.chat.getChat.useQuery({ id: chatId! })

  // function for signing out
  async function signOut() {
    await authClient.signOut()
    window.location.reload()
  }

  // handle copying sharable link to the clipboard
  async function handleCopy() {
    await navigator.clipboard.writeText(shareLink);
    setCopyButtonText('copied!')
    setJustCopied(true)

    setTimeout(() => {
      setJustCopied(false)
      setCopyButtonText('copy sharable link')
    }, 3000)
  }

  // useMemo to cache GetTopGames so it doesn't constantly refresh
  const otherGames = useMemo(() => (
    <OtherGamesSelect getGameCount={50} showGameCount={5} />
  ), [])


  const [copyButtonText, setCopyButtonText] = useState('copy sharable link')
  const [justCopied, setJustCopied] = useState(false)

  const sideBarClass = "flex flex-col w-64 m-4 bg-gray-200 border rounded-2xl"
  const buttonClass = "mx-4 my-2"

  return (
    <div className={sideBarClass}>

      {/* new game button */}
      <GenGameButton />

      {/* current game rating options */}
      {
        chatResult.data?.gameId ?
          <GameRater gameId={chatResult.data.gameId} /> :
          <div className="flex items-center justify-center">loading gamerater</div>
      }

      {/* game selection */}
      <div className="text-center font-bold my-4">
        try another game
        {otherGames}
      </div>

      {/* share button */}
      <Button className={clsx(buttonClass + 'mt-4 ', justCopied && 'bg-gray-600 hover:bg-gray-600')} onClick={handleCopy}>
        {copyButtonText}
      </Button>

      {/* log out button */}
      <Button className={buttonClass + ' mt-8'} onClick={signOut}>
        log out
      </Button>
    </div >
  )
}
