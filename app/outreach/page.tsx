"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOutreach,
  getOutreachSummary,
  getReplies,
  unsubscribe,
  type RepliesResponse,
} from "@/lib";
import { Mail, MessageSquare, TrendingUp } from "lucide-react";

const STATUS_COLOURS: Record<string, string> = {
  video_needed: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
  queued: "bg-blue-500/10 text-blue-600",
  sent: "bg-yellow-500/10 text-yellow-600",
  follow_up_1: "bg-orange-500/10 text-orange-600",
  follow_up_2: "bg-orange-500/10 text-orange-600",
  follow_up_3: "bg-orange-500/10 text-orange-600",
  replied: "bg-purple-500/10 text-purple-600",
  interested: "bg-green-500/10 text-green-600",
  booking_link_sent: "bg-green-500/10 text-green-600",
  booked: "bg-green-600/10 text-green-700",
  cold: "bg-muted text-muted-foreground",
  unsubscribed: "bg-muted text-muted-foreground",
};

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Tab = "all" | "replies";

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
        STATUS_COLOURS[status] || "bg-muted text-muted-foreground"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

export default function OutreachPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: summary } = useQuery({
    queryKey: ["outreach-summary"],
    queryFn: getOutreachSummary,
    refetchInterval: 60000,
  });

  const { data: outreachData, isLoading: outreachLoading } = useQuery({
    queryKey: ["outreach", statusFilter],
    queryFn: () =>
      getOutreach({
        status: statusFilter || undefined,
        limit: 100,
      }),
    enabled: tab === "all",
  });

  const { data: repliesData, isLoading: repliesLoading } =
    useQuery<RepliesResponse>({
      queryKey: ["replies"],
      queryFn: () => getReplies(),
      enabled: tab === "replies",
      refetchInterval: 60000,
    });

  const unsubscribeMutation = useMutation({
    mutationFn: (outreachId: number) => unsubscribe(outreachId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach"] });
    },
  });

  const statusCounts = summary?.status_counts || {};
  const totalSent = summary?.total_emails_sent || 0;
  const sentToday = summary?.sent_today || 0;

  function handleUnsubscribe(id: number) {
    if (confirm("Mark as unsubscribed? This stops all future outreach.")) {
      unsubscribeMutation.mutate(id);
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Outreach
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Email pipeline status and reply tracking
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Sent Today</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold">{sentToday}</div>
        </div>
        <div className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Total Sent</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold">{totalSent}</div>
        </div>
        <div className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Replies</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold">
            {(statusCounts["replied"] || 0) +
              (statusCounts["interested"] || 0) +
              (statusCounts["booked"] || 0)}
          </div>
        </div>
        <div className="rounded-xl p-4 sm:p-5 border border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-sm text-muted-foreground">Interested</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-green-600">
            {statusCounts["interested"] || 0}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["all", "replies"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "all" ? "All Outreach" : "Replies"}
          </button>
        ))}
      </div>

      {/* All Outreach Tab */}
      {tab === "all" && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-medium text-sm">All Outreach</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm bg-background border rounded-lg px-3 py-1.5 outline-none w-full sm:w-auto"
            >
              <option value="">All statuses</option>
              {Object.keys(statusCounts).map((s) => (
                <option key={s} value={s}>
                  {formatStatus(s)} ({statusCounts[s]})
                </option>
              ))}
            </select>
          </div>

          {outreachLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : (
            <>
              {/* Mobile: card list */}
              <ul className="divide-y md:hidden">
                {outreachData?.outreach?.map((record) => (
                  <li key={record.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {record.company_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {record.recipient_email || "—"}
                        </div>
                      </div>
                      <StatusBadge status={record.status} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Sent</dt>
                        <dd className="mt-0.5">{formatDate(record.sent_at)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Replied</dt>
                        <dd className="mt-0.5">
                          {formatDate(record.replied_at)}
                        </dd>
                      </div>
                    </dl>
                    {record.status !== "unsubscribed" && (
                      <button
                        onClick={() => handleUnsubscribe(record.id)}
                        className="mt-3 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Unsubscribe
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {/* Tablet / desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                        Company
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Recipient
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Sent
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Replied
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {outreachData?.outreach?.map((record) => (
                      <tr
                        key={record.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-3 font-medium">
                          {record.company_name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {record.recipient_email || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={record.status} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {formatDate(record.sent_at)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {formatDate(record.replied_at)}
                        </td>
                        <td className="px-4 py-3">
                          {record.status !== "unsubscribed" && (
                            <button
                              onClick={() => handleUnsubscribe(record.id)}
                              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                            >
                              Unsub
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Replies Tab */}
      {tab === "replies" && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b">
            <h2 className="font-medium text-sm">
              Replies ({repliesData?.total || 0})
            </h2>
          </div>

          {repliesLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : repliesData?.replies?.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No replies yet
            </div>
          ) : (
            <div className="divide-y">
              {repliesData?.replies?.map((reply) => (
                <div key={reply.id} className="px-4 sm:px-6 py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {reply.company_name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {reply.recipient_email} · {reply.city}, {reply.state}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={reply.status} />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(reply.replied_at)}
                      </span>
                    </div>
                  </div>
                  {reply.reply_content && (
                    <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 line-clamp-3">
                      {reply.reply_content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
