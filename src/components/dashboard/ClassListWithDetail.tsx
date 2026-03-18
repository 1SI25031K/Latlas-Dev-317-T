"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";
import type { Class } from "@/types/database";
import { ClassCard } from "@/components/dashboard/ClassCard";
import { ClassDetailModal } from "@/components/dashboard/ClassDetailModal";
import {
  sortClassesByNextOccurrence,
  getNextOccurrence,
  formatNextOccurrence,
} from "@/lib/next-class-occurrence";

const UPCOMING_LIMIT = 6;

type ClassListWithDetailProps = {
  classes: Class[];
};

function localDateYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isTermEnded(schedule: Class["schedule"], now: Date): boolean {
  const te = schedule?.termEnd?.trim();
  if (!te) return false;
  return te < localDateYMD(now);
}

export function ClassListWithDetail({ classes }: ClassListWithDetailProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [openInEditMode, setOpenInEditMode] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [listOpen, setListOpen] = useState(true);
  const [endedOpen, setEndedOpen] = useState(false);

  const closeModal = () => {
    setSelectedClassId(null);
    setOpenInEditMode(false);
    setOpenDeleteConfirm(false);
  };

  const now = useMemo(() => new Date(), []);

  const { activeClasses, endedClasses } = useMemo(() => {
    const active: Class[] = [];
    const ended: Class[] = [];
    for (const c of classes) {
      if (isTermEnded(c.schedule, now)) ended.push(c);
      else active.push(c);
    }
    return { activeClasses: active, endedClasses: ended };
  }, [classes, now]);

  const upcomingClasses = useMemo(() => {
    const sorted = sortClassesByNextOccurrence(activeClasses, now);
    return sorted
      .filter((c) => getNextOccurrence(c.schedule, now) !== null)
      .slice(0, UPCOMING_LIMIT);
  }, [activeClasses, now]);

  const upcomingIds = useMemo(() => new Set(upcomingClasses.map((c) => c.id)), [upcomingClasses]);

  const listClasses = useMemo(
    () => activeClasses.filter((c) => !upcomingIds.has(c.id)),
    [activeClasses, upcomingIds],
  );

  const openDetail = useCallback((id: string) => {
    setSelectedClassId(id);
    setOpenInEditMode(false);
    setOpenDeleteConfirm(false);
  }, []);

  const openEdit = useCallback((id: string) => {
    setSelectedClassId(id);
    setOpenInEditMode(true);
    setOpenDeleteConfirm(false);
  }, []);

  const openDelete = useCallback((id: string) => {
    setSelectedClassId(id);
    setOpenInEditMode(false);
    setOpenDeleteConfirm(true);
  }, []);

  const muted = "var(--dashboard-text-muted)";

  function SectionHeader({
    sectionId,
    open,
    onToggle,
    title,
  }: {
    sectionId: string;
    open: boolean;
    onToggle: () => void;
    title: string;
  }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="mb-3 flex w-full items-center gap-2 rounded-xl py-1 text-left transition-opacity hover:opacity-90"
        style={{ color: muted }}
        aria-expanded={open}
        aria-controls={`${sectionId}-panel`}
      >
        <ChevronRight
          className="size-4 shrink-0 transition-transform duration-200 ease-out"
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            color: "var(--dashboard-text-muted)",
          }}
          aria-hidden
        />
        <h2 id={`${sectionId}-title`} className="text-sm font-semibold uppercase tracking-wider">
          {title}
        </h2>
      </button>
    );
  }

  function renderCards(items: Class[], showNextAt: boolean) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <ClassCard
            key={c.id}
            classItem={c}
            onClick={() => openDetail(c.id)}
            nextAt={showNextAt ? (formatNextOccurrence(c.schedule, now, locale) ?? undefined) : undefined}
            onEdit={() => openEdit(c.id)}
            onDelete={() => openDelete(c.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {upcomingClasses.length > 0 && (
        <section className="mb-6" aria-labelledby="dash-section-upcoming-title">
          <SectionHeader
            sectionId="dash-section-upcoming"
            open={upcomingOpen}
            onToggle={() => setUpcomingOpen((o) => !o)}
            title={t("sectionUpcoming")}
          />
          {upcomingOpen ? (
            <div id="dash-section-upcoming-panel" role="region" aria-labelledby="dash-section-upcoming-title">
              {renderCards(upcomingClasses, true)}
            </div>
          ) : null}
        </section>
      )}

      {listClasses.length > 0 && (
        <section className="mb-6" aria-labelledby="dash-section-list-title">
          <SectionHeader
            sectionId="dash-section-list"
            open={listOpen}
            onToggle={() => setListOpen((o) => !o)}
            title={t("sectionAllClasses")}
          />
          {listOpen ? (
            <div id="dash-section-list-panel" role="region" aria-labelledby="dash-section-list-title">
              {renderCards(listClasses, false)}
            </div>
          ) : null}
        </section>
      )}

      {endedClasses.length > 0 && (
        <section className="mb-6" aria-labelledby="dash-section-ended-title">
          <SectionHeader
            sectionId="dash-section-ended"
            open={endedOpen}
            onToggle={() => setEndedOpen((o) => !o)}
            title={t("sectionEndedClasses")}
          />
          {endedOpen ? (
            <div id="dash-section-ended-panel" role="region" aria-labelledby="dash-section-ended-title">
              {renderCards(endedClasses, false)}
            </div>
          ) : null}
        </section>
      )}

      {selectedClassId != null && (
        <ClassDetailModal
          classId={selectedClassId}
          classes={classes}
          onClose={closeModal}
          initialEditMode={openInEditMode}
          initialDeleteConfirm={openDeleteConfirm}
        />
      )}
    </>
  );
}
