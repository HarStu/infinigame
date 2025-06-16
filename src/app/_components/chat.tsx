'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import type { Message } from 'ai'
import { createIdGenerator } from 'ai'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/trpc/react'

type ChatProps = {
  id?: string
  initialMessages?: Message[]
}
export function Chat(chatProps: ChatProps) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    id: chatProps.id,
    initialMessages: chatProps.initialMessages,
    sendExtraMessageFields: true,
    generateId: createIdGenerator({
      prefix: 'msgc',
      size: 16,
    }),
  })

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input name="prompt" value={input} onChange={handleInputChange} />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}