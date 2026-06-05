"use client";

import { useQuery } from "@tanstack/react-query";
import { getStats, getUpcomingCalls, getVideosNeeded } from "@/lib";
import {
  Mail,
  Phone,
  Video,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function StatCard({ label, value, sub, icon, highlight }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-3 ${
        highlight ? "border-primary/40 bg-primary/5" : "bg-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 60000,
  });

  const { data: upcomingCalls, isLoading: callsLoading } = useQuery({
    queryKey: ["upcoming-calls"],
    queryFn: getUpcomingCalls,
    refetchInterval: 60000,
  });

  const { data: videosNeeded, isLoading: videosLoading } = useQuery({
    queryKey: ["videos-needed"],
    queryFn: getVideosNeeded,
    refetchInterval: 60000,
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sales agent pipeline status
        </p>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-5 h-28 animate-pulse"
            />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Sent Today"
            value={stats.sent_today}
            sub="emails dispatched"
            icon={<Mail className="w-4 h-4" />}
          />
          <StatCard
            label="Total Sent"
            value={stats.total_sent}
            sub="all time"
            icon={<Mail className="w-4 h-4" />}
          />
          <StatCard
            label="Reply Rate"
            value={`${stats.reply_rate}%`}
            sub={`${stats.total_replied} replies`}
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <StatCard
            label="Interested"
            value={stats.total_interested}
            sub="awaiting Calendly"
            icon={<Users className="w-4 h-4" />}
            highlight
          />
          <StatCard
            label="Calls Booked"
            value={stats.total_booked}
            sub="confirmed"
            icon={<Phone className="w-4 h-4" />}
            highlight
          />
          <StatCard
            label="Queued"
            value={stats.total_queued}
            sub="ready to send"
            icon={<Mail className="w-4 h-4" />}
          />
          <StatCard
            label="Total Leads"
            value={stats.total_leads}
            sub="researched"
            icon={<Users className="w-4 h-4" />}
          />
          <StatCard
            label="Videos Needed"
            value={stats.videos_needed}
            sub="groups to record"
            icon={<Video className="w-4 h-4" />}
            highlight={stats.videos_needed > 0}
          />
        </div>
      ) : null}

      {/* Two Column */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Calls */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-medium text-sm">Upcoming Calls</h2>
          </div>
          <div className="divide-y">
            {callsLoading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : upcomingCalls?.upcoming_calls?.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No upcoming calls
              </div>
            ) : (
              upcomingCalls?.upcoming_calls?.slice(0, 5).map((call) => (
                <div key={call.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">
                        {call.company_name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {call.contact_name} · {call.city}, {call.state}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {new Date(call.scheduled_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Videos Needed */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-medium text-sm">Videos Needed</h2>
          </div>
          <div className="divide-y">
            {videosLoading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : videosNeeded?.videos_needed?.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                All groups have videos ✓
              </div>
            ) : (
              videosNeeded?.videos_needed?.slice(0, 5).map((video) => (
                <div
                  key={`${video.state}-${video.document_type}`}
                  className="px-6 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        {video.state} —{" "}
                        {video.document_type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {video.leads_waiting} leads waiting
                      </div>
                    </div>
                    <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                      Record
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
