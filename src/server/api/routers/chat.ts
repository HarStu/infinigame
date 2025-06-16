import { z } from 'zod'

import { generateId } from 'ai'
import type { Message } from 'ai'

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { game, chat, message } from "@/server/db/schema"
import { eq } from 'drizzle-orm'

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
      await ctx.db.insert(chat).values({
        id: generateId(),
        gameName: input.gameName,
        owner: ownerId,
        createdOn: new Date(),
        status: 'ongoing'
      })
    })
})

