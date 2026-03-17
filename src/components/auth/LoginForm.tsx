"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"password" | "mfa">("password");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal?.currentLevel !== "aal2") {
      setStep("mfa");
      return;
    }
    router.refresh();
    router.push("/dashboard");
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMfaLoading(true);
    const supabase = createClient();
    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError || !factors?.totp?.length) {
      setError("No authenticator factor found.");
      setMfaLoading(false);
      return;
    }
    const factorId = factors.totp[0].id;
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setError(challengeError.message);
      setMfaLoading(false);
      return;
    }
    const challengeId = challengeData?.id;
    if (!challengeId) {
      setError("Invalid challenge");
      setMfaLoading(false);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: mfaCode.trim(),
    });
    setMfaLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    router.refresh();
    router.push("/dashboard");
  }

  if (step === "mfa") {
    return (
      <form
        onSubmit={handleMfaSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-gray-900">{t("mfaVerifyTitle")}</h2>
        <p className="text-sm text-gray-600">{t("mfaVerifyDescription")}</p>
        {error && (
          <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="mfa-code" className="text-sm font-medium text-gray-700">
            {t("mfaVerifyLabel")}
          </label>
          <input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-lg tracking-widest text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
        <button
          type="submit"
          disabled={mfaLoading || mfaCode.length !== 6}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mfaLoading ? "..." : t("mfaVerifySubmit")}
        </button>
        <button
          type="button"
          onClick={async () => {
            await createClient().auth.signOut();
            setStep("password");
            setError(null);
            setMfaCode("");
          }}
          className="text-sm text-gray-600 hover:underline"
        >
          {t("mfaVerifyBack")}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handlePasswordSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-gray-900">{t("loginTitle")}</h2>
      {error && (
        <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>
      )}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          {t("password")}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          autoComplete="current-password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "..." : t("loginButton")}
      </button>
      <p className="text-center text-sm text-gray-600">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-medium text-blue-600 hover:underline">
          {t("goToSignup")}
        </Link>
      </p>
    </form>
  );
}
