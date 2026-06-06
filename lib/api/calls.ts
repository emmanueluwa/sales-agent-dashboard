/*
calls api - calendly booked calls and outcome tracking
*/

import { apiClient } from "./client";

export interface BookedCall {
  id: number;
  company_name: string;
  contact_name: string;
  contact_email: string;
  scheduled_at: string;
  outcome: string | null;
  call_notes: string | null;
  created_at: string;
  state: string | null;
  document_type: string | null;
  city: string | null;
  website: string | null;
  company_summary: string | null;
  decision_maker_title: string | null;
}

export interface CallDetail {
  call: BookedCall & {
    decision_maker_name: string | null;
    decision_maker_email: string | null;
  };
  outreach_history: {
    status: string;
    sent_at: string | null;
    replied_at: string | null;
    reply_content: string | null;
    email_subject: string | null;
  }[];
  email_history: {
    email_type: string;
    subject: string;
    sent_at: string;
    recipient: string;
  }[];
}

export type CallOutcome =
  | "closed_swiftciv"
  | "closed_bespoke"
  | "closed_retainer"
  | "follow_up_required"
  | "not_interested"
  | "no_show";

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  closed_swiftciv: "Closed — SwiftCiv",
  closed_bespoke: "Closed — Bespoke Project",
  closed_retainer: "Closed — Retainer",
  follow_up_required: "Follow Up Required",
  not_interested: "Not Interested",
  no_show: "No Show",
};

export interface CallsResponse {
  calls: BookedCall[];
}

export interface UpcomingCallsResponse {
  upcoming_calls: BookedCall[];
}

export async function getCalls(): Promise<CallsResponse> {
  const { data } = await apiClient.get<CallsResponse>("/api/calls");
  return data;
}

export async function getUpcomingCalls(): Promise<UpcomingCallsResponse> {
  const { data } = await apiClient.get<UpcomingCallsResponse>(
    "/api/calls/upcoming",
  );
  return data;
}

export async function getCall(callId: number): Promise<CallDetail> {
  const { data } = await apiClient.get<CallDetail>(`/api/calls/${callId}`);
  return data;
}

export async function updateCallOutcome(
  callId: number,
  outcome: CallOutcome,
  notes?: string,
): Promise<{ call_id: number; outcome: string; notes: string | null }> {
  const { data } = await apiClient.patch(`/api/calls/${callId}/outcome`, {
    outcome,
    notes,
  });
  return data;
}
