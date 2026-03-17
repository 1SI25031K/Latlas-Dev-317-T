"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

type EnrollMFAProps = {
  onEnrolled: () => void;
  onCancelled?: () => void;
};

export function EnrollMFA({ onEnrolled, onCancelled }: EnrollMFAProps) {
  const t = useTranslations("auth");
  const [factorId, setFactorId] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.mfa
      .enroll({ factorType: "totp" })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
          return;
        }
        if (data?.id) setFactorId(data.id);
        if (data?.totp?.qr_code) {
          const svg = data.totp.qr_code;
          setQrCode(svg.startsWith("data:") ? svg : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
        }
      });
  }, []);

  async function handleEnable() {
    if (!factorId || !verifyCode.trim()) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }
    const challengeId = challengeData?.id;
    if (!challengeId) {
      setError("Invalid challenge");
      setLoading(false);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: verifyCode.trim(),
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    onEnrolled();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t("mfaEnrollTitle")}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-auto rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
        style={{
          borderColor: "var(--dashboard-border, #e5e7eb)",
          backgroundColor: "var(--dashboard-card, #fff)",
        }}
      >
        <h2 className="text-xl font-semibold text-gray-900" style={{ color: "var(--dashboard-text, #111)" }}>
          {t("mfaEnrollTitle")}
        </h2>
        <p className="mt-2 text-sm text-gray-600" style={{ color: "var(--dashboard-text-muted, #4b5563)" }}>
          {t("mfaEnrollDescription")}
        </p>
        {error && (
          <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>
        )}
        {qrCode && (
          <div className="mt-4 flex justify-center">
            <img
              src={qrCode}
              alt="QR code for authenticator app"
              className="h-48 w-48 rounded border border-gray-200"
            />
          </div>
        )}
        <div className="mt-4">
          <label htmlFor="mfa-verify-code" className="block text-sm font-medium text-gray-700">
            {t("mfaEnrollVerifyLabel")}
          </label>
          <input
            id="mfa-verify-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-lg tracking-widest"
            style={{
              borderColor: "var(--dashboard-border)",
              backgroundColor: "var(--dashboard-card)",
              color: "var(--dashboard-text)",
            }}
          />
        </div>
        <div className="mt-6 flex gap-2">
          {onCancelled && (
            <button
              type="button"
              onClick={onCancelled}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t("mfaEnrollCancel")}
            </button>
          )}
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading || !verifyCode.trim() || verifyCode.length !== 6}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "..." : t("mfaEnrollEnable")}
          </button>
        </div>
      </div>
    </div>
  );
}
