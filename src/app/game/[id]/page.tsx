import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { api } from "@/trpc/server";
import { auth } from '@/lib/auth'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const chatId = await api.chat.createChat({ id })

  // if user is logged in, additionally add ownership to the chat
  // this is a separate step because it's a protected procedure
  const session = auth.api.getSession({
    headers: await headers()
  })


  if (!chatId) {
    throw new Error(`Error creating new chat`)
  }

  redirect(`/chat/${chatId}`)
}
