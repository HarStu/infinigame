import { z } from 'zod'

import { generateId } from 'ai'
import type { Message } from 'ai'

import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc'
import { game, chat, message, rating } from "@/server/db/schema"
import { eq, asc, and, count } from 'drizzle-orm'

import { zMessage, zStatus, zDbGame, zRate } from '@/lib/schemas'

import { generateNewGame } from '@/lib/ai-util'

export const chatRouter = createTRPCRouter({
  getGame: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const gameRes = await ctx.db.select().from(game).where(eq(game.name, input.name))
      if (gameRes[0]) {
        return gameRes[0]
      } else {
        throw new Error(`could not find game ${input.name}`)
      }
    }),
  getChat: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const chatRes = await ctx.db.select().from(chat).where(eq(chat.id, input.id))
      if (chatRes[0]) {
        return chatRes[0]
      } else {
        throw new Error(`getChat: could not find chat`)
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
        return chatWithGameRes[0]
      } else {
        throw new Error(`getChatWithGame: could not find chat`)
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
    }),
  updateGameStatus: publicProcedure
    .input(z.object({ id: z.string(), status: zStatus }))
    .mutation(async ({ ctx, input }) => {
      const chatRes = await ctx.db.select().from(chat).where(eq(chat.id, input.id))
      if (chatRes.length !== 1 || chatRes[0] === undefined) {
        throw new Error(`updateGameStatus: could not find chat`)
      } else {
        chatRes[0].status = input.status

        await ctx.db
          .update(chat)
          .set(chatRes[0])
          .where(eq(chat.id, input.id))
      }
    }),
  generateNewGame: publicProcedure
    .mutation(async ({ ctx }) => {
      const newGame = await generateNewGame()
      if (!newGame.object) {
        throw new Error(`Issue generating new game`)
      }
      const insertGame: typeof game.$inferInsert = {
        ...newGame.object,
        creatorId: null,
        timesPlayed: 0,
        score: 0
      }

      await ctx.db
        .insert(game)
        .values(insertGame)

      return newGame.object.name
    }),
  getTopGames: protectedProcedure
    .input(z.object({ count: z.number() }))
    .output(z.array(zDbGame))
    .query(async ({ ctx, input }) => {
      const gameRes = await ctx.db.select().from(game).orderBy(game.score).limit(input.count)
      return gameRes
    }),
  rateGame: protectedProcedure
    .input(z.object({ gameName: z.string(), liked: z.boolean().nullable() }))
    .output(zRate)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id
      const insertRating: typeof rating.$inferInsert = {
        userId: userId,
        gameName: input.gameName,
        liked: input.liked
      }

      const rateRes = await ctx.db
        .insert(rating)
        .values(insertRating)
        .onConflictDoUpdate({
          target: [rating.gameName, rating.userId],
          set: {
            liked: insertRating.liked,
          }
        })
        .returning()

      // with the new rating applied, update the game's score
      const likes = await ctx.db
        .select({ count: count() })
        .from(rating)
        .where(and(
          eq(rating.liked, true),
          eq(rating.gameName, input.gameName)
        ))

      const dislikes = await ctx.db
        .select({ count: count() })
        .from(rating)
        .where(and(
          eq(rating.liked, false),
          eq(rating.gameName, input.gameName)
        ))

      const newScore = (likes[0]?.count ?? 0) - (dislikes[0]?.count ?? 0)

      await ctx.db
        .update(game)
        .set({ score: newScore })
        .where(eq(game.name, input.gameName))


      if (!rateRes[0]) {
        throw new Error(`Error: user ${userId} could not successfully rate game ${input.gameName}`)
      } else {
        return rateRes[0]
      }
    }),
  getRating: protectedProcedure
    .input(z.object({ gameName: z.string() }))
    .output(zRate.nullable())
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id
      const rateRes = await ctx.db
        .select()
        .from(rating)
        .where(and(
          eq(rating.userId, userId),
          eq(rating.gameName, input.gameName)
        ))

      if (!rateRes[0] || rateRes.length === 0) {
        return null
      } else {
        return rateRes[0]
      }
    })
})
