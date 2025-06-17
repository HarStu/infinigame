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
    maxSteps: 1,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'winTheGame') {
        setGameState('won')
        console.log('You have won')
        // TODO -- WRITE THIS TO THE DATABASE
        return true
      } else if (toolCall.toolName === 'loseTheGame') {
        setGameState('lost')
        console.log('You have lost')
        // TODO -- WRITE THIS TO THE DATABASE
        return true
      }
    },
    // experimental_prepareRequestBody({ messages, id }) {
    //   return { messages: messages[messages.length - 1], id }
    // }

  })

  // Retrieve information about the chat and associated game from the API
  const chatInfo = api.chat.getChatWithGame.useQuery({ id: chatProps.id })

  // Setup the gameState, which will influence how the UI is rendered
  type GameState = 'won' | 'lost' | 'ongoing'
  const [gameState, setGameState] = useState<GameState>()

  // Track if this component has already been initialized
  // This prevents chatInfo from being reset by the useEffect below
  const [init, setInit] = useState(false)

  // Create a useEffect hook to set the initial gameState once chatInfo has been retrieved, 
  // but only once post-initialization
  useEffect(() => {
    if (!init && chatInfo.data?.chat.status) {
      setGameState(chatInfo.data?.chat.status)
      setInit(true)
    }
  }, [chatInfo, init])

  // Setup variables used to modify and style the markup
  let inputPrompt = "say something..."
  let messageContainerClass = "flex-1 border rounded p-4 mt-4 overflow-y-auto transition-all duration-900 ease-in-out"
  if (gameState === 'won') {
    messageContainerClass += " border-green-500"
    inputPrompt = 'you won!'
  } else if (gameState === 'lost') {
    messageContainerClass += " border-red-500"
    inputPrompt = 'you lost!'
  }
  const buttonClass = "flex px-2 min-w-16 border rounded items-center justify-center hover:bg-gray-100"
  const generating = (status === 'submitted' || status === 'streaming')

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
            <strong>{message.role === 'user' ? 'user: ' : (`${chatInfo.data?.game.aiIdentity ?? 'AI'}: `)}</strong>
            {message.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* render spinner (only visible while generating response) */}
      <div className={spinnerClass}>
        <Loader2 className="size-4 animate-spin" />
      </div>

      {/* render error response if an error occurs */}
      {error && (
        <div className="flex pb-4 items-center gap-2">
          An error has occured
          <button
            type="button"
            className={buttonClass}
            onClick={() => reload()}
          >
            retry
          </button>
        </div>
      )}

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