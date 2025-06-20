'use client'

import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export function PublicSidebar() {

  const pathname = usePathname()

  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: pathname
    })
  }

  const buttonClass = "mx-4 my-4"

  return (
    <div className="flex flex-col items-center">
      {/* sidebar when the player is not logged in*/}
      <Button className={buttonClass} onClick={signInWithGoogle}>
        login with google
      </Button>
      <div className="m-4 py-4 border-2 rounded text-center text-wrap">
        login to play an infinite selection of games
      </div>
    </div>
  )
}