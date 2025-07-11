'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function GameButton({ id, label }: { id: string, label: string }) {
  const router = useRouter()

  function goToGame() {
    router.push(`/game/${id}`)
  }

  return (
    <Button className="m-4 mb-2 w-32 mx-auto bg-green-200" onClick={goToGame}>
      {label}
    </Button>
  )
}