"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { completeOnboarding } from "@/app/actions/onboarding";

const AVATAR_BUCKET = "avatars";
const AVATAR_MAX_WIDTH = 400;
const AVATAR_QUALITY = 0.8;

type OnboardingFormProps = {
  locale: string;
};

export function OnboardingForm({ locale }: OnboardingFormProps) {
  const t = useTranslations("onboarding");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      if (session?.user.id) setUserId(session.user.id);
    });
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setError(null);
    setAvatarUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: AVATAR_MAX_WIDTH,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: AVATAR_QUALITY,
      });
      const path = `${userId}/${crypto.randomUUID()}.jpg`;
      const client = createClient();
      const { error: uploadError } = await client.storage
        .from(AVATAR_BUCKET)
        .upload(path, compressed, { upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        setAvatarUrl(null);
        return;
      }
      const { data: urlData } = client.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(path);
      setAvatarUrl(urlData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setAvatarUrl(null);
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("locale", locale);
    if (avatarUrl) formData.set("avatar_url", avatarUrl);
    try {
      const result = await completeOnboarding(formData);
      if (result?.error) {
        setError(result.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="locale" value={locale} />
      <h2 className="text-xl font-semibold text-gray-900">{t("title")}</h2>
      {error && (
        <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>
      )}
      <div className="flex flex-col gap-2">
        <label htmlFor="full_name" className="text-sm font-medium text-gray-700">
          {t("fullName")}
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          className="rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          autoComplete="name"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          {t("titleLabel")}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder={t("titlePlaceholder")}
          className="rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="department" className="text-sm font-medium text-gray-700">
          {t("department")}
        </label>
        <input
          id="department"
          name="department"
          type="text"
          placeholder={t("departmentPlaceholder")}
          className="rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="avatar_file" className="text-sm font-medium text-gray-700">
          {t("avatarUrl")}
        </label>
        <input
          id="avatar_file"
          name="avatar_file"
          type="file"
          accept="image/*"
          disabled={!userId || avatarUploading}
          onChange={handleFileChange}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 file:mr-2 file:rounded file:border-0 file:bg-green-600 file:px-3 file:py-1 file:text-white file:hover:bg-green-700"
        />
        {avatarUploading && (
          <p className="text-xs text-gray-500">{t("avatarUploading")}</p>
        )}
        {avatarUrl && (
          <div className="mt-1">
            <img
              src={avatarUrl}
              alt=""
              className="h-24 w-24 rounded-full object-cover"
            />
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? "..." : t("submit")}
      </button>
    </form>
  );
}
