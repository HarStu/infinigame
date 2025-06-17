import { z } from 'zod'

import { generateId } from 'ai'
import type { Message } from 'ai'

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { game, chat, message } from "@/server/db/schema"
import { eq, asc } from 'drizzle-orm'

const zMessage = z.object({
  id: z.string(),
  createdAt: z.coerce.date().optional(),
  content: z.string(),
  reasoning: z.string().optional().nullable(),
  role: z.string(),
  data: z.any().optional(),
  parts: z.any().optional(),
  toolInvocations: z.any().optional()
})

export const chatRouter = createTRPCRouter({
  getGame: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const gameRes = await ctx.db.select().from(game).where(eq(game.name, input.name))
      if (gameRes[0]) {
        return gameRes[0]
      } else {
        throw new Error(`Could not find game ${input.name}`)
      }
    }),
  getChat: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const chatRes = await ctx.db.select().from(chat).where(eq(chat.id, input.id))
      if (chatRes[0]) {
        return chatRes[0]
      } else {
        throw new Error(`Could not find chat ${chat.id}`)
      }
    }),
  createChat: publicProcedure
    .input(z.object({ gameName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // include the ownerId if available
      const ownerId = ctx.authSession?.user?.id
      const chatId = generateId()
      await ctx.db.insert(chat).values({
        id: chatId,
        gameName: input.gameName,
        owner: ownerId,
        createdOn: new Date(),
        status: 'ongoing'
      })
      return chatId
    }),
  getChatWithGame: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const chatWithGameRes = await ctx.db.select().from(chat).where(eq(chat.id, input.id)).innerJoin(game, eq(chat.gameName, game.name))
      if (chatWithGameRes[0]) {
        console.log(`Of ${chatWithGameRes.length} returning the following chatWithGame: ${chatWithGameRes[0]}`)
        return chatWithGameRes[0]
      } else {
        throw new Error(`Could not find chat ${chat.id}`)
      }
    }),
  loadMessages: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const msgRes = await ctx.db.select().from(message).where(eq(message.chatId, input.id)).orderBy(asc(message.createdAt))
      const retrievedMessages: Message[] = msgRes.map(msg => msg as Message)
      return retrievedMessages
    }),
  saveMessages: publicProcedure
    .input(z.object({ id: z.string(), messages: z.array(zMessage) }))
    .mutation(async ({ ctx, input }) => {
      for (const msg of input.messages) {
        const insertMsg: typeof message.$inferInsert = {
          ...msg,
          chatId: input.id,
          createdAt: msg.createdAt ?? new Date()
        }

        await ctx.db
          .insert(message)
          .values(insertMsg)
          .onConflictDoUpdate({
            target: message.id,
            set: {
              content: insertMsg.content,
              parts: insertMsg.parts,
              toolInvocations: insertMsg.toolInvocations,
              createdAt: insertMsg.createdAt
            }
          })
      }
    })
})

