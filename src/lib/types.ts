

import { z } from "zod";

export type AppRole = 'ADMIN' | 'MEMBER';

export type Team = {
  id: number;
  name: string;
  created_at: string;
  api_key?: string;
  confluent_enabled?: boolean;
  confluent_rest_endpoint?: string | null;
  confluent_api_key?: string | null;
  confluent_api_secret?: string | null;
  elevenlabs_api_key?: string | null;
  elevenlabs_voice_id?: string | null;
};

export type TeamUser = {
  user_id: string;
  role: AppRole;
  email?: string;
};

export type MonitoredSite = {
  id: number;
  name: string;
  url: string;
  status: 'up' | 'down' | 'pending';
  uptime: string;
  avgResponseTime: number;
  lastChecked: string | null;
  user_id?: string;
  team_id: number;
  check_interval: number; // in minutes
  notification_emails?: string[] | null;
  ignore_ssl?: boolean;
};

export type Incident = {
  id: number;
  website_id: number;
  siteName: string;
  siteUrl: string;
  status: "resolved" | "ongoing";
  startedAt: string;
  resolvedAt: string | null;
  duration: string | null;
  reason?: string | null;
  team_id?: number;
};

export type Note = {
    id: number;
    user_id: string;
    team_id: number;
    title: string;
    content?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    reminder_period?: string | null;
    created_at: string;
    author_email?: string;
}

export type NotificationSettings = {
  id?: number;
  user_id?: string;
  email_notifications: boolean;
  sendgrid_api_key: string | null;
  from_email: string | null;
  to_email: string | null;
  timezone?: string | null;
};

export type Check = {
  id?: number;
  website_id: number;
  status: 'up' | 'down';
  response_time: number;
  created_at: string;
  reason?: string | null;
  location?: string | null;
  host?: string | null;
}

export type UptimeStat = {
  period: string;
  uptime: string;
  incidents: number;
  downtime: string;
}

export type ResponseTimeStat = {
  average: string;
  min: string;
  max: string;
  data: {
    date: string;
    responseTime: number;
  }[];
}

export type MonitorDetails = {
  uptimeStats: UptimeStat[];
  responseTimeStats: ResponseTimeStat;
  latestIncidents: Incident[];
}

// User profile now includes all teams and roles
export type UserProfile = {
  id: string;
  email: string;
  teams: (Team & { role: AppRole })[];
  timezone?: string | null;
}

export type StatusPage = {
    id: number;
    website_id: number;
    slug: string;
    is_public: boolean;
    password?: string | null;
    allowed_ips?: string[] | null;
    created_at: string;
}

export type WebsiteWithStatusPage = MonitoredSite & {
    status_page: StatusPage | null;
};

export const TtsRequestSchema = z.object({
  text: z.string(),
});
export type TtsRequest = z.infer<typeof TtsRequestSchema>;

export const TtsResponseSchema = z.object({
  media: z.string(),
});
export type TtsResponse = z.infer<typeof TtsResponseSchema>;

export const ElevenLabsRequestSchema = z.object({
  text: z.string(),
  teamId: z.number(),
});
export type ElevenLabsRequest = z.infer<typeof ElevenLabsRequestSchema>;

export const ElevenLabsResponseSchema = z.object({
  media: z.string(),
});
export type ElevenLabsResponse = z.infer<typeof ElevenLabsResponseSchema>;

export const SttRequestSchema = z.object({
  audio: z.string(), // data URI
});
export type SttRequest = z.infer<typeof SttRequestSchema>;

export const SttResponseSchema = z.object({
  text: z.string(),
});
export type SttResponse = z.infer<typeof SttResponseSchema>;
