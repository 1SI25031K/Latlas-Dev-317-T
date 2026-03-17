"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Class } from "@/types/database";
import { getClassIcon } from "@/lib/class-icon-options";
import { formatScheduleSummary } from "@/lib/format-schedule-display";

type ClassCardProps = {
  classItem: Class;
  onClick?: () => void;
  nextAt?: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ClassCard({ classItem, onClick, nextAt, onEdit, onDelete }: ClassCardProps) {
  const t = useTranslations("class");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const Icon = getClassIcon(classItem.icon_id);
  const accentColor = classItem.color_hex || "var(--dashboard-border)";
  const scheduleSummary = formatScheduleSummary(classItem.schedule, locale);
  const showMenu = onEdit != null || onDelete != null;

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const cardContent = (
    <>
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${accentColor}25` }}
        >
          {Icon && <Icon size={28} style={{ color: accentColor }} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold" style={{ color: "var(--dashboard-text)" }}>
            {classItem.name}
          </h3>
          {classItem.description && (
            <p className="mt-0.5 line-clamp-2 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
              {classItem.description}
            </p>
          )}
        </div>
      </div>
      <dl className="mt-2 space-y-1 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
        <div className="flex items-center gap-2">
          <dt className="font-medium">{t("accessCode")}:</dt>
          <dd className="font-mono">{classItem.access_code}</dd>
        </div>
        {scheduleSummary ? (
          <div className="flex items-center gap-2">
            <dt className="font-medium">{t("timeSlot")}:</dt>
            <dd>{scheduleSummary}</dd>
          </div>
        ) : null}
        {nextAt ? (
          <div className="flex items-center gap-2">
            <dt className="font-medium">{t("nextAt")}:</dt>
            <dd>{nextAt}</dd>
          </div>
        ) : null}
      </dl>
    </>
  );

  const cardInner = (
    <div
      className={`rounded-2xl border-l-4 border p-4 shadow-sm transition-shadow hover:shadow-md ${showMenu ? "pr-10" : ""}`}
      style={{
        backgroundColor: "var(--dashboard-card)",
        borderColor: "var(--dashboard-border)",
        borderLeftColor: accentColor,
        color: "var(--dashboard-text)",
      }}
    >
      {cardContent}
    </div>
  );

  const menuDropdown = showMenu && (
    <div className="absolute right-2 top-2 z-10" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((o) => !o);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-2xl transition-colors hover:bg-black/10"
        style={{ color: "var(--dashboard-text-muted)" }}
        aria-label={t("edit")}
      >
        <span className="flex flex-col gap-1">
          <span className="block h-1 w-1 rounded-full bg-current" />
          <span className="block h-1 w-1 rounded-full bg-current" />
          <span className="block h-1 w-1 rounded-full bg-current" />
        </span>
      </button>
      {menuOpen && (
        <div
          className="absolute right-0 top-full z-20 mt-1 min-w-[120px] rounded-2xl border py-1 shadow-lg"
          style={{
            backgroundColor: "var(--dashboard-card)",
            borderColor: "var(--dashboard-border)",
          }}
        >
          {onEdit && (
            <button
              type="button"
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-black/5"
              style={{ color: "var(--dashboard-text)" }}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onEdit();
              }}
            >
              {t("edit")}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-500/10"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDelete();
              }}
            >
              {t("deleteClass")}
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          className="w-full cursor-pointer rounded-2xl text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[var(--dashboard-card)]"
          style={{ padding: 0, border: "none", background: "none" }}
        >
          {cardInner}
        </button>
        {menuDropdown}
      </div>
    );
  }
  return (
    <div className="relative">
      {cardInner}
      {menuDropdown}
    </div>
  );
}
