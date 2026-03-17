"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { updateProfileFromSettings } from "@/app/actions/profile";
import { User, EditPencil } from "iconoir-react";
import { PROFILE_TITLE_IDS, PROFILE_TITLE_EMPTY, PROFILE_TITLE_SETTINGS_KEYS } from "@/lib/profile-title-options";

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

function AvatarWithPen({
  avatarUrl,
  onFileSelect,
  disabled,
  uploading,
  sizeClass = "h-20 w-20",
}: {
  avatarUrl: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  uploading?: boolean;
  sizeClass?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={disabled || uploading}
      className={`relative shrink-0 overflow-hidden rounded-full border ${sizeClass}`}
      style={{
        borderColor: "var(--dashboard-border)",
        backgroundColor: "var(--dashboard-card)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onFileSelect}
      />
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <User className="h-1/2 w-1/2" style={{ color: "var(--dashboard-text-muted)" }} />
        </span>
      )}
      {/* Pen overlay on bottom 1/4 of circle */}
      <span
        className="absolute bottom-0 left-0 right-0 flex h-1/4 items-center justify-center rounded-b-full bg-black/50"
        style={{ color: "var(--dashboard-card)" }}
      >
        {uploading ? (
          <span className="text-xs">...</span>
        ) : (
          <EditPencil className="h-4 w-4" strokeWidth={2} />
        )}
      </span>
    </button>
  );
}

export function SettingsProfileSection({ profile }: SettingsProfileSectionProps) {
  const t = useTranslations("settings");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
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
        setSheetOpen(false);
        window.location.reload();
      }
    } finally {
      setPending(false);
    }
  }

  const displayName = profile?.full_name?.trim() || t("profileNoName");

  return (
    <>
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
        <div className="mt-4 flex items-center gap-4">
          <AvatarWithPen
            avatarUrl={avatarUrl}
            onFileSelect={handleFileChange}
            disabled={!userId || !canUpdate}
            uploading={avatarUploading}
            sizeClass="h-16 w-16"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium" style={{ color: "var(--dashboard-text)" }}>
              {displayName}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
            style={{
              borderColor: "var(--dashboard-border)",
              color: "var(--dashboard-text)",
              backgroundColor: "var(--dashboard-sidebar)",
            }}
          >
            {t("profileEdit")}
          </button>
        </div>
      </section>

      {/* Bottom sheet */}
      {sheetOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden
            onClick={() => setSheetOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t shadow-lg"
            style={{
              backgroundColor: "var(--dashboard-card)",
              borderColor: "var(--dashboard-border)",
              color: "var(--dashboard-text)",
            }}
          >
            <div className="sticky top-0 flex items-center justify-between border-b p-4" style={{ borderColor: "var(--dashboard-border)" }}>
              <h3 className="text-lg font-semibold">{t("profile")}</h3>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="rounded-lg px-3 py-1 text-sm hover:opacity-80"
                style={{ color: "var(--dashboard-text-muted)" }}
              >
                {t("profileClose")}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-4">
              {error && (
                <p
                  className="rounded-lg p-2 text-sm"
                  style={{
                    backgroundColor: "var(--dashboard-nav-active-bg)",
                    color: "var(--dashboard-text)",
                  }}
                >
                  {error === "profileUpdateLimit" ? t("profileUpdateLimit") : error}
                </p>
              )}
              {!canUpdate && (
                <p className="text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
                  {t("profileUpdateNext")}{" "}
                  {Math.ceil(cooldownRemaining / (60 * 60 * 1000))} {t("profileUpdateHours")}
                </p>
              )}
              <div className="flex justify-center">
                <AvatarWithPen
                  avatarUrl={avatarUrl}
                  onFileSelect={handleFileChange}
                  disabled={!userId || !canUpdate}
                  uploading={avatarUploading}
                  sizeClass="h-24 w-24"
                />
              </div>
              <div>
                <label htmlFor="sheet_full_name" className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                  {t("profileFullName")}
                </label>
                <input
                  id="sheet_full_name"
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
                <label htmlFor="sheet_title" className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                  {t("profileTitle")}
                </label>
                <select
                  id="sheet_title"
                  name="title"
                  disabled={!canUpdate}
                  defaultValue={
                    profile?.title && PROFILE_TITLE_IDS.includes(profile.title as typeof PROFILE_TITLE_IDS[number])
                      ? profile.title
                      : profile?.title
                        ? "other"
                        : PROFILE_TITLE_EMPTY
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: "var(--dashboard-border)",
                    backgroundColor: "var(--dashboard-card)",
                    color: "var(--dashboard-text)",
                  }}
                >
                  <option value={PROFILE_TITLE_EMPTY}>{t("profileTitlePlaceholder")}</option>
                  {PROFILE_TITLE_IDS.map((id) => (
                    <option key={id} value={id}>
                      {t(PROFILE_TITLE_SETTINGS_KEYS[id])}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sheet_department" className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                  {t("profileDepartment")}
                </label>
                <input
                  id="sheet_department"
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
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium"
                  style={{
                    borderColor: "var(--dashboard-border)",
                    color: "var(--dashboard-text)",
                  }}
                >
                  {t("profileClose")}
                </button>
                <button
                  type="submit"
                  disabled={pending || !canUpdate}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {pending ? "..." : t("profileSave")}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
