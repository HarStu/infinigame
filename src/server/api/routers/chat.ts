import { z } from 'zod'

import { generateId } from 'ai'
import type { Message } from 'ai'
import { randomUUID } from 'crypto'

import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc'
import { game, chat, message, rating } from "@/server/db/schema"
import { sql, eq, asc, and, count, isNull, isNotNull } from 'drizzle-orm'

import { zMessage, zChatResult, zDbGame, zRate } from '@/lib/schemas'

import { generateNewGame } from '@/lib/ai-util'

export const chatRouter = createTRPCRouter({

  getGame: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const gameRes = await ctx.db.select().from(game).where(eq(game.id, input.id))
      if (gameRes[0]) {
        return gameRes[0]
      } else {
        throw new Error(`could not find game ${input.id}`)
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
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // include the ownerId if available
      const ownerId = ctx.authSession?.user?.id
      const chatId = generateId()
      await ctx.db.insert(chat).values({
        id: chatId,
        gameId: input.id,
        owner: ownerId,
        createdOn: new Date(),
        status: 'ongoing'
      })
      return chatId
    }),

  getChatWithGame: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const chatWithGameRes = await ctx.db
        .select()
        .from(chat)
        .where(eq(chat.id, input.id))
        .innerJoin(game, eq(chat.gameId, game.id))
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
    .input(z.object({ id: z.string(), status: zChatResult }))
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

  startGameGen: publicProcedure
    .mutation(async ({ ctx }) => {
      // Create a new gameId
      const newGameId = randomUUID()

      // Create a placeholder game with that id
      const insertGame: typeof game.$inferInsert = {
        id: newGameId,
        status: 'generating'
      }

      // Insert the placeholder
      try {
        await ctx.db
          .insert(game)
          .values(insertGame)
      } catch {
        throw new Error('Issue inserting pending game into db')
      }

      // Setup async operation to generate full game and populate placeholder
      generateNewGame()
        .then(async (genGame) => {
          console.log(`GENERATED GAME: ${JSON.stringify(genGame)}`)
          await ctx.db
            .update(game)
            .set({
              ...genGame.object,
              status: 'ready'
            })
            .where(eq(game.id, newGameId))
        })
        .catch(async () => {
          await ctx.db
            .update(game)
            .set({
              status: 'failed'
            })
            .where(eq(game.id, newGameId))
        })

      // Return the gameId used for the placeholder, to be updated with the full game
      return newGameId
    }),

  getGames: protectedProcedure
    .input(z.object({ count: z.number() }))
    .output(z.array(zDbGame))
    .query(async ({ ctx, input }) => {
      // Get the top (count) games
      const topGameRes = await ctx.db
        .select()
        .from(game)
        .where(isNotNull(game.name))
        .orderBy(game.score)
        .limit(input.count)

      // Get an additional (count) random games
      const randomGameRes = await ctx.db
        .select()
        .from(game)
        .where(isNotNull(game.name))
        .orderBy(sql`random()`)
        .limit(input.count)

      // The random games can include top games, so dedupe before we return
      const deduped = Array.from(
        new Map(
          [...topGameRes, ...randomGameRes].map(game => [game.id, game])
        ).values()
      )
      return deduped
    }),

  rateGame: protectedProcedure
    .input(z.object({ id: z.string(), liked: z.boolean().nullable() }))
    .output(zRate)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id
      const insertRating: typeof rating.$inferInsert = {
        userId: userId,
        gameId: input.id,
        liked: input.liked
      }

      const rateRes = await ctx.db
        .insert(rating)
        .values(insertRating)
        .onConflictDoUpdate({
          target: [rating.gameId, rating.userId],
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
          eq(rating.gameId, input.id)
        ))

      const dislikes = await ctx.db
        .select({ count: count() })
        .from(rating)
        .where(and(
          eq(rating.liked, false),
          eq(rating.gameId, input.id)
        ))

      const newScore = (likes[0]?.count ?? 0) - (dislikes[0]?.count ?? 0)

      await ctx.db
        .update(game)
        .set({ score: newScore })
        .where(eq(game.id, input.id))


      if (!rateRes[0]) {
        throw new Error(`Error: user ${userId} could not successfully rate game ${input.id}`)
      } else {
        return rateRes[0]
      }
    }),

  getRating: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(zRate.nullable())
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id
      const rateRes = await ctx.db
        .select()
        .from(rating)
        .where(and(
          eq(rating.userId, userId),
          eq(rating.gameId, input.id)
        ))

      if (!rateRes[0] || rateRes.length === 0) {
        return null
      } else {
        return rateRes[0]
      }
    }),

  claimChat: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.authSession?.user.id) return []

      const chatUpdateRes = await ctx.db
        .update(chat)
        .set({ owner: ctx.authSession.user.id })
        .where(and(
          eq(chat.id, input.id),
          isNull(chat.owner)
        ))
        .returning()

      return chatUpdateRes
    }),

  checkOwnership: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.authSession?.user.id) return false

      const isOwner = await ctx.db
        .select()
        .from(chat)
        .where(and(
          eq(chat.id, input.id),
          eq(chat.owner, ctx.authSession.user.id)
        ))

      if (isOwner.length > 0) {
        return true
      } else
        return false
    })
})
