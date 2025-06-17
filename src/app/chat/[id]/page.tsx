import { api } from '@/trpc/server'
import { Chat } from '@/components/chat'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  console.log(`Arrived at /chat/[id]`)
  const { id } = await props.params
  const messages = await api.chat.loadMessages({ id })
  return (
    <div>
      <Chat id={id} initialMessages={messages} />
    </div>
  )
}