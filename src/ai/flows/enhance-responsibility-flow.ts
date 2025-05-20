
'use server';
/**
 * @fileOverview Enhances a single resume responsibility/bullet point using AI.
 *
 * - enhanceResponsibility - A function that provides AI-powered suggestions for a responsibility.
 * - EnhanceResponsibilityInput - The input type for the enhanceResponsibility function.
 * - EnhanceResponsibilityOutput - The return type for the enhanceResponsibility function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceResponsibilityInputSchema = z.object({
  originalResponsibility: z.string().describe('The original responsibility/bullet point text to be enhanced.'),
  role: z.string().optional().describe('The job role associated with this responsibility, for context.'),
  jobAnalysisContext: z.string().optional().describe('Context from a job description analysis, if available, to tailor the enhancement.'),
});
export type EnhanceResponsibilityInput = z.infer<typeof EnhanceResponsibilityInputSchema>;

const EnhanceResponsibilityOutputSchema = z.object({
  suggestedResponsibilities: z.array(z.string()).describe('An array of 2-3 AI-enhanced responsibility suggestions.'),
});
export type EnhanceResponsibilityOutput = z.infer<typeof EnhanceResponsibilityOutputSchema>;

export async function enhanceResponsibility(input: EnhanceResponsibilityInput): Promise<EnhanceResponsibilityOutput> {
  return enhanceResponsibilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceResponsibilityPrompt',
  input: {schema: EnhanceResponsibilityInputSchema},
  output: {schema: EnhanceResponsibilityOutputSchema},
  prompt: `You are an expert resume writer. Your task is to enhance the given resume responsibility/bullet point.
Make it more action-oriented, impactful, and quantifiable if possible.
If a job role is provided, tailor the language to that role.
If job analysis context is provided, try to incorporate relevant keywords or align the tone with the job description.
Provide 2-3 varied and improved suggestions.

Original Responsibility: {{{originalResponsibility}}}

{{#if role}}
Job Role Context: {{{role}}}
{{/if}}

{{#if jobAnalysisContext}}
Job Description Analysis Context: {{{jobAnalysisContext}}}
{{/if}}

Rewrite the original responsibility into 2-3 improved versions.
`,
});

const enhanceResponsibilityFlow = ai.defineFlow(
  {
    name: 'enhanceResponsibilityFlow',
    inputSchema: EnhanceResponsibilityInputSchema,
    outputSchema: EnhanceResponsibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure we always return an array, even if the AI fails to provide multiple suggestions or the expected format.
    if (!output?.suggestedResponsibilities || output.suggestedResponsibilities.length === 0) {
        // Fallback or error handling if AI doesn't return proper suggestions
        // For now, let's return the original responsibility in an array if AI fails
        // A more robust solution might involve logging this or returning a specific error message.
        // const enhancedFallback = `[AI Suggestion] Action-oriented: ${input.originalResponsibility}`;
        // return { suggestedResponsibilities: [enhancedFallback] };
        
        // Let's try to generate a generic enhanced version if the model output is not as expected.
        const fallbackPrompt = ai.definePrompt({
            name: 'enhanceResponsibilityFallbackPrompt',
            input: { schema: z.object({ originalResponsibility: z.string() }) },
            output: { schema: z.object({ suggestion: z.string() }) },
            prompt: `Rewrite the following resume responsibility to be more action-oriented and impactful: {{{originalResponsibility}}}`
        });
        const fallbackResult = await fallbackPrompt({originalResponsibility: input.originalResponsibility});
        if(fallbackResult.output?.suggestion){
            return { suggestedResponsibilities: [fallbackResult.output.suggestion] };
        }
        // If all else fails, return the original
        return { suggestedResponsibilities: [input.originalResponsibility] };
    }
    return output;
  }
);
