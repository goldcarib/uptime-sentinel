
'use server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { ElevenLabsRequest, ElevenLabsResponse } from '@/lib/types';

export async function textToSpeech(input: ElevenLabsRequest): Promise<ElevenLabsResponse> {
    const supabaseAdmin = createSupabaseAdminClient();

    // 1. Get team settings for the specific teamId
    const { data: team, error: teamError } = await supabaseAdmin
        .from('teams')
        .select('elevenlabs_api_key, elevenlabs_voice_id')
        .eq('id', input.teamId)
        .single();
    
    if (teamError || !team) {
        throw new Error(`Could not find team settings for ID: ${input.teamId}`);
    }

    const apiKey = team.elevenlabs_api_key || process.env.ELEVENLABS_API_KEY;
    const voiceId = team.elevenlabs_voice_id || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default voice if not set

    if (!apiKey) {
        throw new Error("ElevenLabs API key is not configured for this team or in environment variables.");
    }
    
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const headers = {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
    };

    const body = JSON.stringify({
        text: input.text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
        },
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`ElevenLabs API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        
        return {
            media: `data:audio/mpeg;base64,${base64Audio}`,
        };

    } catch (error: any) {
        console.error("Failed to call ElevenLabs API:", error);
        throw new Error(error.message);
    }
}
