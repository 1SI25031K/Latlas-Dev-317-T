import { setRequestLocale } from "next-intl/server";
import { SignupForm } from "@/components/auth/SignupForm";

type Props = { params: Promise<{ locale: string }> };

export default async function SignupPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7]">
      <SignupForm />
    </div>
  );
}
