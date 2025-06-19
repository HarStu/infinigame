import { api } from "@/trpc/server";
import { redirect } from 'next/navigation'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const chatId = await api.chat.createChat({ id })

  if (!chatId) {
    throw new Error(`Error creating new chat`)
  }

  redirect(`/chat/${chatId}`)
}
