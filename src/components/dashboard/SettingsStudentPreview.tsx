import { getTranslations } from "next-intl/server";
import type { TeacherPublicProfile } from "@/lib/profile-display";

type Props = {
  preview: TeacherPublicProfile | null;
};

export async function SettingsStudentPreview({ preview }: Props) {
  const t = await getTranslations("settings");
  if (!preview) return null;

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
        {t("studentPreviewTitle")}
      </h2>
      <p className="mt-1 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
        {t("studentPreviewHint")}
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-medium" style={{ color: "var(--dashboard-text-muted)" }}>
            {t("studentPreviewOfficialName")}
          </dt>
          <dd>{preview.officialName}</dd>
        </div>
        {preview.avatarUrl && (
          <div>
            <dt className="font-medium" style={{ color: "var(--dashboard-text-muted)" }}>
              {t("profileAvatar")}
            </dt>
            <dd>
              <img
                src={preview.avatarUrl}
                alt=""
                className="mt-1 h-16 w-16 rounded-full object-cover"
              />
            </dd>
          </div>
        )}
        {preview.affiliations.length > 0 && (
          <div>
            <dt className="font-medium" style={{ color: "var(--dashboard-text-muted)" }}>
              {t("affiliationsSection")}
            </dt>
            <dd>
              <ul className="mt-1 list-inside list-disc space-y-1">
                {preview.affiliations.map((a, i) => (
                  <li key={i}>
                    {a.affiliation}
                    {a.titleAtAffiliation ? ` — ${a.titleAtAffiliation}` : ""}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {preview.contactEmail && (
          <div>
            <dt className="font-medium" style={{ color: "var(--dashboard-text-muted)" }}>
              {t("contactEmailStudent")}
            </dt>
            <dd>{preview.contactEmail}</dd>
          </div>
        )}
        {(preview.studentContact.office ||
          preview.studentContact.office_hours ||
          preview.studentContact.contact_url ||
          preview.studentContact.note) && (
          <div>
            <dt className="font-medium" style={{ color: "var(--dashboard-text-muted)" }}>
              {t("contactSection")}
            </dt>
            <dd className="mt-1 space-y-1 whitespace-pre-wrap">
              {preview.studentContact.office && (
                <p>
                  <span className="text-xs opacity-80">{t("contactOffice")}: </span>
                  {preview.studentContact.office}
                </p>
              )}
              {preview.studentContact.office_hours && (
                <p>
                  <span className="text-xs opacity-80">{t("contactOfficeHours")}: </span>
                  {preview.studentContact.office_hours}
                </p>
              )}
              {preview.studentContact.contact_url && (
                <p>
                  <span className="text-xs opacity-80">{t("contactUrl")}: </span>
                  {preview.studentContact.contact_url}
                </p>
              )}
              {preview.studentContact.note && (
                <p>
                  <span className="text-xs opacity-80">{t("contactNote")}: </span>
                  {preview.studentContact.note}
                </p>
              )}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
