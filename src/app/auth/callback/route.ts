import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ensureProfile } from "@/app/actions/auth";
import { routing } from "@/i18n/routing";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? `/${routing.defaultLocale}/dashboard`;

  if (!code) {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}/login`, request.url));
  }

  const response = NextResponse.redirect(new URL(next.startsWith("/") ? next : `/${next}`, request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}/login`, request.url));
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) {
    await ensureProfile(session.user.id, session.user.email ?? undefined, null);
  }

  return response;
}
