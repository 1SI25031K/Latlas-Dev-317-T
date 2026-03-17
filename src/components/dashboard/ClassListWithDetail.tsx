"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
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

export function ClassListWithDetail({ classes }: ClassListWithDetailProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [openInEditMode, setOpenInEditMode] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const closeModal = () => {
    setSelectedClassId(null);
    setOpenInEditMode(false);
    setOpenDeleteConfirm(false);
  };

  const now = useMemo(() => new Date(), []);
  const upcomingClasses = useMemo(() => {
    const sorted = sortClassesByNextOccurrence(classes, now);
    return sorted
      .filter((c) => getNextOccurrence(c.schedule, now) !== null)
      .slice(0, UPCOMING_LIMIT);
  }, [classes, now]);

  return (
    <>
      {upcomingClasses.length > 0 && (
        <section className="mb-6">
          <h2
            className="mb-3 text-sm font-semibold uppercase tracking-wider"
            style={{ color: "var(--dashboard-text-muted)" }}
          >
            {t("upcomingClasses")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingClasses.map((c) => (
              <ClassCard
                key={c.id}
                classItem={c}
                onClick={() => {
                  setSelectedClassId(c.id);
                  setOpenInEditMode(false);
                  setOpenDeleteConfirm(false);
                }}
                nextAt={formatNextOccurrence(c.schedule, now, locale) ?? undefined}
                onEdit={() => {
                  setSelectedClassId(c.id);
                  setOpenInEditMode(true);
                  setOpenDeleteConfirm(false);
                }}
                onDelete={() => {
                  setSelectedClassId(c.id);
                  setOpenInEditMode(false);
                  setOpenDeleteConfirm(true);
                }}
              />
            ))}
          </div>
        </section>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <ClassCard
            key={c.id}
            classItem={c}
            onClick={() => {
              setSelectedClassId(c.id);
              setOpenInEditMode(false);
              setOpenDeleteConfirm(false);
            }}
            onEdit={() => {
              setSelectedClassId(c.id);
              setOpenInEditMode(true);
              setOpenDeleteConfirm(false);
            }}
            onDelete={() => {
              setSelectedClassId(c.id);
              setOpenInEditMode(false);
              setOpenDeleteConfirm(true);
            }}
          />
        ))}
      </div>
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
