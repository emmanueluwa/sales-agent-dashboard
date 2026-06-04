/* 
axios instance - base configuration for all api requests
*/

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `API error: ${error.response.status} — ${error.config.url}`,
      );
    } else if (error.request) {
      console.error(`No response from API: ${error.config.url}`);
    }
    return Promise.reject(error);
  },
);
