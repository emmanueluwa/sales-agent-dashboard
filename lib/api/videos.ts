/*
videos api - youtube video library mapped to state + document type
*/

import { apiClient } from "./client";

export interface Video {
  id: number;
  state: string;
  document_type: string;
  youtube_url: string | null;
  updated_at: string;
  leads_waiting: number;
  has_video: boolean;
  suggested_questions: string[];
}

export interface VideoNeeded {
  state: string;
  document_type: string;
  leads_waiting: number;
  suggested_questions: string[];
}

export interface VideosResponse {
  videos: Video[];
}

export interface VideosNeededResponse {
  videos_needed: VideoNeeded[];
}

export interface VideoUpdateResponse {
  state: string;
  document_type: string;
  youtube_url: string;
  leads_unblocked: number;
}

export async function getVideos(): Promise<VideosResponse> {
  const { data } = await apiClient.get<VideosResponse>("/api/videos/");
  return data;
}

export async function getVideosNeeded(): Promise<VideosNeededResponse> {
  const { data } =
    await apiClient.get<VideosNeededResponse>("/api/videos/needed");
  return data;
}

export async function updateVideo(
  state: string,
  documentType: string,
  youtubeUrl: string,
): Promise<VideoUpdateResponse> {
  const { data } = await apiClient.put<VideoUpdateResponse>(
    `/api/videos/${state}/${documentType}`,
    { youtube_url: youtubeUrl },
  );
  return data;
}

export async function deleteVideo(
  state: string,
  documentType: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(
    `/api/videos/${state}/${documentType}`,
  );
  return data;
}
