import { redirect } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/trpc/react'

export default async function Page() {
  return (
    <div>
      hello world
    </div>
  )
}