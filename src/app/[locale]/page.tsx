import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("common");
  const tAuth = await getTranslations("auth");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F5F5F7]">
      <h1 className="text-2xl font-semibold text-gray-900">{t("appName")}</h1>
      <nav className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {tAuth("login")}
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          {tAuth("signup")}
        </Link>
      </nav>
    </div>
  );
}
