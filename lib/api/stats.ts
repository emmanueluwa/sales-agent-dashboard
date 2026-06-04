/*
stats api - overall pipeline performance metrics
*/

import { apiClient } from "./client";

export interface Stats {
  total_leads: number;
  total_queued: number;
  total_sent: number;
  sent_today: number;
  total_replied: number;
  reply_rate: number;
  total_interested: number;
  total_booked: number;
  videos_needed: number;
}

export async function getStats(): Promise<Stats> {
  const { data } = await apiClient.get<Stats>("/api/stats");
  return data;
}
