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

  const sidebarItemClass = "flex items-center justify-center bg-white border-2 pt-4 pb-5 flex-1 rounded"

  return (
    <div className="flex flex-col flex-1 m-4 gap-4">

      {/* sidebar when the player is not logged in*/}
      <div className={sidebarItemClass}>
        <Button onClick={signInWithGoogle}>
          login with google
        </Button>
      </div>

      <div className={sidebarItemClass}>
        <div className='text-center'>
          login to play an infinite selection of games
        </div>
      </div>
    </div>
  )
}