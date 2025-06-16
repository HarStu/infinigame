import { createAuthClient } from 'better-auth/react'

export const authCleint = createAuthClient({
  baseURL: process.env.BASE_URL
})