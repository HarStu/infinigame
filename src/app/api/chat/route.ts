import { google } from '@ai-sdk/google'
import {
  streamText,
  appendResponseMessages,
  createIdGenerator,
  appendClientMessage
} from 'ai'
import type { Message } from 'ai'

import { api } from '@/trpc/server'
import type { ToolName } from '@/lib/game/model-tools'
import { modelTools } from '@/lib/game/model-tools'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // get the chat id and latest message from the client
  const { id, message } = await req.json() as { message: Message, id: string }

  // using the chatId, get information about the chat and game
  const chatInfo = await api.chat.getChatWithGame({ id: id })

  // from the database, get previous messages
  const previousMessages = await api.chat.loadMessages({ id: id })

  // append the new message to the previous messages
  const messages = appendClientMessage({
    messages: previousMessages,
    message
  })

  // Addition to the systemPrompt to incentivize tool calls
  const useToolString = ' When a win or lose condition is met, you must invoke the corresponding tool using a tool call — not by printing or saying it. You must call the winTheGame or loseTheGame tool as an actual function tool call, not as a string, code snippet, or description.'

  // grab system prompt
  const systemPrompt = chatInfo.game.systemPrompt!.concat(useToolString)

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