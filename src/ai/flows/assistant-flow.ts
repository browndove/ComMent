
'use server';
/**
 * @fileOverview A simple conversational AI flow for the Accra TechMind assistant.
 *
 * - chat - A function that takes a user's message history and returns a response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generate, type Message } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const AssistantInputSchema = z.object({
  message: z.string(),
  history: z.array(MessageSchema).optional(),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

export async function chat(input: AssistantInput): Promise<string> {
    const response = await assistantFlow(input);
    return response;
}

const systemPrompt = `You are Ama, a friendly and empathetic AI assistant for Accra TechMind, a mental health and counseling service for university students.
Your role is to provide immediate, supportive, and helpful conversations.
You can answer questions about mental health topics (like stress, anxiety, depression), offer self-help tips, and guide students to resources available through the app.

Keep your responses:
- Kind, understanding, and non-judgmental.
- Clear, concise, and easy to understand.
- Actionable and encouraging.

**IMPORTANT**: You are an AI assistant, not a human counselor. You MUST NOT provide diagnoses, medical advice, or act as a substitute for professional therapy.
If a student seems to be in serious distress or expresses thoughts of self-harm, you MUST strongly and immediately recommend they speak to a human counselor through the app or contact emergency services.
`;


const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { history, message } = input;
    const { output } = await generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: message,
      history: history as Message[],
      config: {
        systemPrompt,
      },
    });

    return output!;
  }
);
