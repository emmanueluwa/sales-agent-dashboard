/**
 * Leads API — civil engineering companies discovered by the scraper.
 */

import { apiClient } from "./client";

export interface Lead {
  place_id: string;
  company_name: string;
  city: string;
  state: string;
  document_type: string;
  decision_maker_name: string | null;
  decision_maker_title: string | null;
  decision_maker_email: string | null;
  website: string | null;
  company_summary: string | null;
  researched_at: string;
  outreach_status: string | null;
  sent_at: string | null;
  replied_at: string | null;
  booked_at: string | null;
}

export interface LeadGroup {
  state: string;
  document_type: string;
  total_leads: number;
  video_needed: number;
  queued: number;
  sent: number;
  in_followup: number;
  interested: number;
  booked: number;
  cold: number;
  youtube_url: string | null;
}

export interface LeadsResponse {
  total: number;
  limit: number;
  offset: number;
  leads: Lead[];
}

export interface LeadGroupsResponse {
  groups: LeadGroup[];
}

export interface LeadDetail {
  research: Lead;
  outreach: Record<string, unknown> | null;
  email_history: Record<string, unknown>[];
}

export async function getLeadGroups(): Promise<LeadGroupsResponse> {
  const { data } = await apiClient.get<LeadGroupsResponse>("/api/leads/groups");
  return data;
}

export async function getLeads(params?: {
  state?: string;
  document_type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<LeadsResponse> {
  const { data } = await apiClient.get<LeadsResponse>("/api/leads", {
    params,
  });
  return data;
}

export async function getLead(placeId: string): Promise<LeadDetail> {
  const { data } = await apiClient.get<LeadDetail>(`/api/leads/${placeId}`);
  return data;
}

export async function getStates(): Promise<{
  states: { state: string; lead_count: number }[];
}> {
  const { data } = await apiClient.get("/api/leads/states");
  return data;
}

export async function getDocumentTypes(): Promise<{
  document_types: { document_type: string; lead_count: number }[];
}> {
  const { data } = await apiClient.get("/api/leads/document-types");
  return data;
}
