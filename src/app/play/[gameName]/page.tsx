import { api } from "@/trpc/server";

import { redirect } from 'next/navigation'

export default async function Page(props: { params: Promise<{ gameName: string }> }) {
  const { gameName } = await props.params
  const chatId = api.chat.createChat({ gameName: gameName })

  if (!chatId) {
    throw new Error(`Error creating new chat`)
  }

  redirect(`/api/${chatId}`)
}
