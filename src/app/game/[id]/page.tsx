import { redirect } from 'next/navigation'

import { api } from "@/trpc/server";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const chatId = await api.chat.createChat({ id })

  redirect(`/chat/${chatId}`)
}
