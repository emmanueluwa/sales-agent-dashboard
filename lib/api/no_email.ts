/**
 * No email API — leads with no email address found.
 * Allows manual email entry and LinkedIn URL updates.
 */

import { apiClient } from "./client";

export interface NoEmailLead {
  id: number;
  place_id: string;
  company_name: string;
  linkedin_url: string | null;
  status: string;
  updated_at: string;
  city: string | null;
  state: string | null;
  website: string | null;
  document_type: string | null;
  decision_maker_name: string | null;
  decision_maker_title: string | null;
}

export interface NoEmailResponse {
  leads: NoEmailLead[];
}

export async function getNoEmailLeads(): Promise<NoEmailResponse> {
  const { data } = await apiClient.get<NoEmailResponse>("/api/no-email");
  return data;
}

export async function updateEmail(
  outreachId: number,
  email: string,
  name?: string,
  linkedinUrl?: string,
): Promise<{ outreach_id: number; email: string; status: string }> {
  const { data } = await apiClient.patch(`/api/no-email/${outreachId}`, {
    email,
    name,
    linkedin_url: linkedinUrl,
  });
  return data;
}

export async function updateLinkedinUrl(
  outreachId: number,
  linkedinUrl: string,
): Promise<{ outreach_id: number; linkedin_url: string }> {
  const { data } = await apiClient.patch(
    `/api/no-email/${outreachId}/linkedin`,
    { linkedin_url: linkedinUrl },
  );
  return data;
}
