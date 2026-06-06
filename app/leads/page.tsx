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

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">Not contacted</span>;
  }
  return (
    <span
      className={`inline-block text-xs px-2 py-1 rounded-full ${
        STATUS_COLOURS[status] || "bg-muted text-muted-foreground"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
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

  function selectGroup(state: string, docType: string) {
    setSelectedState(state);
    setSelectedDocType(docType);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Leads
        </h1>
        <p className="text-sm text-muted-foreground mt-1 text-pretty">
          Civil engineering firms grouped by state and document type
        </p>
      </div>

      {/* Groups */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b">
          <h2 className="font-medium text-sm">Lead Groups</h2>
        </div>

        {groupsLoading ? (
          <div className="p-4 sm:p-6 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <>
            {/* Mobile / small: card list */}
            <ul className="divide-y md:hidden">
              {groupsData?.groups?.map((group) => (
                <li key={`${group.state}-${group.document_type}`}>
                  <button
                    type="button"
                    onClick={() =>
                      selectGroup(group.state, group.document_type)
                    }
                    className="w-full text-left px-4 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{group.state}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {formatDocType(group.document_type)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {group.youtube_url ? (
                          <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full whitespace-nowrap">
                            Ready
                          </span>
                        ) : (
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full whitespace-nowrap">
                            Needed
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Total</dt>
                        <dd className="font-medium">{group.total_leads}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Queued</dt>
                        <dd className="text-blue-600">{group.queued}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Sent</dt>
                        <dd className="text-yellow-600">{group.sent}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Interested</dt>
                        <dd className="text-green-600">{group.interested}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Booked</dt>
                        <dd className="text-green-700 font-medium">
                          {group.booked}
                        </dd>
                      </div>
                    </dl>
                  </button>
                </li>
              ))}
            </ul>

            {/* Tablet / desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 lg:px-6 py-3 font-medium text-muted-foreground">
                      State
                    </th>
                    <th className="text-left px-4 lg:px-6 py-3 font-medium text-muted-foreground">
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
                    <th className="text-right px-4 lg:px-6 py-3 font-medium text-muted-foreground">
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
                      onClick={() =>
                        selectGroup(group.state, group.document_type)
                      }
                    >
                      <td className="px-4 lg:px-6 py-3 font-medium">
                        {group.state}
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-muted-foreground">
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
                      <td className="px-4 lg:px-6 py-3 text-right">
                        {group.youtube_url ? (
                          <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full whitespace-nowrap">
                            Ready
                          </span>
                        ) : (
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full whitespace-nowrap">
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
          </>
        )}
      </div>

      {/* Lead Detail Panel */}
      {(selectedState || selectedDocType) && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between gap-3">
            <h2 className="font-medium text-sm min-w-0 truncate">
              {selectedState} —{" "}
              {selectedDocType ? formatDocType(selectedDocType) : "All"}
            </h2>
            <button
              onClick={() => {
                setSelectedState(null);
                setSelectedDocType(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Clear
            </button>
          </div>

          {leadsLoading ? (
            <div className="p-4 sm:p-6 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : (
            <>
              {/* Mobile / small: card list */}
              <ul className="divide-y md:hidden">
                {leadsData?.leads?.map((lead) => (
                  <li key={lead.place_id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {lead.company_name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {lead.city}
                        </p>
                      </div>
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
                          aria-label={`Visit ${lead.company_name} website`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <StatusBadge status={lead.outreach_status} />
                      <span className="text-muted-foreground">
                        {lead.decision_maker_name || "—"}
                        {lead.decision_maker_title && (
                          <span className="text-xs ml-1 text-muted-foreground/70">
                            ({lead.decision_maker_title})
                          </span>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Tablet / desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-4 lg:px-6 py-3 font-medium text-muted-foreground">
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
                        <td className="px-4 lg:px-6 py-3 font-medium">
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
                          <StatusBadge status={lead.outreach_status} />
                        </td>
                        <td className="px-4 py-3">
                          {lead.website ? (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={`Visit ${lead.company_name} website`}
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
