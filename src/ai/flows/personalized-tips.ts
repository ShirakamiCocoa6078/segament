'use server';

/**
 * @fileOverview Provides personalized tips to users based on their profile history.
 *
 * - getPersonalizedTips - A function that takes a user's profile history and returns personalized tips.
 * - PersonalizedTipsInput - The input type for the getPersonalizedTips function, representing the user's profile history.
 * - PersonalizedTipsOutput - The return type for the getPersonalizedTips function, containing personalized tips.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedTipsInputSchema = z.object({
  userProfileHistory: z
    .string()
    .describe("A string containing the user's profile history, including game data and performance metrics."),
});
export type PersonalizedTipsInput = z.infer<typeof PersonalizedTipsInputSchema>;

const PersonalizedTipsOutputSchema = z.object({
  tips: z
    .string()
    .describe('A string containing personalized tips and challenges for the user to improve their gameplay.'),
});
export type PersonalizedTipsOutput = z.infer<typeof PersonalizedTipsOutputSchema>;

export async function getPersonalizedTips(input: PersonalizedTipsInput): Promise<PersonalizedTipsOutput> {
  return personalizedTipsFlow(input);
}

const personalizedTipsPrompt = ai.definePrompt({
  name: 'personalizedTipsPrompt',
  input: {schema: PersonalizedTipsInputSchema},
  output: {schema: PersonalizedTipsOutputSchema},
  prompt: `You are an expert rhythm game coach. Analyze the user's profile history and provide personalized tips and challenges to help them improve their gameplay. Respond in Korean.

User Profile History: {{{userProfileHistory}}}

Based on this information, provide actionable tips and challenges. Focus on specific areas for improvement.
`,
});

const personalizedTipsFlow = ai.defineFlow(
  {
    name: 'personalizedTipsFlow',
    inputSchema: PersonalizedTipsInputSchema,
    outputSchema: PersonalizedTipsOutputSchema,
  },
  async input => {
    const {output} = await personalizedTipsPrompt(input);
    return output!;
  }
);
