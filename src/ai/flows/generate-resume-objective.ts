// src/ai/flows/generate-resume-objective.ts
'use server';

/**
 * @fileOverview Generates a personalized resume objective based on the user's skills and experience.
 *
 * - generateResumeObjective - A function that generates a resume objective.
 * - GenerateResumeObjectiveInput - The input type for the generateResumeObjective function.
 * - GenerateResumeObjectiveOutput - The return type for the generateResumeObjective function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeObjectiveInputSchema = z.object({
  skills: z.string().describe('A comma-separated list of the user\u0027s skills.'),
  experience: z.string().describe('A summary of the user\u0027s work experience.'),
  strengths: z.string().describe('A list of the user\u0027s key strengths.'),
  weaknesses: z.string().describe('A list of the user\u0027s weaknesses.'),
});
export type GenerateResumeObjectiveInput = z.infer<typeof GenerateResumeObjectiveInputSchema>;

const GenerateResumeObjectiveOutputSchema = z.object({
  objective: z.string().describe('A personalized resume objective.'),
});
export type GenerateResumeObjectiveOutput = z.infer<typeof GenerateResumeObjectiveOutputSchema>;

export async function generateResumeObjective(input: GenerateResumeObjectiveInput): Promise<GenerateResumeObjectiveOutput> {
  return generateResumeObjectiveFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeObjectivePrompt',
  input: {schema: GenerateResumeObjectiveInputSchema},
  output: {schema: GenerateResumeObjectiveOutputSchema},
  prompt: `You are a resume writing expert. Your goal is to write a compelling resume objective based on the user's skills and experience.

Skills: {{{skills}}}
Experience: {{{experience}}}
Strengths: {{{strengths}}}
Weaknesses: {{{weaknesses}}}

Write a personalized resume objective that highlights the user's key skills and experience. The objective should be concise and tailored to the user's strengths, while also acknowledging areas for growth.
`,
});

const generateResumeObjectiveFlow = ai.defineFlow(
  {
    name: 'generateResumeObjectiveFlow',
    inputSchema: GenerateResumeObjectiveInputSchema,
    outputSchema: GenerateResumeObjectiveOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
