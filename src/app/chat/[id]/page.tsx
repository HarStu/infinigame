import { api } from '@/trpc/server'
import { Chat } from '@/components/chat'
import { GameButton } from '@/components/game-button'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  console.log(`Arrived at /chat/[id]`)
  const { id } = await props.params

  // if chat isn't unowned or owned by the current user,
  // we 404 here
  const isOwner = await api.chat.checkOwnership({ id })
  const chatInfo = await api.chat.getChatWithGame({ id })

  if (!isOwner && chatInfo.chat.owner !== null) {
    return (
      <div className="flex flex-col justify-center items-center">
        <div className="font-bold">
          error: not your chat!
        </div>
        <div>
          if somebody is trying to share a chat with you, ask them to use the sharable link button!
        </div>
        <div>
          or, play this game yourself by clicking below:
        </div>
        <GameButton id={chatInfo.game.id} label="play game!" />
      </div>
    )
  } else {
    const messages = await api.chat.loadMessages({ id })
    return (
      <div>
        <Chat id={id} initialMessages={messages} />
      </div>
    )
  }
}