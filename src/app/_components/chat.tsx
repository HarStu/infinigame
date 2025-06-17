'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import type { Message } from 'ai'
import { createIdGenerator } from 'ai'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/trpc/react'
import { chat } from '@/server/db/schema'

type ChatProps = {
  id: string
  initialMessages?: Message[]
}
export function Chat(chatProps: ChatProps) {
  // Setup usechat hook
  const { messages, input, handleInputChange, handleSubmit, status, stop, error, reload } = useChat({
    id: chatProps.id,
    initialMessages: chatProps.initialMessages,
    sendExtraMessageFields: true,
    generateId: createIdGenerator({
      prefix: 'msgc',
      size: 16,
    }),
  })

  // Retrieve information about the chat and associated game from the API
  const chatInfo = api.chat.getChatWithGame.useQuery({ id: chatProps.id })

  // Setup the gameState, which will influence how the UI is rendered
  type GameState = 'won' | 'lost' | 'ongoing'
  const [gameState, setGameState] = useState<GameState>()

  // Create a useEffect hook to set the initial gameState once chatInfo has been retrieved
  useEffect(() => {
    setGameState(chatInfo.data?.chat.status)
  }, [chatInfo])

  // Setup variables used to modify and style the markup
  let inputPrompt = "say something..."
  let messageContainerClass = "flex-1 border rounded p-4 mt-4 overflow-y-auto transition-all duration-900 ease-in-out"
  if (gameState === 'won') {
    messageContainerClass += " border-green-500"
    inputPrompt = 'you lost!'
  } else if (gameState === 'lost') {
    messageContainerClass += " border-red-500"
    inputPrompt = 'you won!'
  }
  const buttonClass = "flex px-2 min-w-16 border rounded items-center justify-center"
  const generating = (status === 'submitted' || status === 'streaming')
  console.log(status)

  let spinnerClass = "flex items-center transition-all duration-300 ease-in-out h-4"
  spinnerClass += generating ? " opacity-100 h-8 p-1" : " opacity-0"

  const bottomRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto h-screen">

      {/* render title and description information */}
      <div className="text-center font-bold">
        {chatInfo.data ? chatInfo.data.game.name : 'loading...'}
      </div>
      <div className="text-center text-sm">
        {chatInfo.data ? chatInfo.data.game.description : 'loading...'}
      </div>


      {/* render messages */}
      <div className={messageContainerClass}>
        {messages.map(message => (
          <div key={message.id} className='p-1'>
            <strong>{message.role === 'user' ? 'User: ' : (`${chatInfo.data?.game.aiIdentity ?? 'AI'}: `)}</strong>
            {message.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={spinnerClass}>
        <Loader2 className="size-4 animate-spin" />
      </div>

      {/* render submission form */}
      <form onSubmit={handleSubmit} className="flex gap-2 pb-6 justify-end">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder={inputPrompt}
          className="flex-1 p-2 border rounded"
          disabled={error !== null && gameState !== 'ongoing'}
        />
        {(status === 'ready') ?
          <button type='submit' className={buttonClass}>send</button> :
          <button type='submit' className={buttonClass} onClick={() => stop()}>cancel</button>
        }
      </form>
    </div >
  )
}