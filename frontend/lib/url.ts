export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const fullUrl = (url?: string | null): string => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
};