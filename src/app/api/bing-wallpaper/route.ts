import { NextResponse } from "next/server";

const BING_HP_API =
  "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=ja-JP";
const BING_BASE = "https://www.bing.com";

export async function GET() {
  try {
    const res = await fetch(BING_HP_API, { next: { revalidate: 86400 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Bing wallpaper" },
        { status: 502 }
      );
    }
    const data = (await res.json()) as {
      images?: Array<{ url?: string }>;
    };
    const url = data?.images?.[0]?.url;
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Invalid Bing API response" },
        { status: 502 }
      );
    }
    const fullUrl = url.startsWith("http") ? url : `${BING_BASE}${url}`;
    return NextResponse.json({ url: fullUrl });
  } catch (e) {
    return NextResponse.json(
      { error: "Bing wallpaper fetch failed" },
      { status: 500 }
    );
  }
}
