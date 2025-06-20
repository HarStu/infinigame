
import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { PublicSidebar } from '@/components/sidebar/public-sidebar'
import { PrivateSidebar } from './private-sidebar'


export async function Sidebar() {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  return (
    <div className="flex flex-col w-64 gap-4">
      {session ? <PrivateSidebar /> : <PublicSidebar />}
    </div >
  )
}