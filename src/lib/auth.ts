import { betterAuth } from "better-auth"
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/server/db/index'

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }
  },
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
})
