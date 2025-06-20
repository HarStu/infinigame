'use server'

import { GameButton } from '@/components/game-button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/trpc/server'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  // Get information about the chat and the game
  const { id } = await props.params
  const chatInfo = await api.chat.getChatWithGame({ id })

  // Get all the previous messages 
  const messages = await api.chat.loadMessages({ id })

  let messageContainerClass = "border-2 flex-1 rounded bg-white p-4 mt-4 mb-6 overflow-y-auto transition-all duration-900 ease-in-out"
  if (chatInfo.chat.status === 'won') {
    messageContainerClass += " border-green-500"
  } else if (chatInfo.chat.status === 'lost') {
    messageContainerClass += " border-red-500"
  }

  // If there's no data, return an error
  if (!chatInfo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>
          error fetching chat history
        </div>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col w-full h-screen justify-center max-w-md mx-auto">
        {/* game information */}
        <div className="items-center text-center mt-4">
          <strong>game: </strong>{chatInfo.game.name}
        </div>
        <div className="items-center text-center">
          <strong>total messages: </strong>{messages.length}
        </div>
        <div className="items-center text-center ">
          <strong>status: </strong>{chatInfo.chat.status}
        </div>

        {/* render messages */}
        <ScrollArea className={messageContainerClass}>
          {messages.map(message => (
            <div key={message.id} className='p-1'>
              <strong>{message.role === 'user' ? 'user: ' : (`${chatInfo.game.aiIdentity ?? 'AI'}: `)}</strong>
              {message.content}
            </div>
          ))}
        </ScrollArea>

        {/* link back to the game */}
        <div className="mx-auto max-w-md text-center font-bold">
          want to play this one?
        </div>

        <GameButton id={chatInfo.game.id} label='go to game' />

        <div className="h-8" />
      </div >
    )
  }

}