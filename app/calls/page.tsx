"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCalls,
  updateCallOutcome,
  type CallOutcome,
  CALL_OUTCOME_LABELS,
} from "@/lib";
import { Phone, Calendar, CheckCircle } from "lucide-react";

const OUTCOME_COLOURS: Record<string, string> = {
  closed_swiftciv: "bg-green-500/10 text-green-600",
  closed_bespoke: "bg-green-600/10 text-green-700",
  closed_retainer: "bg-green-700/10 text-green-800",
  follow_up_required: "bg-yellow-500/10 text-yellow-600",
  not_interested: "bg-muted text-muted-foreground",
  no_show: "bg-destructive/10 text-destructive",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDocType(docType: string | null): string {
  if (!docType) return "—";
  return docType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CallsPage() {
  const queryClient = useQueryClient();
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);
  const [outcomeInput, setOutcomeInput] = useState<CallOutcome | "">("");
  const [notesInput, setNotesInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["calls"],
    queryFn: getCalls,
    refetchInterval: 60000,
  });

  const outcomeMutation = useMutation({
    mutationFn: ({
      callId,
      outcome,
      notes,
    }: {
      callId: number;
      outcome: CallOutcome;
      notes?: string;
    }) => updateCallOutcome(callId, outcome, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      setSelectedCallId(null);
      setOutcomeInput("");
      setNotesInput("");
    },
    onError: () => {
      alert("Failed to update outcome. Please try again.");
    },
  });

  const calls = data?.calls || [];
  const upcoming = calls.filter(
    (c) => !c.outcome && new Date(c.scheduled_at) > new Date(),
  );
  const completed = calls.filter(
    (c) => c.outcome || new Date(c.scheduled_at) <= new Date(),
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calls</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Booked calls from Calendly and their outcomes
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-5 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : calls.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Phone className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <div className="text-sm text-muted-foreground">
            No calls booked yet. Keep sending outreach.
          </div>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h2 className="font-medium text-sm">
                  Upcoming ({upcoming.length})
                </h2>
              </div>

              {upcoming.map((call) => (
                <div
                  key={call.id}
                  className="rounded-xl border bg-card p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{call.company_name}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {call.contact_name} · {call.contact_email}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {call.city}, {call.state} ·{" "}
                        {formatDocType(call.document_type)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-primary">
                        {formatDate(call.scheduled_at)}
                      </div>
                    </div>
                  </div>

                  {call.company_summary && (
                    <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
                      {call.company_summary}
                    </div>
                  )}

                  {/* Outcome Form */}
                  {selectedCallId === call.id ? (
                    <div className="space-y-3 pt-2 border-t">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Record outcome
                      </div>
                      <select
                        value={outcomeInput}
                        onChange={(e) =>
                          setOutcomeInput(e.target.value as CallOutcome)
                        }
                        className="w-full text-sm bg-background border rounded-lg px-3 py-2 outline-none"
                      >
                        <option value="">Select outcome...</option>
                        {Object.entries(CALL_OUTCOME_LABELS).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                      <textarea
                        placeholder="Notes (optional)..."
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        rows={3}
                        className="w-full text-sm bg-background border rounded-lg px-3 py-2 outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!outcomeInput) return;
                            outcomeMutation.mutate({
                              callId: call.id,
                              outcome: outcomeInput as CallOutcome,
                              notes: notesInput || undefined,
                            });
                          }}
                          disabled={!outcomeInput || outcomeMutation.isPending}
                          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                          {outcomeMutation.isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCallId(null);
                            setOutcomeInput("");
                            setNotesInput("");
                          }}
                          className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedCallId(call.id)}
                      className="text-xs text-primary hover:opacity-80 transition-opacity"
                    >
                      Record outcome
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-medium text-sm">
                  Completed ({completed.length})
                </h2>
              </div>

              {completed.map((call) => (
                <div key={call.id} className="rounded-xl border bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{call.company_name}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {call.contact_name} · {call.city}, {call.state}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(call.scheduled_at)}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {call.outcome ? (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            OUTCOME_COLOURS[call.outcome] ||
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {CALL_OUTCOME_LABELS[call.outcome as CallOutcome] ||
                            call.outcome}
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedCallId(call.id)}
                          className="text-xs text-primary hover:opacity-80 transition-opacity"
                        >
                          Record outcome
                        </button>
                      )}
                    </div>
                  </div>

                  {call.call_notes && (
                    <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 mt-3">
                      {call.call_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
