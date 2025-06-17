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
  aiIdentity: z.string(),
  requiredTools: z.tuple([z.literal('winTheGame'), z.literal('loseTheGame')])
})
