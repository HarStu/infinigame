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

export const zStatus = z.enum(['won', 'lost', 'ongoing'])

// Right now every game uses 'winTheGame' and 'loseTheGame' -- might as well stick with it
export const zGame = z.object({
  name: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  aiIdentity: z.string(),
  requiredTools: z.array(z.enum(['winTheGame', 'loseTheGame'])).length(2)
})

export const zDbGame = z.object({
  name: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  aiIdentity: z.string(),
  requiredTools: z.any(),
  creatorId: z.string().nullable(),
  timesPlayed: z.number().nullable(),
  score: z.number().nullable()
})
export type DbGame = z.infer<typeof zDbGame>

export const zRate = z.object({
  userId: z.string(),
  gameName: z.string(),
  liked: z.boolean()
})
export type Rate = z.infer<typeof zRate>