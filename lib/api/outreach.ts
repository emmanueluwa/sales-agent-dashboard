/*
outreach api - email sending status, replies, and follow up tracking
*/

import { apiClient } from "./client";

export interface OutreachRecord {
  id: number;
  place_id: string;
  company_name: string;
  recipient_email: string | null;
  recipient_name: string | null;
  status: string;
  email_subject: string | null;
  youtube_url: string | null;
  sent_at: string | null;
  follow_up_1_at: string | null;
  follow_up_2_at: string | null;
  follow_up_3_at: string | null;
  replied_at: string | null;
  booked_at: string | null;
  cold_at: string | null;
  created_at: string;
  state: string | null;
  document_type: string | null;
  city: string | null;
}

export interface OutreachSummary {
  status_counts: Record<string, number>;
  sent_today: number;
  total_emails_sent: number;
}

export interface Reply {
  id: number;
  company_name: string;
  recipient_email: string;
  recipient_name: string | null;
  status: string;
  replied_at: string;
  reply_content: string | null;
  state: string | null;
  document_type: string | null;
  city: string | null;
}

export interface OutreachDetail {
  outreach: OutreachRecord;
  email_history: {
    id: number;
    email_type: string;
    recipient: string;
    subject: string;
    gmail_message_id: string | null;
    sent_at: string;
  }[];
}

export interface OutreachResponse {
  total: number;
  limit: number;
  offset: number;
  outreach: OutreachRecord[];
}

export interface RepliesResponse {
  total: number;
  replies: Reply[];
}

export async function getOutreach(params?: {
  status?: string;
  state?: string;
  limit?: number;
  offset?: number;
}): Promise<OutreachResponse> {
  const { data } = await apiClient.get<OutreachResponse>("/api/outreach/", {
    params,
  });
  return data;
}

export async function getOutreachSummary(): Promise<OutreachSummary> {
  const { data } = await apiClient.get<OutreachSummary>(
    "/api/outreach/summary",
  );
  return data;
}

export async function getReplies(params?: {
  limit?: number;
  offset?: number;
}): Promise<RepliesResponse> {
  const { data } = await apiClient.get<RepliesResponse>(
    "/api/outreach/replies",
    { params },
  );
  return data;
}

export async function getOutreachDetail(
  outreachId: number,
): Promise<OutreachDetail> {
  const { data } = await apiClient.get<OutreachDetail>(
    `/api/outreach/${outreachId}`,
  );
  return data;
}

export async function unsubscribe(
  outreachId: number,
): Promise<{ message: string }> {
  const { data } = await apiClient.patch<{ message: string }>(
    `/api/outreach/${outreachId}/unsubscribe`,
  );
  return data;
}
