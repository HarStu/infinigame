import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { streamText, appendResponseMessages } from 'ai'

import { api } from '@/trpc/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // get the latest message(s) from the client
  const { messages, id } = await req.json()

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: 'You are a helpful assistant',
    messages,
    async onFinish({ response }) {
      await api.chat.saveMessages({
        id,
        messages: appendResponseMessages({
          messages,
          responseMessages: response.messages
        })
      })
    }
  })

  return result.toDataStreamResponse()
}