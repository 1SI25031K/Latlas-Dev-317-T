"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { updateProfileFromSettings } from "@/app/actions/profile";

const AVATAR_BUCKET = "avatars";
const AVATAR_MAX_WIDTH = 400;
const AVATAR_QUALITY = 0.8;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

type ProfileData = {
  full_name: string | null;
  title: string | null;
  department: string | null;
  avatar_url: string | null;
  share_avatar_with_students: boolean;
  profile_updated_at: string | null;
};

type SettingsProfileSectionProps = {
  profile: ProfileData | null;
};

export function SettingsProfileSection({ profile }: SettingsProfileSectionProps) {
  const t = useTranslations("settings");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const lastUpdated = profile?.profile_updated_at
    ? new Date(profile.profile_updated_at).getTime()
    : 0;
  const cooldownRemaining = Math.max(0, lastUpdated + COOLDOWN_MS - Date.now());
  const canUpdate = cooldownRemaining === 0;

  useEffect(() => {
    setAvatarUrl(profile?.avatar_url ?? null);
  }, [profile?.avatar_url]);

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
        e.target.value = "";
        setAvatarUploading(false);
        return;
      }
      const { data: urlData } = client.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(path);
      setAvatarUrl(urlData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
    formData.set("avatar_url", avatarUrl ?? "");
    formData.set(
      "share_avatar_with_students",
      (form.querySelector('[name="share_avatar_with_students"]') as HTMLInputElement)?.checked ? "on" : "off"
    );
    try {
      const result = await updateProfileFromSettings(formData);
      if (result?.error) {
        setError(result.error === "profileUpdateLimit" ? "profileUpdateLimit" : result.error);
      } else {
        window.location.reload();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className="mt-6 rounded-lg border p-4"
      style={{
        backgroundColor: "var(--dashboard-card)",
        borderColor: "var(--dashboard-border)",
        color: "var(--dashboard-text)",
      }}
    >
      <h2
        className="text-sm font-medium uppercase tracking-wider"
        style={{ color: "var(--dashboard-text-muted)" }}
      >
        {t("profile")}
      </h2>
      {error && (
        <p
          className="mt-2 rounded-lg p-2 text-sm"
          style={{
            backgroundColor: "var(--dashboard-nav-active-bg)",
            color: "var(--dashboard-text)",
          }}
        >
          {error === "profileUpdateLimit" ? t("profileUpdateLimit") : error}
        </p>
      )}
      {!canUpdate && (
        <p className="mt-2 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
          {t("profileUpdateNext")}{" "}
          {Math.ceil(cooldownRemaining / (60 * 60 * 1000))} {t("profileUpdateHours")}
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="profile_full_name" className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
            {t("profileFullName")}
          </label>
          <input
            id="profile_full_name"
            name="full_name"
            type="text"
            defaultValue={profile?.full_name ?? ""}
            disabled={!canUpdate}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: "var(--dashboard-border)",
              backgroundColor: "var(--dashboard-card)",
              color: "var(--dashboard-text)",
            }}
          />
        </div>
        <div>
          <label htmlFor="profile_title" className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
            {t("profileTitle")}
          </label>
          <input
            id="profile_title"
            name="title"
            type="text"
            defaultValue={profile?.title ?? ""}
            disabled={!canUpdate}
            placeholder={t("profileTitlePlaceholder")}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: "var(--dashboard-border)",
              backgroundColor: "var(--dashboard-card)",
              color: "var(--dashboard-text)",
            }}
          />
        </div>
        <div>
          <label htmlFor="profile_department" className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
            {t("profileDepartment")}
          </label>
          <input
            id="profile_department"
            name="department"
            type="text"
            defaultValue={profile?.department ?? ""}
            disabled={!canUpdate}
            placeholder={t("profileDepartmentPlaceholder")}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: "var(--dashboard-border)",
              backgroundColor: "var(--dashboard-card)",
              color: "var(--dashboard-text)",
            }}
          />
        </div>
        <div>
          <label className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
            {t("profileAvatar")}
          </label>
          <input
            name="avatar_file"
            type="file"
            accept="image/*"
            disabled={!userId || avatarUploading || !canUpdate}
            onChange={handleFileChange}
            className="mt-1 text-sm file:rounded file:border-0 file:bg-green-600 file:px-3 file:py-1 file:text-white"
            style={{ color: "var(--dashboard-text)" }}
          />
          {avatarUploading && <p className="mt-1 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>{t("avatarUploading")}</p>}
          {avatarUrl && (
            <div className="mt-2">
              <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
            </div>
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            name="share_avatar_with_students"
            type="checkbox"
            defaultChecked={profile?.share_avatar_with_students ?? false}
            disabled={!canUpdate}
            className="h-4 w-4 rounded accent-green-500"
            style={{ borderColor: "var(--dashboard-border)" }}
          />
          <span className="text-sm" style={{ color: "var(--dashboard-text)" }}>
            {t("shareAvatarWithStudents")}
          </span>
        </label>
        <button
          type="submit"
          disabled={pending || !canUpdate}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {pending ? "..." : t("profileSave")}
        </button>
      </form>
    </section>
  );
}
