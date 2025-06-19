'use client'

import { GenGameButton } from '@/components/gen-game-button'


export default function Home() {

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="font-bold justify-center">
        INFINITE GAMES
      </div >
      <GenGameButton />
    </div>
  )

}
