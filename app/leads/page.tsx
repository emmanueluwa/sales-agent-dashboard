"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeadGroups, getLeads } from "@/lib";
import { ChevronRight, ExternalLink } from "lucide-react";

const STATUS_COLOURS: Record<string, string> = {
  video_needed: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
  queued: "bg-blue-500/10 text-blue-600",
  sent: "bg-yellow-500/10 text-yellow-600",
  follow_up_1: "bg-orange-500/10 text-orange-600",
  follow_up_2: "bg-orange-500/10 text-orange-600",
  follow_up_3: "bg-orange-500/10 text-orange-600",
  interested: "bg-green-500/10 text-green-600",
  booked: "bg-green-600/10 text-green-700",
  cold: "bg-muted text-muted-foreground",
  unsubscribed: "bg-muted text-muted-foreground",
};

function formatDocType(docType: string): string {
  return docType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LeadsPage() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["lead-groups"],
    queryFn: getLeadGroups,
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["leads", selectedState, selectedDocType],
    queryFn: () =>
      getLeads({
        state: selectedState || undefined,
        document_type: selectedDocType || undefined,
        limit: 100,
      }),
    enabled: !!(selectedState || selectedDocType),
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Civil engineering firms grouped by state and document type
        </p>
      </div>

      {/* Groups Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-medium text-sm">Lead Groups</h2>
        </div>

        {groupsLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                    State
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                    Document Type
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Queued
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Sent
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Interested
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Booked
                  </th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground">
                    Video
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {groupsData?.groups?.map((group) => (
                  <tr
                    key={`${group.state}-${group.document_type}`}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedState(group.state);
                      setSelectedDocType(group.document_type);
                    }}
                  >
                    <td className="px-6 py-3 font-medium">{group.state}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {formatDocType(group.document_type)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {group.total_leads}
                    </td>
                    <td className="px-4 py-3 text-right text-blue-600">
                      {group.queued}
                    </td>
                    <td className="px-4 py-3 text-right text-yellow-600">
                      {group.sent}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {group.interested}
                    </td>
                    <td className="px-4 py-3 text-right text-green-700 font-medium">
                      {group.booked}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {group.youtube_url ? (
                        <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                          ✓ Ready
                        </span>
                      ) : (
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                          Needed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Panel */}
      {(selectedState || selectedDocType) && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-medium text-sm">
              {selectedState} —{" "}
              {selectedDocType ? formatDocType(selectedDocType) : "All"}
            </h2>
            <button
              onClick={() => {
                setSelectedState(null);
                setSelectedDocType(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>

          {leadsLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                      Company
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      City
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Decision Maker
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Website
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leadsData?.leads?.map((lead) => (
                    <tr
                      key={lead.place_id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium">
                        {lead.company_name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {lead.city}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {lead.decision_maker_name || "—"}
                        {lead.decision_maker_title && (
                          <span className="text-xs ml-1 text-muted-foreground/70">
                            ({lead.decision_maker_title})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.outreach_status ? (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              STATUS_COLOURS[lead.outreach_status] ||
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {formatStatus(lead.outreach_status)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Not contacted
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.website ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
