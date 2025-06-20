
import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { PublicSidebar } from '@/components/sidebar/public-sidebar'
import { PrivateSidebar } from './private-sidebar'


export async function Sidebar() {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return <PublicSidebar />
  } else {
    return <PrivateSidebar />
  }
}