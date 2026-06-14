"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNoEmailLeads, updateEmail, type NoEmailLead } from "@/lib";
import { AtSign, ExternalLink, Link2 } from "lucide-react";

function formatDocType(docType: string | null): string {
  if (!docType) return "—";
  return docType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function NoEmailPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [linkedinInput, setLinkedinInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["no-email"],
    queryFn: getNoEmailLeads,
    refetchInterval: 60000,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      email,
      name,
      linkedin,
    }: {
      id: number;
      email: string;
      name: string;
      linkedin: string;
    }) => updateEmail(id, email, name || undefined, linkedin || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["no-email"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setEditingId(null);
      setEmailInput("");
      setNameInput("");
      setLinkedinInput("");
    },
    onError: () => {
      alert("Failed to save. Please try again.");
    },
  });

  const handleEdit = (lead: NoEmailLead) => {
    setEditingId(lead.id);
    setEmailInput("");
    setNameInput(lead.decision_maker_name || "");
    setLinkedinInput(lead.linkedin_url || "");
  };

  const handleSave = (id: number) => {
    if (!emailInput.trim() || !emailInput.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    updateMutation.mutate({
      id,
      email: emailInput.trim(),
      name: nameInput.trim(),
      linkedin: linkedinInput.trim(),
    });
  };

  const leads = data?.leads || [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-balance">
          No Email
        </h1>
        <p className="text-sm text-muted-foreground mt-1 text-pretty">
          {leads.length} leads waiting for an email address. Add an email to
          queue them for outreach automatically.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-4 sm:p-5 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 sm:p-12 text-center">
          <AtSign className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <div className="text-sm text-muted-foreground">
            No leads missing emails.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-xl border bg-card p-4 sm:p-5 space-y-3"
            >
              {/* Company info */}
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium break-words">
                    {lead.company_name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 break-words">
                    {lead.city}, {lead.state} ·{" "}
                    {formatDocType(lead.document_type)}
                  </div>
                  {lead.decision_maker_name && (
                    <div className="text-xs text-muted-foreground mt-0.5 break-words">
                      {lead.decision_maker_name}
                      {lead.decision_maker_title &&
                        ` — ${lead.decision_maker_title}`}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {lead.website && (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open website"
                      className="p-1.5 -m-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {lead.linkedin_url && (
                    <a
                      href={lead.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open LinkedIn profile"
                      className="p-1.5 -m-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Link2 className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Email entry form */}
              {editingId === lead.id ? (
                <div className="space-y-2 pt-2 border-t">
                  <input
                    type="text"
                    placeholder="Full name (optional)"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full text-sm bg-background border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="url"
                    placeholder="LinkedIn URL (optional)"
                    value={linkedinInput}
                    onChange={(e) => setLinkedinInput(e.target.value)}
                    className="w-full text-sm bg-background border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="email"
                    placeholder="email@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full text-sm bg-background border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <div className="flex flex-col-reverse sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEmailInput("");
                        setNameInput("");
                        setLinkedinInput("");
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 transition-colors sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(lead.id)}
                      disabled={updateMutation.isPending}
                      className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity w-full sm:w-auto sm:order-2"
                    >
                      {updateMutation.isPending ? "Saving..." : "Save & Queue"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleEdit(lead)}
                  className="text-xs text-primary hover:opacity-80 transition-opacity flex items-center gap-1.5"
                >
                  <AtSign className="w-3.5 h-3.5" />
                  Add email
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
