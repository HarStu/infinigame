import { z } from 'zod'

export const zMessage = z.object({
  id: z.string(),
  createdAt: z.coerce.date().optional(),
  content: z.string(),
  reasoning: z.string().optional().nullable(),
  role: z.string(),
  data: z.any().optional(),
  parts: z.any().optional(),
  toolInvocations: z.any().optional()
})

export const zChatResult = z.enum(['won', 'lost', 'ongoing'])
export const zGameStatus = z.enum(['ready', 'failed', 'generating'])

// Right now every game uses 'winTheGame' and 'loseTheGame' -- might as well stick with it
export const zGame = z.object({
  name: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  aiIdentity: z.string(),
  requiredTools: z.array(z.enum(['winTheGame', 'loseTheGame'])).length(2)
})

export const zDbGame = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  systemPrompt: z.string().nullable(),
  aiIdentity: z.string().nullable(),
  requiredTools: z.any().nullable(),
  creatorId: z.string().nullable(),
  timesPlayed: z.number().nullable(),
  score: z.number().nullable(),
  status: zGameStatus
})
export type DbGame = z.infer<typeof zDbGame>

export const zRate = z.object({
  gameId: z.string(),
  userId: z.string(),
  liked: z.boolean().nullable()
})
export type Rate = z.infer<typeof zRate>