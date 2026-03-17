const CACHE_DATE_KEY = "latlas-bing-wallpaper-date";
const CACHE_URL_KEY = "latlas-bing-wallpaper-url";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns the Bing wallpaper URL for today. Uses client-side cache:
 * if we have a cached URL with today's date, return it without calling the API.
 */
export async function getBingWallpaperUrl(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const today = todayKey();
  const cachedDate = localStorage.getItem(CACHE_DATE_KEY);
  const cachedUrl = localStorage.getItem(CACHE_URL_KEY);
  if (cachedDate === today && cachedUrl) {
    return cachedUrl;
  }
  try {
    const res = await fetch("/api/bing-wallpaper");
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    const url = data?.url;
    if (!url || typeof url !== "string") return null;
    localStorage.setItem(CACHE_DATE_KEY, today);
    localStorage.setItem(CACHE_URL_KEY, url);
    return url;
  } catch {
    return null;
  }
}
