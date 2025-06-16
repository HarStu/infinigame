import { db } from '@/server/db/index'
import { gameConfigs } from '@/lib/game/games'
import { game } from '@/server/db/schema'

export async function pushGamesToServer() {
  for (const gameEntry of gameConfigs) {
    const insertGame: typeof game.$inferInsert = {
      ...gameEntry,
      score: 0,
    }

    // upsert all games
    await db
      .insert(game)
      .values(insertGame)
      .onConflictDoUpdate({
        target: game.name,
        set: {
          description: insertGame.description,
          systemPrompt: insertGame.systemPrompt,
          aiIdentity: insertGame.aiIdentity,
          requiredTools: insertGame.requiredTools
        }
      })
  }
}

pushGamesToServer()
  .then(() => {
    console.log("Game Configs Synced")
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })