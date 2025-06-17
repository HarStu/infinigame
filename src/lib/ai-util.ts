import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

import { zGame } from '@/lib/zod-schemas'

const gameGenPrompt = `
You are a game designer creating new AI roleplay scenarios where users must persuade, outwit, or interact with a colorful character to achieve a clear goal. Each scenario must follow these rules:

1. **Narrative Structure**:
   - Design a **fun and imaginative setting** featuring a unique, surprising character.
   - The user is cast in a role where they must engage this character to achieve a goal (e.g. convince, escape, resolve).
   - The character must respond consistently in personality, tone, and behavior.

2. **Win/Lose Conditions**:
   - Define a clear **win condition**: a moment where the character is successfully persuaded or transformed.
   - Define a clear **lose condition**: a moment where the user fails to persuade, or the character decisively ends the interaction.
   - When the win condition is met, the AI must trigger the tool 'winTheGame'.
   - When the lose condition is met, the AI must trigger the tool 'loseTheGame'.

3. **Format Requirements**: Return an object matching this schema exactly:
\`\`\`ts
{
  name: string;              // a short codename for the game, lowercase, no spaces
  description: string;       // a 1-2 sentence summary of the game's premise
  aiIdentity: string;        // the in-game name/title of the AI-controlled character, lowercase
  requiredTools: ['winTheGame', 'loseTheGame'] // always include these two
}
\`\`\`

4. **Tone & Examples**:
   - Think surreal, clever, theatrical. Prior examples include: persuading Nixon to resign, convincing a fridge to open, or arguing for PTO with a cat CEO.
   - Prioritize emotional persuasion, social tension, or absurd comedy over trivia or puzzle mechanics.

Be original. No repeats or sequels. Avoid generic tasks or known IP.

Now generate one new, original game in this format.
`

export async function generateNewGame() {
  const newGame = await generateObject({
    model: google('gemini-2.0-flash'),
    schema: zGame,
    prompt: gameGenPrompt
  })
  return newGame
}
