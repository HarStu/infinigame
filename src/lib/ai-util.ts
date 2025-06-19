import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'

import { zGame } from '@/lib/schemas'

const gameGenPrompt = `
You are a game designer creating original AI roleplay scenarios where the user must persuade, outwit, or emotionally move a vivid, eccentric character to achieve a goal.

Each scenario must follow the rules below. All elements must be returned in the specified format at the end.

---

1. **Narrative Concept**:
   - Invent a **striking, imaginative scenario** featuring a unique AI-controlled character with a strong personality (e.g. aloof CEO cat, haunted fridge, weary king).
   - The user plays an active role in this world (e.g. petitioner, intruder, employee, child).
   - The gameplay is built around **social interaction**, persuasion, and character-driven conflict.

---

2. **System Prompt (Required):**
   - Write the 'systemPrompt' as if you're instructing the AI how to roleplay the character.
   - It must:
     - Describe the AI character’s personality, tone, and role in detail.
     - Explain how the character should behave consistently throughout the conversation.
     - Specify **clear WIN and LOSE conditions**—what the user must do to succeed or fail.
     - For each condition, define the exact moment and logic for invoking a tool:
       - When the WIN condition is met, the AI **must call the tool** 'winTheGame'.
       - When the LOSE condition is met, the AI **must call the tool** 'loseTheGame'.
     - Make sure tool calls happen **immediately** and are **never omitted** when the condition is triggered.
   - Write the system prompt in **natural, fluent prose**, as if briefing a roleplayer or actor.

---

3. **Schema Format (Strict)**:
Return only an object with the following structure:

\`\`\`ts
{
  name: string;              // a short, lowercase codename for the game (no spaces or underscores. if it must be multiple words, concatenatethemlikethis)
  description: string;       // a 1 sentence summary of the game's premise, identifying the user's role, ai's role, and user's objective. Addressed to the user
  aiIdentity: string;        // the in-game name/title of the AI character, lowercase
  systemPrompt: string;      // the full system prompt as described above
  requiredTools: ['winTheGame', 'loseTheGame'] // always exactly these two tools
}
\`\`\`

---

4. **Tone and Inspiration**:
   - Think surreal, clever, or historic.
   - Prior examples: persuading Nixon to resign, begging PTO from a cat CEO, teaching genghis khan to golf
   - Avoid trivia, combat, puzzles, whimsy, or known IP. 
   - Embrace real-world historical characters in realistic or contemporary contexts
   - Focus on juxtaposition and deadpan absurdity—**not mechanics, lore, pathos, or melodrama**.
   - Do not use the word 'whimsical' or associated adjectives
   - DO NOT BE CRINGE

Generate one brand-new game concept that strictly follows this format and rules.
`

export async function generateNewGame() {
  console.time('GAME GEN')
  const newGame = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: zGame,
    prompt: gameGenPrompt,
    temperature: 1.1
  })
  console.timeEnd('GAME GEN')
  return newGame
}
