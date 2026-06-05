"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVideos, updateVideo, deleteVideo } from "@/lib";
import {
  Video,
  CheckCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
} from "lucide-react";

function formatDocType(docType: string): string {
  return docType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function VideosPage() {
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: getVideos,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      state,
      documentType,
      url,
    }: {
      state: string;
      documentType: string;
      url: string;
    }) => updateVideo(state, documentType, url),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos-needed"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setEditingKey(null);
      setUrlInput("");
      alert(
        `Video saved — ${result.leads_unblocked} leads unblocked and queued for outreach.`,
      );
    },
    onError: () => {
      alert("Failed to save video. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      state,
      documentType,
    }: {
      state: string;
      documentType: string;
    }) => deleteVideo(state, documentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const handleSave = (state: string, documentType: string) => {
    if (!urlInput.trim()) return;
    if (!urlInput.includes("youtube.com") && !urlInput.includes("youtu.be")) {
      alert("Please enter a valid YouTube URL.");
      return;
    }
    updateMutation.mutate({ state, documentType, url: urlInput.trim() });
  };

  const videos = data?.videos || [];
  const withVideo = videos.filter((v) => v.has_video);
  const withoutVideo = videos.filter((v) => !v.has_video);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Videos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a YouTube URL for each state and document type group. Once
          added, leads in that group are queued for outreach automatically.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-5 h-20 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Videos Needed */}
          {withoutVideo.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <h2 className="font-medium text-sm">
                  Needs Recording ({withoutVideo.length})
                </h2>
              </div>

              {withoutVideo
                .sort((a, b) => b.leads_waiting - a.leads_waiting)
                .map((video) => {
                  const key = `${video.state}-${video.document_type}`;
                  const isEditing = editingKey === key;

                  return (
                    <div
                      key={key}
                      className="rounded-xl border bg-card p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-sm">
                            {video.state} — {formatDocType(video.document_type)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {video.leads_waiting} leads waiting
                          </div>
                        </div>
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full shrink-0">
                          Record needed
                        </span>
                      </div>

                      {/* Suggested Questions */}
                      {video.suggested_questions.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Suggested questions for your demo
                          </div>
                          <ul className="space-y-1">
                            {video.suggested_questions.map((q, i) => (
                              <li
                                key={i}
                                className="text-xs text-muted-foreground flex gap-2"
                              >
                                <span className="text-primary shrink-0">
                                  {i + 1}.
                                </span>
                                {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* URL Input */}
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://youtube.com/watch?v=..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="flex-1 text-sm bg-background border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                          <button
                            onClick={() =>
                              handleSave(video.state, video.document_type)
                            }
                            disabled={updateMutation.isPending}
                            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                          >
                            {updateMutation.isPending ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingKey(null);
                              setUrlInput("");
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingKey(key);
                            setUrlInput("");
                          }}
                          className="text-sm text-primary hover:opacity-80 transition-opacity flex items-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Add YouTube URL
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Videos Ready */}
          {withVideo.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <h2 className="font-medium text-sm">
                  Ready ({withVideo.length})
                </h2>
              </div>

              {withVideo.map((video) => {
                const key = `${video.state}-${video.document_type}`;
                const isEditing = editingKey === key;

                return (
                  <div key={key} className="rounded-xl border bg-card p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-sm">
                          {video.state} — {formatDocType(video.document_type)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {video.leads_waiting > 0
                            ? `${video.leads_waiting} leads waiting`
                            : "All leads processed"}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {video.youtube_url && (
                          <a
                            href={video.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setEditingKey(key);
                            setUrlInput(video.youtube_url || "");
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Remove this video? Leads will revert to video needed.",
                              )
                            ) {
                              deleteMutation.mutate({
                                state: video.state,
                                documentType: video.document_type,
                              });
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 mt-4">
                        <input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="flex-1 text-sm bg-background border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                        />
                        <button
                          onClick={() =>
                            handleSave(video.state, video.document_type)
                          }
                          disabled={updateMutation.isPending}
                          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                          {updateMutation.isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingKey(null);
                            setUrlInput("");
                          }}
                          className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {videos.length === 0 && (
            <div className="rounded-xl border bg-card p-12 text-center">
              <Video className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <div className="text-sm text-muted-foreground">
                No video groups yet. Run the scraper to generate leads first.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
