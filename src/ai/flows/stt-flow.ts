'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import type { SttRequest, SttResponse } from '@/lib/types';


export async function speechToText(input: SttRequest): Promise<SttResponse> {
    const { text } = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: [
        { text: "Transcribe the following audio recording." },
        { media: { url: input.audio } },
      ],
    });

    if (!text) {
      throw new Error('No text returned from STT model');
    }
    
    return { text };
}
