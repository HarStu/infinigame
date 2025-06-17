'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { usePathname } from 'next/navigation'
import { GenGameButton } from '@/components/gen-game-button'

export function Sidebar() {
  const { data: session } = authClient.useSession()
  const pathname = usePathname()

  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: pathname
    })
  }

  async function signOut() {
    await authClient.signOut()
  }

  const sideBarClass = "flex flex-col w-64"
  const buttonClass = "m-4"

  if (!session) {
    return (
      <div className={sideBarClass}>
        <Button className={buttonClass} onClick={signInWithGoogle}>
          Login with google
        </Button>
        <div className="m-4 py-4 border rounded text-center text-wrap">
          Login to play an infinite selection of games!
        </div>
      </div>
    )
  } else {
    return (
      <div className={sideBarClass}>
        <Button className={buttonClass} onClick={signOut}>
          Log out
        </Button>
        <GenGameButton />
      </div>
    )
  }
}