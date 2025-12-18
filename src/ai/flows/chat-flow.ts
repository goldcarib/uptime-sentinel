
'use server';
import {ai} from '@/ai/genkit';
import {createSupabaseAdminClient} from '@/lib/supabase-admin';
import {MessageData, z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ChitRequestSchema = z.object({
  history: z.array(MessageData),
  prompt: z.string(),
});

export async function chitChat(input: z.infer<typeof ChitRequestSchema>) {
  const supabaseAdmin = createSupabaseAdminClient();

  const getWebsiteByName = ai.defineTool(
    {
      name: 'getWebsiteByName',
      description: 'Get the details of a monitored website by its name.',
      inputSchema: z.object({
        name: z.string().describe('The name of the website to look for'),
      }),
      outputSchema: z.any(),
    },
    async ({name}) => {
      const {data, error} = await supabaseAdmin
        .from('websites')
        .select('*')
        .ilike('name', `%${name}%`)
        .single();
      if (error) {
        return {error: `Website with name "${name}" not found.`};
      }
      return data;
    }
  );

  const getWebsiteByUrl = ai.defineTool(
    {
      name: 'getWebsiteByUrl',
      description: 'Get the details of a monitored website by its URL.',
      inputSchema: z.object({
        url: z.string().url().describe('The URL of the website to look for'),
      }),
      outputSchema: z.any(),
    },
    async ({url}) => {
      const {data, error} = await supabaseAdmin
        .from('websites')
        .select('*')
        .eq('url', url)
        .single();
      if (error) {
        return {error: `Website with URL "${url}" not found.`};
      }
      return data;
    }
  );

  const getWebsiteUptime = ai.defineTool(
    {
      name: 'getWebsiteUptime',
      description:
        'Get the uptime statistics for a specific website over various periods.',
      inputSchema: z.object({
        websiteId: z
          .number()
          .describe('The ID of the website to get uptime for'),
      }),
      outputSchema: z.any(),
    },
    async ({websiteId}) => {
      const {data, error} = await supabaseAdmin.rpc(
        'get_uptime_stats_for_website',
        {
          p_website_id: websiteId,
        }
      );
      if (error) {
        return {error: 'Could not retrieve uptime stats.'};
      }
      return data;
    }
  );

  const getWebsiteIncidents = ai.defineTool(
    {
      name: 'getWebsiteIncidents',
      description: 'Get the incident history for one or all websites. Can be used to find most common downtime reasons or compare sites.',
      inputSchema: z.object({
        websiteId: z
          .number()
          .optional()
          .describe('The ID of a specific website to get incidents for. If omitted, incidents for all websites will be returned.'),
      }),
      outputSchema: z.any(),
    },
    async ({websiteId}) => {
      let query = supabaseAdmin
        .from('incidents_with_details')
        .select('*')
        .order('started_at', {ascending: false})
        .limit(50); // Limit to a reasonable number for analysis

      if (websiteId) {
        query = query.eq('website_id', websiteId);
      }
      
      const {data, error} = await query;

      if (error) {
        return {error: 'Could not retrieve incidents.'};
      }
      return data;
    }
  );

  const getWebsiteStatusPage = ai.defineTool(
    {
      name: 'getWebsiteStatusPage',
      description: 'Get the status page URL for a specific website.',
      inputSchema: z.object({
        websiteId: z
          .number()
          .describe('The ID of the website to get the status page for'),
      }),
      outputSchema: z.any(),
    },
    async ({websiteId}) => {
      const {data, error} = await supabaseAdmin
        .from('status_pages')
        .select('slug')
        .eq('website_id', websiteId)
        .single();
      if (error || !data) {
        return {error: 'No status page found for this website.'};
      }
      return {statusPageUrl: `/status/${data.slug}`};
    }
  );

  const getNotes = ai.defineTool(
    {
        name: 'getNotes',
        description: 'Search for notes, logs, and maintenance windows. If a user asks for recent or upcoming events without a specific keyword, you can use this tool without a query to get the most recent notes.',
        inputSchema: z.object({
            query: z.string().optional().describe('Keywords to search for. If omitted, the most recent notes will be returned.'),
        }),
        outputSchema: z.any(),
    },
    async ({ query }) => {
        let queryBuilder = supabaseAdmin
            .from('notes')
            .select('title, content, start_time, end_time, created_at');

        if (query) {
            // Use full-text search for better relevance
            queryBuilder = queryBuilder.textSearch('fts', query, {
                type: 'websearch',
                config: 'english'
            });
        }
        
        queryBuilder = queryBuilder.order('created_at', { ascending: false }).limit(10);
        
        const { data, error } = await queryBuilder;

        if (error) {
            return { error: `Could not retrieve notes: ${error.message}` };
        }
        if (!data || data.length === 0) {
            return { info: `No notes found${query ? ` matching the query "${query}"` : ''}. If you were looking for something specific, try different keywords.` };
        }
        
        const serializableData = data.map(note => ({
            title: note.title,
            content: note.content,
            start_time: note.start_time ? new Date(note.start_time).toISOString() : null,
            end_time: note.end_time ? new Date(note.end_time).toISOString() : null,
            created_at: new Date(note.created_at).toISOString(),
        }));

        return serializableData;
    }
);

  const {history, prompt} = input;
  
  const model = googleAI.model(process.env.GEMINI_MODEL || 'gemini-1.5-flash');

  const llmResponse = await ai.generate({
    model,
    history: history,
    prompt: prompt,
    tools: [
      getWebsiteByName,
      getWebsiteByUrl,
      getWebsiteUptime,
      getWebsiteIncidents,
      getWebsiteStatusPage,
      getNotes,
    ],
    toolChoice: 'auto',
    config: {
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
      ],
    },
  });

  const responseMessage = llmResponse.message;
  
  // Force the response to be a plain, serializable object.
  return JSON.parse(JSON.stringify(responseMessage));
}
