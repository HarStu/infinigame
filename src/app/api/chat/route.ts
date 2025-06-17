import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import {
  streamText,
  appendResponseMessages,
  createIdGenerator,
  appendClientMessage
} from 'ai'
import { z } from 'zod'

import { api } from '@/trpc/server'
import type { ToolName } from '@/lib/game/model-tools'
import { modelTools } from '@/lib/game/model-tools'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // get the chat id and latest message(s) from the client
  const { messages, id } = await req.json()

  // from the chatId, get information about the chat and game
  const chatInfo = await api.chat.getChatWithGame({ id: id })

  // grab system prompt
  const systemPrompt = chatInfo.game.systemPrompt

  // setup tools
  const requiredTools = chatInfo.game.requiredTools as ToolName[]
  const toolList = Object.entries(modelTools)
  const filteredToolList = toolList.filter(tool => requiredTools.includes(tool[0] as ToolName))
  const systemTools = Object.fromEntries(filteredToolList)

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: systemPrompt,
    messages,
    tools: systemTools,
    experimental_generateMessageId: createIdGenerator({
      prefix: 'msgs',
      size: 16,
    }),
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