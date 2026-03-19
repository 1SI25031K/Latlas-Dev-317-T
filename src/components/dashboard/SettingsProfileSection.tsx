"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { updateProfileFromSettings } from "@/app/actions/profile";
import { User, EditPencil, Plus, Trash } from "iconoir-react";
import { DashboardCloseButton } from "@/components/dashboard/DashboardCloseButton";
import { profileGreetingName } from "@/lib/profile-display";

const AVATAR_BUCKET = "avatars";
const AVATAR_MAX_WIDTH = 400;
const AVATAR_QUALITY = 0.8;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export type AffiliationRow = {
  affiliation: string;
  title_at_affiliation: string;
};

export type SettingsProfilePayload = {
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  contact_email: string | null;
  phone: string | null;
  email_visible_to_students: boolean;
  avatar_url: string | null;
  share_avatar_with_students: boolean;
  profile_updated_at: string | null;
  contact_office: string;
  contact_office_hours: string;
  contact_url: string;
  contact_note: string;
};

type SettingsProfileSectionProps = {
  profile: SettingsProfilePayload | null;
  affiliations: AffiliationRow[];
  userEmail: string | null;
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

function dobInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const s = String(iso);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export function SettingsProfileSection({ profile, affiliations, userEmail }: SettingsProfileSectionProps) {
  const t = useTranslations("settings");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const initialAffRows = useMemo<AffiliationRow[]>(() => {
    if (affiliations.length > 0) {
      return affiliations.map((a) => ({
        affiliation: a.affiliation ?? "",
        title_at_affiliation: a.title_at_affiliation ?? "",
      }));
    }
    return [{ affiliation: "", title_at_affiliation: "" }];
  }, [affiliations]);

  const [affRows, setAffRows] = useState<AffiliationRow[]>(initialAffRows);
  useEffect(() => {
    setAffRows(initialAffRows);
  }, [initialAffRows]);

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
      const { data: urlData } = client.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      setAvatarUrl(urlData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  }

  function addAffiliation() {
    setAffRows((r) => [...r, { affiliation: "", title_at_affiliation: "" }]);
  }

  function removeAffiliation(i: number) {
    setAffRows((r) => (r.length <= 1 ? r : r.filter((_, idx) => idx !== i)));
  }

  function patchAffiliation(i: number, patch: Partial<AffiliationRow>) {
    setAffRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
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
    formData.set(
      "email_visible_to_students",
      (form.querySelector('[name="email_visible_to_students"]') as HTMLInputElement)?.checked ? "on" : "off"
    );
    formData.set("affiliations_json", JSON.stringify(affRows));
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

  const greeting =
    profileGreetingName(
      profile?.first_name,
      profile?.middle_name,
      profile?.last_name,
      null
    ) || t("profileNoName");

  const inputClass =
    "mt-1 w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-60";
  const inputStyle = {
    borderColor: "var(--dashboard-border)",
    backgroundColor: "var(--dashboard-card)",
    color: "var(--dashboard-text)",
  } as const;

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
              {greeting}
            </p>
            {userEmail && (
              <p className="truncate text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                {userEmail}
              </p>
            )}
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

      {sheetOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden
            onClick={() => setSheetOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t shadow-lg"
            style={{
              backgroundColor: "var(--dashboard-card)",
              borderColor: "var(--dashboard-border)",
              color: "var(--dashboard-text)",
            }}
          >
            <div
              className="sticky top-0 flex items-center justify-between border-b p-4"
              style={{ borderColor: "var(--dashboard-border)" }}
            >
              <h3 className="text-lg font-semibold">{t("profile")}</h3>
              <DashboardCloseButton onClick={() => setSheetOpen(false)} aria-label={t("profileClose")} />
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 p-4 pb-8">
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
                  {t("profileUpdateNext")} {Math.ceil(cooldownRemaining / (60 * 60 * 1000))}{" "}
                  {t("profileUpdateHours")}
                </p>
              )}

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>
                  {t("accountSection")}
                </h4>
                <div className="mt-2 space-y-2">
                  <div>
                    <label className="text-sm font-medium">{t("accountEmail")}</label>
                    <input
                      type="email"
                      readOnly
                      value={userEmail ?? ""}
                      className={inputClass}
                      style={{ ...inputStyle, opacity: 0.85 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="sheet_phone" className="text-sm font-medium">
                      {t("accountPhone")}
                    </label>
                    <input
                      id="sheet_phone"
                      name="phone"
                      type="tel"
                      defaultValue={profile?.phone ?? ""}
                      disabled={!canUpdate}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>
                  {t("studentVisibleSection")}
                </h4>
                <div className="mt-2 flex justify-center">
                  <AvatarWithPen
                    avatarUrl={avatarUrl}
                    onFileSelect={handleFileChange}
                    disabled={!userId || !canUpdate}
                    uploading={avatarUploading}
                    sizeClass="h-24 w-24"
                  />
                </div>
                <label className="mt-2 flex cursor-pointer items-center gap-2">
                  <input
                    name="share_avatar_with_students"
                    type="checkbox"
                    defaultChecked={profile?.share_avatar_with_students ?? false}
                    disabled={!canUpdate}
                    className="h-4 w-4 rounded accent-green-500"
                  />
                  <span className="text-sm">{t("shareAvatarWithStudents")}</span>
                </label>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div>
                    <label htmlFor="sheet_first" className="text-sm font-medium">
                      {t("firstName")} *
                    </label>
                    <input
                      id="sheet_first"
                      name="first_name"
                      required
                      defaultValue={profile?.first_name ?? ""}
                      disabled={!canUpdate}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="sheet_middle" className="text-sm font-medium">
                      {t("middleName")}
                    </label>
                    <input
                      id="sheet_middle"
                      name="middle_name"
                      defaultValue={profile?.middle_name ?? ""}
                      disabled={!canUpdate}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="sheet_last" className="text-sm font-medium">
                      {t("lastName")} *
                    </label>
                    <input
                      id="sheet_last"
                      name="last_name"
                      required
                      defaultValue={profile?.last_name ?? ""}
                      disabled={!canUpdate}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label htmlFor="sheet_dob" className="text-sm font-medium">
                    {t("dateOfBirth")}
                  </label>
                  <input
                    id="sheet_dob"
                    name="date_of_birth"
                    type="date"
                    defaultValue={dobInputValue(profile?.date_of_birth)}
                    disabled={!canUpdate}
                    className={inputClass}
                    style={inputStyle}
                  />
                  <p className="mt-0.5 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                    {t("dateOfBirthHint")}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>
                  {t("affiliationsSection")}
                </h4>
                <p className="mt-1 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                  {t("affiliationsHint")}
                </p>
                <div className="mt-2 space-y-3">
                  {affRows.map((row, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end"
                      style={{ borderColor: "var(--dashboard-border)" }}
                    >
                      <div className="min-w-0 flex-1">
                        <label className="text-xs font-medium">{t("affiliationLabel")}</label>
                        <input
                          type="text"
                          value={row.affiliation}
                          onChange={(e) => patchAffiliation(i, { affiliation: e.target.value })}
                          disabled={!canUpdate}
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <label className="text-xs font-medium">{t("titleAtAffiliation")}</label>
                        <input
                          type="text"
                          value={row.title_at_affiliation}
                          onChange={(e) => patchAffiliation(i, { title_at_affiliation: e.target.value })}
                          disabled={!canUpdate}
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAffiliation(i)}
                        disabled={!canUpdate || affRows.length <= 1}
                        className="flex shrink-0 items-center justify-center rounded-lg border p-2 disabled:opacity-40"
                        style={{ borderColor: "var(--dashboard-border)" }}
                        aria-label={t("removeAffiliation")}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAffiliation}
                    disabled={!canUpdate}
                    className="flex items-center gap-1 text-sm font-medium text-green-600 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {t("addAffiliation")}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>
                  {t("studentContactSection")}
                </h4>
                <p className="mt-1 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                  {t("studentContactHint")}
                </p>
                <div className="mt-2 space-y-2">
                  <div>
                    <label className="text-sm font-medium">{t("contactOffice")}</label>
                    <input
                      name="contact_office"
                      defaultValue={profile?.contact_office ?? ""}
                      disabled={!canUpdate}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("contactOfficeHours")}</label>
                    <input
                      name="contact_office_hours"
                      defaultValue={profile?.contact_office_hours ?? ""}
                      disabled={!canUpdate}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("contactUrl")}</label>
                    <input
                      name="contact_url"
                      type="url"
                      defaultValue={profile?.contact_url ?? ""}
                      disabled={!canUpdate}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("contactNote")}</label>
                    <textarea
                      name="contact_note"
                      rows={2}
                      defaultValue={profile?.contact_note ?? ""}
                      disabled={!canUpdate}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>
                  {t("emailToStudentsSection")}
                </h4>
                <div className="mt-2">
                  <label className="text-sm font-medium">{t("contactEmailStudent")}</label>
                  <input
                    name="contact_email"
                    type="email"
                    defaultValue={profile?.contact_email ?? ""}
                    disabled={!canUpdate}
                    placeholder={userEmail ?? ""}
                    className={inputClass}
                    style={inputStyle}
                  />
                  <p className="mt-0.5 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                    {t("contactEmailHint")}
                  </p>
                </div>
                <label className="mt-2 flex cursor-pointer items-center gap-2">
                  <input
                    name="email_visible_to_students"
                    type="checkbox"
                    defaultChecked={profile?.email_visible_to_students ?? false}
                    disabled={!canUpdate}
                    className="h-4 w-4 rounded accent-green-500"
                  />
                  <span className="text-sm">{t("emailVisibleToStudents")}</span>
                </label>
                <p className="mt-0.5 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                  {t("emailVisibleHint")}
                </p>
              </div>

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
