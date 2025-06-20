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

  const sidebarItemClass = "flex items-center justify-center bg-white border-2 pt-4 pb-5 flex-1 rounded"

  return (
    <div className="flex flex-col flex-1 m-4 gap-4">

      {/* new game button */}
      <div className={sidebarItemClass}>
        <GenGameButton />
      </div>

      {/* current game rating options */}
      <div className={sidebarItemClass}>
        {
          chatResult.data?.gameId ?
            <GameRater gameId={chatResult.data.gameId} /> :
            <div className="flex items-center justify-center">loading gamerater</div>
        }
      </div>

      {/* game selection */}
      <div className={sidebarItemClass}>
        {otherGames}
      </div>

      {/* share button */}
      <div className={sidebarItemClass}>
        <Button className='w-36' onClick={handleCopy}>
          {copyButtonText}
        </Button>
      </div>

      {/* log out button */}
      <div className={sidebarItemClass}>
        <Button onClick={signOut}>
          log out
        </Button>
      </div>
    </div >
  )
}
