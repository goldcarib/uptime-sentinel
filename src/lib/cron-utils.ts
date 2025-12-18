

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { setWebsiteStatus, createIncident, resolveIncident, recordCheck } from "@/lib/db";
import { sendStatusNotification } from "@/lib/notifications";
import type { MonitoredSite } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import https from 'https';
import { URL } from 'url';


export type CheckResult = {
  status: 'up' | 'down';
  reason: string;
  responseTime: number;
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function performCheck(site: Partial<MonitoredSite>): Promise<CheckResult> {
    const startTime = Date.now();
    const timeout = 20000; // 20 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const location = process.env.VERCEL_REGION || 'dev';

    try {
        const response = await fetch(site.url!, {
            method: 'HEAD',
            headers: { 'User-Agent': 'UptimeSentinel/1.0' },
            // @ts-ignore
            signal: controller.signal,
            // This part is tricky as `rejectUnauthorized` is not standard in fetch.
            // For environments like Node where `https` is available, this could be customized.
            // In Vercel Edge functions, this is not supported. We'll rely on catching the error.
        });
        
        clearTimeout(timeoutId);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (response.ok) {
            return { status: 'up', reason: `OK (${response.status})`, responseTime };
        } else {
            return { status: 'down', reason: `HTTP Error (${response.status} ${response.statusText})`, responseTime };
        }

    } catch (err: any) {
        clearTimeout(timeoutId);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        let reason = `Network Error: ${err.message || 'Unknown fetch error'}`;
        if (err.name === 'AbortError') {
            reason = 'Request Timed Out';
        } else if (err.cause?.code) {
             // Node.js specific errors
            if (err.cause.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || err.cause.code === 'CERT_HAS_EXPIRED') {
                if (site.ignore_ssl) {
                    // If we are ignoring SSL, we need a way to perform a request that allows invalid certs.
                    // This is complex with standard `fetch`. For this scenario, we'll log it but may need a different http client.
                    // For now, if we intended to ignore it, we can't really fail it. This is a limitation.
                    // Let's proceed with a HEAD request using the `https` module for node env.
                    return performNodeCheck(site);
                }
                reason = `SSL Certificate Error: ${err.cause.code}`;
            } else {
                reason = `Network Error: ${err.cause.code}`;
            }
        }
        
        return { status: 'down', reason, responseTime: responseTime > timeout ? timeout : responseTime };
    }
}


// A Node.js specific fallback using the `https` module to handle `rejectUnauthorized`.
async function performNodeCheck(site: Partial<MonitoredSite>): Promise<CheckResult> {
    const startTime = Date.now();
    const timeout = 20000;

    return new Promise((resolve) => {
        const siteUrl = new URL(site.url!);
        const options: https.RequestOptions = {
            method: 'HEAD',
            hostname: siteUrl.hostname,
            path: siteUrl.pathname,
            port: siteUrl.port || (siteUrl.protocol === 'https:' ? 443 : 80),
            headers: { 'User-Agent': 'UptimeSentinel/1.0' },
            timeout: timeout,
            rejectUnauthorized: site.ignore_ssl === false // Explicitly set based on site config
        };
        
        const req = https.request(options, (res) => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
                resolve({ status: 'up', reason: `OK (${res.statusCode})`, responseTime });
            } else {
                resolve({ status: 'down', reason: `HTTP Error (${res.statusCode} ${res.statusMessage})`, responseTime });
            }
            res.resume();
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ status: 'down', reason: 'Request Timed Out', responseTime: timeout });
        });

        req.on('error', (err: any) => {
            req.destroy();
            resolve({ status: 'down', reason: `Network Error (${err.message})`, responseTime: timeout });
        });

        req.end();
    });
}


async function checkWebsiteStatus(site: Partial<MonitoredSite>): Promise<CheckResult> {
    
    // First check
    const firstResult = await performCheck(site);
    if (firstResult.status === 'up') {
        return firstResult; // Site is up, no need to re-verify.
    }

    // If first check is 'down', wait 30 seconds and re-verify.
    await delay(30000); 

    // Second check is the deciding one.
    const secondResult = await performCheck(site);
    
    // The result of the second check is the final verdict.
    // If it's up, the first failure was a blip. If it's still down, it's a real incident.
    return secondResult;
}

export async function processSite(supabaseAdmin: SupabaseClient, site: MonitoredSite) {
    // Ensure site has an id before processing
    if (!site || !site.id) {
        console.error("processSite called with an invalid site object.", site);
        return { error: "Missing site ID." };
    }
    
    const location = process.env.VERCEL_REGION || 'dev';
    const host = process.env.VERCEL_URL || 'localhost';

    const { status: newStatus, reason, responseTime } = await checkWebsiteStatus(site);
    await recordCheck(supabaseAdmin, site.id, newStatus, responseTime, reason, location, host);

    const lastChecked = new Date().toISOString();
    const oldStatus = site.status;

    // Only trigger notifications and incidents if the status has changed.
    if (newStatus !== oldStatus) {
        if (newStatus === 'down') {
          // The site just went down.
          const incident = await createIncident(supabaseAdmin, site.id, reason);
          if (incident && site.user_id) {
              await sendStatusNotification({ site: site as MonitoredSite, incident, type: 'down' });
          }
        } 
        else if (newStatus === 'up' && oldStatus === 'down') {
          // The site just came back up from a 'down' state.
          const incident = await resolveIncident(supabaseAdmin, site.id);
          if (incident && site.user_id) {
               await sendStatusNotification({ site: site as MonitoredSite, incident, type: 'up' });
          }
        }
    }
    
    // Always update the website status and last checked time, regardless of status change.
    await setWebsiteStatus(supabaseAdmin, site.id, newStatus, lastChecked);
    
    return { url: site.url, oldStatus: oldStatus, newStatus, reason, responseTime };
}
