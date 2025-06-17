import { z } from 'zod';

export type ToolName = 'winTheGame' | 'loseTheGame'

export const modelTools = {
  winTheGame: {
    description: "Use when the player has won the game you are roleplaying",
    parameters: z.object({}),
    execute: async ({ }) => {
      console.log('winTheGame executed')
      return true
    }
  },
  loseTheGame: {
    description: "Use when the player has lost the game you are roleplaying",
    parameters: z.object({}),
    execute: async ({ }) => {
      console.log('loseTheGame executed')
      return true
    }
  }
}
