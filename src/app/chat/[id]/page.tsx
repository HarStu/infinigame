import { api } from '@/trpc/server'
import { Chat } from '@/components/chat'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  console.log(`Arrived at /chat/[id]`)
  const { id } = await props.params
  const messages = await api.chat.loadMessages({ id })
  const chatInfo = await api.chat.getChat({ id })

  // if chat isn't unowned or owned by the current user,
  // we 404 here

  return (
    <div>
      <Chat id={id} initialMessages={messages} />
    </div>
  )
}